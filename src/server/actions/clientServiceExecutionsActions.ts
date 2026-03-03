"use server";

import { db } from "@/db";
import {
  entrepriseRoles,
  entreprises,
  serviceEntreprises,
} from "@/db/schema/entreprises";
import { userAdhesions } from "@/db/schema/users";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
  tacheListesTemplates,
} from "@/db/schema/services";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { siretSchema } from "@/zod-schemas/siret.schema";
import { getSession } from "@/server/auth/get-session";
import {
  findEntrepriseBySiret,
  getClientPrestataires,
  getExecutionsWithPrixByPrestationId,
  getPrestatairesForService,
  getSitesCouvertsParPrestataire,
} from "@/server/queries/clientServiceExecutions.query";
import { getUserAdhesion } from "@/server/queries/userAdhesions.query";
import { getPrestationById } from "@/server/queries/clientServices.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { resolveUserEffectiveRoleOnSite } from "@/server/utils/userSiteAttributions.utils";
import { onClientServiceChanged } from "@/server/utils/clientServiceOccurrences.utils";
import { insertExecutionFormSchema, updateExecutionFormSchema } from "@/zod-schemas/clientServiceExecutions.schema";
import { normalizeForSubmit, upper } from "@/zod-helpers/normalize";
import { and, count, eq, lt, ne } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur peut gérer une prestation sur un site donné.
 * Retourne { allowed, isPlateforme } pour éviter un second appel getUserPlateformeAdhesion.
 */
async function canManagePrestation(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<{ allowed: boolean; isPlateforme: boolean }> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return { allowed: true, isPlateforme: true };

  const siteRole = await resolveUserEffectiveRoleOnSite({
    userId,
    siteId,
    entrepriseId,
  });
  return { allowed: siteRole === "responsable_site", isPlateforme: false };
}

/**
 * Vérifie que l'utilisateur a accès à l'entreprise (adhésion ou plateforme).
 */
async function hasAccessToEntreprise(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const platformRole = await getUserPlateformeAdhesion(userId);
  if (platformRole?.role) return true;

  const adhesion = await db.query.userAdhesions.findFirst({
    where: and(
      eq(userAdhesions.userId, userId),
      eq(userAdhesions.entrepriseId, entrepriseId),
    ),
  });
  return !!adhesion;
}

// ==================== GET PRESTATAIRES FOR SERVICE ====================

export const getPrestatairesForServiceAction = actionClient
  .metadata({ actionName: "getPrestatairesForServiceAction" })
  .inputSchema(
    z.object({
      serviceId: z.string().uuid("ID du service invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      modeCommercial: z.enum(["direct", "intermediaire_fm4all"]),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier l'accès à l'entreprise (un seul appel pour plateforme + adhesion)
    const platformRole = await getUserPlateformeAdhesion(currentUser.id);
    const isPlateforme = !!platformRole?.role;

    if (!isPlateforme) {
      const adhesion = await db.query.userAdhesions.findFirst({
        where: and(
          eq(userAdhesions.userId, currentUser.id),
          eq(userAdhesions.entrepriseId, parsedInput.entrepriseId),
        ),
      });
      if (!adhesion) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Mode intermédiaire FM4ALL géré par la plateforme → catalogue complet
    // Mode direct → uniquement les prestataires déjà liés à ce client
    const clientEntrepriseId =
      parsedInput.modeCommercial === "intermediaire_fm4all" && isPlateforme
        ? undefined
        : parsedInput.entrepriseId;

    const prestataires = await getPrestatairesForService({
      serviceId: parsedInput.serviceId,
      clientEntrepriseId,
    });
    return { prestataires };
  });

// ==================== FIND ENTREPRISE BY SIRET ====================

export const findEntrepriseBySiretAction = actionClient
  .metadata({ actionName: "findEntrepriseBySiretAction" })
  .inputSchema(
    z.object({
      siret: siretSchema("Le SIRET est invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // siretSchema formate en "xxx xxx xxx xxxxx" — on normalise en digits purs pour la recherche DB
    const siretRaw = parsedInput.siret.replace(/\s/g, "");
    const entreprise = await findEntrepriseBySiret(siretRaw);
    return { entreprise }; // null si non trouvé
  });

// ==================== CREATE OR LINK PRESTATAIRE ====================

export const createOrLinkPrestataireAction = actionClient
  .metadata({ actionName: "createOrLinkPrestataireAction" })
  .inputSchema(
    z.object({
      siret: siretSchema("Le SIRET est invalide"),
      nom: z.string().min(1, "Nom de l'entreprise requis").transform((v) => upper(v)),
      serviceId: z.string().uuid("ID du service invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      prenomContact: z.string().optional(),
      nomContact: z.string().optional(),
      emailContact: z.string().email("Email invalide").optional().or(z.literal("")),
      phoneContact: z.string().optional(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier que l'utilisateur a accès à l'entreprise cliente
    const hasAccess = await hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId);
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const { nom, serviceId, prenomContact, nomContact, emailContact, phoneContact } =
      parsedInput;
    // siretSchema formate en "xxx xxx xxx xxxxx" — on normalise en digits purs pour la DB
    const siret = parsedInput.siret.replace(/\s/g, "");

    const serviceEntrepriseId = await db.transaction(async (tx) => {
      // 1. Trouver ou créer l'entreprise
      let entrepriseId: string;
      const existing = await findEntrepriseBySiret(siret);

      if (existing) {
        entrepriseId = existing.id;
      } else {
        const [created] = await tx
          .insert(entreprises)
          .values({
            siret,
            nom,
            prenomContact: prenomContact || null,
            nomContact: nomContact || null,
            emailContact: emailContact || null,
            phoneContact: phoneContact || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })
          .returning({ id: entreprises.id });
        entrepriseId = created.id;
      }

      // 2. S'assurer que le rôle prestataire existe
      await tx
        .insert(entrepriseRoles)
        .values({ entrepriseId, role: "prestataire", createdById: currentUser.id, updatedById: currentUser.id })
        .onConflictDoNothing();

      // 3. S'assurer que le lien service_entreprises existe (réactiver si inactif)
      const [seRow] = await tx
        .insert(serviceEntreprises)
        .values({ entrepriseId, serviceId, actif: true, createdById: currentUser.id, updatedById: currentUser.id })
        .onConflictDoUpdate({
          target: [serviceEntreprises.entrepriseId, serviceEntreprises.serviceId],
          set: { actif: true, updatedById: currentUser.id },
        })
        .returning({ id: serviceEntreprises.id });

      return seRow.id;
    });

    return { serviceEntrepriseId };
  });

// ==================== INSERT EXECUTION WITH PRIX ====================

export const insertExecutionWithPrixAction = actionClient
  .metadata({ actionName: "insertExecutionWithPrixAction" })
  .inputSchema(insertExecutionFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Normaliser les champs top-level (string → number/Date/null)
    // Note: les items du tableau `prix` conservent une conversion manuelle (normalizeForSubmit ne gère pas les arrays imbriqués)
    const normalized = normalizeForSubmit(parsedInput, {
      requiredNumbers: ["priorite"] as const,
      requiredDates: ["dateDebutValidite"] as const,
      optionalDates: ["dateFinValidite"] as const,
      optionalStrings: ["assigneeUserIdDefault"] as const,
    });

    const { prestationId, entrepriseId, siteId } = normalized;

    // Vérifier les permissions (retourne aussi isPlateforme pour éviter un second appel)
    const { allowed: canManage, isPlateforme } = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que la prestation appartient bien à l'entreprise
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Guard : en mode intermédiaire, seul un utilisateur plateforme peut créer une exécution
    if (prestation.modeCommercial === "intermediaire_fm4all" && !isPlateforme) {
      throw errors.forbidden(
        "En mode intermédiaire FM4ALL, seule l'équipe FM4ALL peut configurer les prestataires de cette prestation.",
      );
    }

    const isIntermedaire =
      prestation.modeCommercial === "intermediaire_fm4all" && isPlateforme;

    // Transaction : créer l'exécution + les prix
    await db.transaction(async (tx) => {
      const [execution] = await tx
        .insert(clientServiceExecutions)
        .values({
          clientServiceId: prestationId,
          siteId,
          serviceEntrepriseId: normalized.serviceEntrepriseId,
          dateDebutValidite: normalized.dateDebutValidite,
          dateFinValidite: normalized.dateFinValidite,
          priorite: normalized.priorite,
          assigneeUserIdDefault: normalized.assigneeUserIdDefault ?? null,
          actif: true,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      if (!execution) {
        throw errors.internal("Échec de la création de l'exécution.");
      }

      // Insérer les lignes de prix
      await tx.insert(clientServiceExecutionPrix).values(
        parsedInput.prix.map((p) => {
          if (isIntermedaire) {
            // Mode intermédiaire FM4ALL : stocker coût, marge, et recalculer montant côté serveur
            const cout =
              p.coutPrestataireHt && p.coutPrestataireHt !== ""
                ? Number(p.coutPrestataireHt)
                : 0;
            const marge =
              p.margePourcent && p.margePourcent !== ""
                ? Math.round(Number(p.margePourcent))
                : 0;
            const montant = cout * (1 + marge / 100);
            return {
              executionId: execution.id,
              typePrix: p.typePrix,
              montantHt: Math.round(montant * 100),
              coutPrestataireHt: Math.round(cout * 100),
              margePourcent: marge,
              periodeFacturation: p.periodeFacturation ?? null,
              nbOccurrencesIncluses:
                p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                  ? Number(p.nbOccurrencesIncluses)
                  : null,
              actif: true,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            };
          }
          // Mode direct (ou non-plateforme sur intermédiaire) : stocker uniquement montantHt
          return {
            executionId: execution.id,
            typePrix: p.typePrix,
            montantHt: Math.round(Number(p.montantHt) * 100),
            coutPrestataireHt: null,
            margePourcent: null,
            periodeFacturation: p.periodeFacturation ?? null,
            nbOccurrencesIncluses:
              p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                ? Number(p.nbOccurrencesIncluses)
                : null,
            actif: true,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          };
        }),
      );
    });

    // Resync : régénère la fenêtre glissante pour assigner l'exécution + snapshot des tâches
    if (prestation.statut === "actif" && prestation.modePlanning === "planifie") {
      await onClientServiceChanged({ clientServiceId: prestationId, now: new Date() });
    }

    // Recharger les exécutions mises à jour
    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return { message: "Prestataire ajouté avec succès.", executions: updatedExecutions };
  });

// ==================== TOGGLE EXECUTION ACTIF ====================

export const toggleExecutionActifAction = actionClient
  .metadata({ actionName: "toggleExecutionActifAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      actif: z.boolean(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId } = parsedInput;

    // Charger la prestation pour obtenir le siteId
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) {
      throw errors.notFound("Exécution");
    }

    await db
      .update(clientServiceExecutions)
      .set({ actif: parsedInput.actif, updatedById: currentUser.id })
      .where(eq(clientServiceExecutions.id, executionId));

    // Resync : régénère la fenêtre glissante pour assigner l'exécution + snapshot des tâches
    if (parsedInput.actif && prestation.statut === "actif" && prestation.modePlanning === "planifie") {
      await onClientServiceChanged({ clientServiceId: prestationId, now: new Date() });
    }

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: parsedInput.actif ? "Exécution activée." : "Exécution désactivée.",
      executions: updatedExecutions,
    };
  });

// ==================== DELETE EXECUTION ====================

export const deleteExecutionAction = actionClient
  .metadata({ actionName: "deleteExecutionAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId } = parsedInput;

    // Charger la prestation pour obtenir le siteId
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour gérer les prestataires.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) {
      throw errors.notFound("Exécution");
    }

    // Supprimer (cascade sur les prix via FK)
    await db
      .delete(clientServiceExecutions)
      .where(eq(clientServiceExecutions.id, executionId));

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return { message: "Prestataire retiré avec succès.", executions: updatedExecutions };
  });

// ==================== GET EXECUTIONS ====================

export const getExecutionsAction = actionClient
  .metadata({ actionName: "getExecutionsAction" })
  .inputSchema(
    z.object({
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const prestation = await getPrestationById(parsedInput.prestationId);
    if (!prestation || prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const executions = await getExecutionsWithPrixByPrestationId(
      parsedInput.prestationId,
    );
    return { executions };
  });

// ==================== UPDATE EXECUTION CHECKLIST ====================

export const updateExecutionTacheListeAction = actionClient
  .metadata({ actionName: "updateExecutionTacheListeAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      tacheListeTemplateId: z.string().uuid().nullable(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId, tacheListeTemplateId } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier la checklist.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) throw errors.notFound("Exécution");

    // Si un pack est fourni, vérifier qu'il existe et est compatible avec le service
    if (tacheListeTemplateId) {
      const [pack] = await db
        .select({ serviceId: tacheListesTemplates.serviceId })
        .from(tacheListesTemplates)
        .where(eq(tacheListesTemplates.id, tacheListeTemplateId))
        .limit(1);

      if (!pack) throw errors.notFound("Pack de tâches");
      if (pack.serviceId !== prestation.serviceId) {
        throw errors.conflict(
          "Ce pack de tâches n'est pas compatible avec le service de cette prestation.",
        );
      }
    }

    const [updated] = await db
      .update(clientServiceExecutions)
      .set({
        tacheListeTemplateId,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceExecutions.id, executionId))
      .returning();

    if (!updated) throw errors.internal("Échec de la mise à jour.");

    // Resync les occurrences futures
    await onClientServiceChanged({
      clientServiceId: prestationId,
      now: new Date(),
    });

    return { execution: updated };
  });

// ==================== UPDATE EXECUTION ====================

export const updateExecutionAction = actionClient
  .metadata({ actionName: "updateExecutionAction" })
  .inputSchema(updateExecutionFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId } = parsedInput;

    // Charger la prestation
    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    // Vérifier les permissions
    const canManage = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage.allowed) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier cette exécution.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [existingExecution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!existingExecution) {
      throw errors.notFound("Exécution");
    }

    // Guard dateDebutValidite : vérifier qu'aucune occurrence non-annulée n'existe avant la nouvelle date
    const newDateDebut = new Date(parsedInput.dateDebutValidite);
    const [conflict] = await db
      .select({ count: count() })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.executionId, executionId),
          lt(clientServiceOccurrences.dateDebutPrevue, newDateDebut),
          ne(clientServiceOccurrences.statut, "annulee"),
        ),
      );

    if (conflict && conflict.count > 0) {
      throw errors.conflict(
        `Des interventions non-annulées existent avant la date choisie (${conflict.count} intervention(s)). Modifiez-les d'abord ou choisissez une date antérieure.`,
      );
    }

    // Mode intermédiaire : uniquement plateforme + modeCommercial=intermediaire_fm4all
    const isIntermedaire =
      prestation.modeCommercial === "intermediaire_fm4all" && canManage.isPlateforme;

    await db.transaction(async (tx) => {
      // 1. Soft-delete toutes les lignes prix actives
      await tx
        .update(clientServiceExecutionPrix)
        .set({ actif: false, updatedById: currentUser.id })
        .where(eq(clientServiceExecutionPrix.executionId, executionId));

      // 2. Insérer les nouvelles lignes prix
      await tx.insert(clientServiceExecutionPrix).values(
        parsedInput.prix.map((p) => {
          if (isIntermedaire) {
            const cout =
              p.coutPrestataireHt && p.coutPrestataireHt !== ""
                ? Number(p.coutPrestataireHt)
                : 0;
            const marge =
              p.margePourcent && p.margePourcent !== ""
                ? Math.round(Number(p.margePourcent))
                : 0;
            const montant = cout * (1 + marge / 100);
            return {
              executionId,
              typePrix: p.typePrix,
              montantHt: Math.round(montant * 100),
              coutPrestataireHt: Math.round(cout * 100),
              margePourcent: marge,
              periodeFacturation: p.periodeFacturation ?? null,
              nbOccurrencesIncluses:
                p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                  ? Number(p.nbOccurrencesIncluses)
                  : null,
              actif: true,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            };
          }
          return {
            executionId,
            typePrix: p.typePrix,
            montantHt: Math.round(Number(p.montantHt) * 100),
            coutPrestataireHt: null,
            margePourcent: null,
            periodeFacturation: p.periodeFacturation ?? null,
            nbOccurrencesIncluses:
              p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
                ? Number(p.nbOccurrencesIncluses)
                : null,
            actif: true,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          };
        }),
      );

      // 3. Mettre à jour l'en-tête de l'exécution
      await tx
        .update(clientServiceExecutions)
        .set({
          priorite: Number(parsedInput.priorite),
          dateDebutValidite: newDateDebut,
          dateFinValidite:
            parsedInput.dateFinValidite && parsedInput.dateFinValidite !== ""
              ? new Date(parsedInput.dateFinValidite)
              : null,
          updatedById: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(clientServiceExecutions.id, executionId));
    });

    // Resync : régénère la fenêtre glissante
    if (prestation.statut === "actif" && prestation.modePlanning === "planifie") {
      await onClientServiceChanged({ clientServiceId: prestationId, now: new Date() });
    }

    const updatedExecutions = await getExecutionsWithPrixByPrestationId(prestationId);
    return { message: "Exécution mise à jour avec succès.", executions: updatedExecutions };
  });

// ==================== GET CLIENT PRESTATAIRES ====================

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs). Utilisé dans TicketFormDialog.
 */
export const getClientPrestatairesAction = actionClient
  .metadata({ actionName: "getClientPrestatairesAction" })
  .inputSchema(
    z.object({ clientEntrepriseId: z.uuid() }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.clientEntrepriseId,
    });
    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const prestataires = await getClientPrestataires(parsedInput.clientEntrepriseId);
    return { prestataires };
  });

// ==================== MES SITES CLIENTS (Posture Prestataire) ====================

export const getMesSitesClientsAction = actionClient
  .metadata({ actionName: "getMesSitesClientsAction" })
  .inputSchema(z.object({ entrepriseId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier l'adhésion à l'entreprise prestataire
    const adhesion = await db.query.userAdhesions.findFirst({
      where: and(
        eq(userAdhesions.userId, currentUser.id),
        eq(userAdhesions.entrepriseId, parsedInput.entrepriseId),
      ),
    });
    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Vérifier que l'entreprise a bien le rôle prestataire
    const rolePrest = await db.query.entrepriseRoles.findFirst({
      where: and(
        eq(entrepriseRoles.entrepriseId, parsedInput.entrepriseId),
        eq(entrepriseRoles.role, "prestataire"),
      ),
    });
    if (!rolePrest) {
      throw errors.forbidden("Cette entreprise n'est pas prestataire.");
    }

    const sites = await getSitesCouvertsParPrestataire(parsedInput.entrepriseId);

    return { sites };
  });

// ==================== UPDATE EXECUTION ASSIGNEE DEFAULT ====================

export const updateExecutionAssigneeDefaultAction = actionClient
  .metadata({ actionName: "updateExecutionAssigneeDefaultAction" })
  .inputSchema(
    z.object({
      executionId: z.string().uuid("ID de l'exécution invalide"),
      prestationId: z.string().uuid("ID de la prestation invalide"),
      entrepriseId: z.string().uuid("ID de l'entreprise invalide"),
      assigneeUserIdDefault: z.string().uuid().or(z.literal("")).nullable().optional(),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId } = parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const { allowed: canManage } = await canManagePrestation(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier cette exécution.",
      );
    }

    const [execution] = await db
      .select({ id: clientServiceExecutions.id })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) throw errors.notFound("Exécution");

    const { assigneeUserIdDefault } = normalizeForSubmit(parsedInput, {
      optionalStrings: ["assigneeUserIdDefault"] as const,
    });

    const [updated] = await db
      .update(clientServiceExecutions)
      .set({
        assigneeUserIdDefault,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceExecutions.id, executionId))
      .returning({ id: clientServiceExecutions.id, assigneeUserIdDefault: clientServiceExecutions.assigneeUserIdDefault });

    if (!updated) throw errors.internal("Échec de la mise à jour.");

    return { execution: updated };
  });
