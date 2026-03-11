"use server";

import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import {
  clientPrestataireRelations,
  entrepriseInvitations,
  entrepriseRoles,
  entreprises,
  serviceEntreprises,
} from "@/db/schema/entreprises";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePrixAppliques,
  services,
  tacheListesTemplates,
} from "@/db/schema/services";
import {
  userClientAdhesions,
  userPrestataireAdhesions,
} from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { env } from "@/lib/env";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { sendEmailDirect } from "@/server/email/mailgunDirect";
import {
  findEntrepriseBySiret,
  getClientPrestataires,
  getClientPrestatairesAvecDetails,
  getExecutionsWithPrixByPrestationId,
  getMesClients,
  getPrestatairesForService,
  getSitesCouvertsParPrestataire,
} from "@/server/queries/clientServiceExecutions.query";
import { getPrestationById } from "@/server/queries/clientServices.query";
import { getAllServices } from "@/server/queries/services.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
  hasAccessToEntreprise,
} from "@/server/queries/userAdhesions.query";
import { onClientServiceChanged } from "@/server/utils/clientServiceOccurrences.utils";
import {
  getActivePosture,
  getEffectivePlateformeRole,
  resolvePostureAwareSiteRole,
} from "@/server/utils/permissions.utils";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  createOrLinkClientSchema,
  createOrLinkPrestataireSchema,
  createOrLinkPrestataireSimpleSchema,
  deleteExecutionSchema,
  findEntrepriseBySiretSchema,
  getClientPrestatairesSchema,
  getExecutionsSchema,
  getMesClientsSchema,
  getMesPrestatairesSchema,
  getMesSitesClientsSchema,
  getPrestatairesForServiceSchema,
  insertExecutionFormSchema,
  toggleExecutionActifSchema,
  updateExecutionFormSchema,
  updateExecutionModePilotageSchema,
  updateExecutionTacheListeSchema,
} from "@/zod-schemas/clientServiceExecutions.schema";
import { and, count, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// ==================== HELPERS ====================

/**
 * Vérifie si l'utilisateur peut créer ou modifier une exécution.
 * Règles : plateforme ✅ | client admin ✅ | prestataire admin ✅ | responsable_site ✅
 * Retourne { allowed, isPlateforme, isAdmin } pour éviter des appels supplémentaires.
 */
async function canManageExecution(
  userId: string,
  entrepriseId: string,
  siteId: string,
): Promise<{ allowed: boolean; isPlateforme: boolean; isAdmin: boolean }> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role)
    return { allowed: true, isPlateforme: true, isAdmin: false };

  const posture = await getActivePosture();

  if (posture === "client") {
    const clientAdhesion = await getUserClientAdhesion({
      userId,
      entrepriseId,
    });
    if (clientAdhesion?.role === "admin") {
      return { allowed: true, isPlateforme: false, isAdmin: true };
    }
  } else if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    if (prestataireAdhesion?.role === "admin") {
      return { allowed: true, isPlateforme: false, isAdmin: true };
    }
  }

  const siteRole = await resolvePostureAwareSiteRole({
    userId,
    siteId,
    entrepriseId,
  });
  return {
    allowed: siteRole === "responsable_site",
    isPlateforme: false,
    isAdmin: false,
  };
}

/**
 * Vérifie si l'utilisateur peut activer/désactiver ou supprimer une exécution.
 * Règles : plateforme ✅ | client admin ✅ | prestataire admin ✅
 * (responsable_site ne suffit PAS pour ces opérations)
 */
async function canDisableOrDeleteExecution(
  userId: string,
  entrepriseId: string,
): Promise<boolean> {
  const platformRole = await getEffectivePlateformeRole(userId);
  if (platformRole?.role) return true;

  const posture = await getActivePosture();

  if (posture === "client") {
    const clientAdhesion = await getUserClientAdhesion({
      userId,
      entrepriseId,
    });
    return clientAdhesion?.role === "admin";
  }

  if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({ userId });
    return prestataireAdhesion?.role === "admin";
  }

  return false;
}

/**
 * Valide que le modePilotage choisi est compatible avec le statut "fantôme" des entreprises.
 * Une entreprise est fantôme si elle n'a pas d'admin actif sur la plateforme.
 *
 * Règles :
 * - client fantôme → seul "prestataire" est autorisé (personne côté client pour piloter)
 * - prestataire fantôme → seul "client" est autorisé
 * - les deux actifs → tous les modes sont possibles
 */
async function validateModePilotage(
  modePilotage: string,
  clientEntrepriseId: string,
  prestataireEntrepriseId: string | null,
): Promise<void> {
  // Vérifier si le client a un admin actif
  const clientAdminRows = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.entrepriseId, clientEntrepriseId),
      eq(userClientAdhesions.role, "admin"),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  const clientGhost = !clientAdminRows;

  // Vérifier si le prestataire a un admin actif (si l'entreprise est sur la plateforme)
  let prestataireGhost = false;
  if (prestataireEntrepriseId) {
    const seRow = await db
      .select({ entrepriseId: serviceEntreprises.entrepriseId })
      .from(serviceEntreprises)
      .where(eq(serviceEntreprises.id, prestataireEntrepriseId))
      .limit(1);
    const seEntrepriseId = seRow[0]?.entrepriseId;

    if (seEntrepriseId) {
      const prestataireAdminRows =
        await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.entrepriseId, seEntrepriseId),
            eq(userPrestataireAdhesions.role, "admin"),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
      prestataireGhost = !prestataireAdminRows;
    }
  } else {
    // Pas de serviceEntrepriseId = prestataire non défini ou externe = fantôme
    prestataireGhost = true;
  }

  if (clientGhost && modePilotage !== "prestataire") {
    throw errors.conflict(
      "Le client n'a pas de compte actif sur la plateforme : seul le mode 'prestataire' est possible.",
    );
  }

  if (prestataireGhost && modePilotage !== "client") {
    throw errors.conflict(
      "Le prestataire n'a pas de compte actif sur la plateforme : seul le mode 'client' est possible.",
    );
  }
}

// ==================== GET PRESTATAIRES FOR SERVICE ====================

export const getPrestatairesForServiceAction = actionClient
  .metadata({ actionName: "getPrestatairesForServiceAction" })
  .inputSchema(getPrestatairesForServiceSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier l'accès à l'entreprise (un seul appel pour plateforme + adhesion)
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    const isPlateforme = !!platformRole?.role;

    if (!isPlateforme) {
      const canAccess = await hasAccessToEntreprise(
        currentUser.id,
        parsedInput.entrepriseId,
      );
      if (!canAccess)
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
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
  .inputSchema(findEntrepriseBySiretSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // siretSchema formate en "xxx xxx xxx xxxxx" — on normalise en digits purs pour la recherche DB
    const siretRaw = parsedInput.siret.replace(/\s/g, "");
    const entreprise = await findEntrepriseBySiret(siretRaw);

    // Empêcher un client d'ajouter sa propre entreprise comme prestataire
    if (
      entreprise &&
      parsedInput.clientEntrepriseId &&
      entreprise.id === parsedInput.clientEntrepriseId
    ) {
      return {
        entreprise: null,
        alreadyLinked: false,
        hasPrestataireRole: false,
        existingServices: [],
        hasActiveAdmin: false,
        isSelf: true,
      };
    }

    // Si clientEntrepriseId fourni, vérifier si la relation existe déjà
    let alreadyLinked = false;
    if (entreprise && parsedInput.clientEntrepriseId) {
      const existing = await db.query.clientPrestataireRelations.findFirst({
        where: and(
          eq(
            clientPrestataireRelations.clientEntrepriseId,
            parsedInput.clientEntrepriseId,
          ),
          eq(clientPrestataireRelations.prestataireEntrepriseId, entreprise.id),
        ),
      });
      alreadyLinked = !!existing;
    }

    // Vérifier si l'entreprise a déjà un rôle prestataire
    let hasPrestataireRole = false;
    let existingServices: Array<{ id: string; nom: string }> = [];
    let hasActiveAdmin = false;
    if (entreprise) {
      const prestataireRole = await db.query.entrepriseRoles.findFirst({
        where: and(
          eq(entrepriseRoles.entrepriseId, entreprise.id),
          eq(entrepriseRoles.role, "prestataire"),
        ),
      });
      hasPrestataireRole = !!prestataireRole;

      if (hasPrestataireRole) {
        existingServices = await db
          .select({ id: services.id, nom: services.nom })
          .from(serviceEntreprises)
          .innerJoin(services, eq(serviceEntreprises.serviceId, services.id))
          .where(eq(serviceEntreprises.entrepriseId, entreprise.id))
          .orderBy(services.nom);

        // Un admin actif = le prestataire gère lui-même son profil → client ne peut pas modifier
        const activeAdmin = await db.query.userPrestataireAdhesions.findFirst({
          where: and(
            eq(userPrestataireAdhesions.entrepriseId, entreprise.id),
            eq(userPrestataireAdhesions.role, "admin"),
            eq(userPrestataireAdhesions.statut, "actif"),
          ),
        });
        hasActiveAdmin = !!activeAdmin;
      }
    }

    return {
      entreprise,
      alreadyLinked,
      hasPrestataireRole,
      existingServices,
      hasActiveAdmin,
      isSelf: false,
    };
  });

// ==================== CREATE OR LINK PRESTATAIRE ====================

export const createOrLinkPrestataireAction = actionClient
  .metadata({ actionName: "createOrLinkPrestataireAction" })
  .inputSchema(createOrLinkPrestataireSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier que l'utilisateur a accès à l'entreprise cliente avec au moins rôle manager
    const platformRole = await getEffectivePlateformeRole(currentUser.id);
    if (!platformRole?.role) {
      const adhesion = await getUserClientAdhesion({
        userId: currentUser.id,
        entrepriseId: parsedInput.entrepriseId,
      });
      if (!adhesion) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
      if (adhesion.role === "collaborateur") {
        throw errors.forbidden(
          "Vous devez être au moins manager pour ajouter un prestataire.",
        );
      }
    }

    const {
      nom,
      serviceIds,
      prenomContact,
      nomContact,
      emailContact,
      phoneContact,
    } = parsedInput;
    // siretSchema formate en "xxx xxx xxx xxxxx" — on normalise en digits purs pour la DB
    const siret = parsedInput.siret.replace(/\s/g, "");

    const { prestataireEntrepriseId, prestataireNom } = await db.transaction(
      async (tx) => {
        // 1. Trouver ou créer l'entreprise
        let entrepriseId: string;
        let entrepriseNom: string;
        const existing = await findEntrepriseBySiret(siret);

        if (existing) {
          entrepriseId = existing.id;
          entrepriseNom = existing.nom;
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
            .returning({ id: entreprises.id, nom: entreprises.nom });
          entrepriseId = created.id;
          entrepriseNom = created.nom;
        }

        // Self-link guard : un client ne peut pas s'ajouter lui-même comme prestataire
        if (entrepriseId === parsedInput.entrepriseId) {
          throw errors.conflict(
            "Une entreprise ne peut pas être son propre prestataire.",
          );
        }

        // 2. S'assurer que le rôle prestataire existe
        const existingRole = await tx.query.entrepriseRoles.findFirst({
          where: and(
            eq(entrepriseRoles.entrepriseId, entrepriseId),
            eq(entrepriseRoles.role, "prestataire"),
          ),
        });
        if (!existingRole) {
          await tx.insert(entrepriseRoles).values({
            entrepriseId,
            role: "prestataire",
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }

        // 3. Mettre à jour les services
        if (serviceIds.length > 0) {
          if (existingRole) {
            // Prestataire géré par le client (pas d'admin actif) : remplacer les services
            // Guard serveur : ne jamais modifier les services d'un prestataire avec admin actif
            const activeAdmin =
              await tx.query.userPrestataireAdhesions.findFirst({
                where: and(
                  eq(userPrestataireAdhesions.entrepriseId, entrepriseId),
                  eq(userPrestataireAdhesions.role, "admin"),
                  eq(userPrestataireAdhesions.statut, "actif"),
                ),
              });
            if (!activeAdmin) {
              await tx
                .delete(serviceEntreprises)
                .where(eq(serviceEntreprises.entrepriseId, entrepriseId));
              await tx.insert(serviceEntreprises).values(
                serviceIds.map((serviceId) => ({
                  entrepriseId,
                  serviceId,
                  actif: true,
                  createdById: currentUser.id,
                  updatedById: currentUser.id,
                })),
              );
            }
          } else {
            // Nouvelle entreprise ou entreprise sans rôle prestataire : upsert
            for (const serviceId of serviceIds) {
              await tx
                .insert(serviceEntreprises)
                .values({
                  entrepriseId,
                  serviceId,
                  actif: true,
                  createdById: currentUser.id,
                  updatedById: currentUser.id,
                })
                .onConflictDoUpdate({
                  target: [
                    serviceEntreprises.entrepriseId,
                    serviceEntreprises.serviceId,
                  ],
                  set: { actif: true, updatedById: currentUser.id },
                });
            }
          }
        }

        // 4. Créer la relation client↔prestataire persistante
        await tx
          .insert(clientPrestataireRelations)
          .values({
            clientEntrepriseId: parsedInput.entrepriseId,
            prestataireEntrepriseId: entrepriseId,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })
          .onConflictDoNothing();

        return {
          prestataireEntrepriseId: entrepriseId,
          prestataireNom: entrepriseNom,
        };
      },
    );

    return { entrepriseId: prestataireEntrepriseId, nom: prestataireNom };
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
    });

    const { prestationId, entrepriseId, siteId } = normalized;

    // Vérifier les permissions (retourne aussi isPlateforme pour éviter un second appel)
    const { allowed: canManage, isPlateforme } = await canManageExecution(
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

    // Prestataire : vérifier que serviceEntrepriseId appartient à leur entreprise
    if (!isPlateforme) {
      const activePosture = await getActivePosture();
      if (activePosture === "prestataire") {
        const prestataireAdhesion = await getUserPrestataireAdhesion({
          userId: currentUser.id,
        });
        if (prestataireAdhesion) {
          const [se] = await db
            .select({ entrepriseId: serviceEntreprises.entrepriseId })
            .from(serviceEntreprises)
            .where(eq(serviceEntreprises.id, normalized.serviceEntrepriseId))
            .limit(1);
          if (!se || se.entrepriseId !== prestataireAdhesion.entrepriseId) {
            throw errors.forbidden(
              "Vous ne pouvez ajouter que les prestataires de votre entreprise.",
            );
          }
        }
      }
    }

    // Valider modePilotage selon le statut fantôme des entreprises
    await validateModePilotage(
      parsedInput.modePilotage,
      entrepriseId,
      normalized.serviceEntrepriseId,
    );

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
          modePilotage: parsedInput.modePilotage,
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
    if (
      prestation.statut === "actif" &&
      prestation.modePlanning === "planifie"
    ) {
      await onClientServiceChanged({
        clientServiceId: prestationId,
        now: new Date(),
      });
    }

    // Recharger les exécutions mises à jour
    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: "Prestataire ajouté avec succès.",
      executions: updatedExecutions,
    };
  });

// ==================== TOGGLE EXECUTION ACTIF ====================

export const toggleExecutionActifAction = actionClient
  .metadata({ actionName: "toggleExecutionActifAction" })
  .inputSchema(toggleExecutionActifSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
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

    // Vérifier les permissions (admin uniquement pour activer/désactiver)
    const canDisable = await canDisableOrDeleteExecution(
      currentUser.id,
      entrepriseId,
    );
    if (!canDisable) {
      throw errors.forbidden(
        "Seul un administrateur peut activer ou désactiver une exécution.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({
        id: clientServiceExecutions.id,
        serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      })
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

    // Prestataire : vérifier que cette exécution appartient à leur entreprise
    const activePostureToggle = await getActivePosture();
    if (
      activePostureToggle === "prestataire" &&
      execution.serviceEntrepriseId
    ) {
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (prestataireAdhesion) {
        const [se] = await db
          .select({ entrepriseId: serviceEntreprises.entrepriseId })
          .from(serviceEntreprises)
          .where(eq(serviceEntreprises.id, execution.serviceEntrepriseId))
          .limit(1);
        if (!se || se.entrepriseId !== prestataireAdhesion.entrepriseId) {
          throw errors.forbidden(
            "Vous ne pouvez modifier que les exécutions de votre entreprise.",
          );
        }
      }
    }

    // Compter les occurrences futures planifiées avant de désactiver (pour warning UX)
    let futurePlanifieeCount = 0;
    if (!parsedInput.actif) {
      const now = new Date();
      const [row] = await db
        .select({ count: count() })
        .from(clientServiceOccurrences)
        .where(
          and(
            eq(clientServiceOccurrences.clientServiceId, prestationId),
            eq(clientServiceOccurrences.executionId, executionId),
            eq(clientServiceOccurrences.statut, "planifiee"),
            gt(clientServiceOccurrences.dateDebutPrevue, now),
          ),
        );
      futurePlanifieeCount = row?.count ?? 0;
    }

    await db
      .update(clientServiceExecutions)
      .set({ actif: parsedInput.actif, updatedById: currentUser.id })
      .where(eq(clientServiceExecutions.id, executionId));

    // Resync : régénère la fenêtre glissante pour assigner l'exécution + snapshot des tâches
    if (
      parsedInput.actif &&
      prestation.statut === "actif" &&
      prestation.modePlanning === "planifie"
    ) {
      await onClientServiceChanged({
        clientServiceId: prestationId,
        now: new Date(),
      });
    }

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: parsedInput.actif
        ? "Exécution activée."
        : "Exécution désactivée.",
      executions: updatedExecutions,
      futurePlanifieeCount,
    };
  });

// ==================== DELETE EXECUTION ====================

export const deleteExecutionAction = actionClient
  .metadata({ actionName: "deleteExecutionAction" })
  .inputSchema(deleteExecutionSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
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

    // Charger l'exécution AVANT le check de permission (besoin de modePilotage)
    const [execution] = await db
      .select({
        id: clientServiceExecutions.id,
        serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
        modePilotage: clientServiceExecutions.modePilotage,
      })
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

    // Vérifier les permissions : plateforme toujours, sinon admin du côté qui pilote
    // - modePilotage "client"        → client admin uniquement
    // - modePilotage "prestataire"   → prestataire admin uniquement (+ ownership check)
    // - modePilotage "collaboration" → client admin OU prestataire admin
    const platformRoleDelete = await getEffectivePlateformeRole(currentUser.id);
    const isPlateformeDelete = !!platformRoleDelete?.role;

    if (!isPlateformeDelete) {
      const activePostureDelete = await getActivePosture();
      let canDelete = false;

      const clientCanDelete =
        execution.modePilotage === "client" ||
        execution.modePilotage === "collaboration";
      const prestataireCanDelete =
        execution.modePilotage === "prestataire" ||
        execution.modePilotage === "collaboration";

      if (activePostureDelete === "client" && clientCanDelete) {
        const clientAdhesion = await getUserClientAdhesion({
          userId: currentUser.id,
          entrepriseId,
        });
        canDelete = clientAdhesion?.role === "admin";
      } else if (activePostureDelete === "prestataire" && prestataireCanDelete) {
        const prestataireAdhesion = await getUserPrestataireAdhesion({
          userId: currentUser.id,
        });
        if (prestataireAdhesion?.role === "admin" && execution.serviceEntrepriseId) {
          const [se] = await db
            .select({ entrepriseId: serviceEntreprises.entrepriseId })
            .from(serviceEntreprises)
            .where(eq(serviceEntreprises.id, execution.serviceEntrepriseId))
            .limit(1);
          canDelete = !!se && se.entrepriseId === prestataireAdhesion.entrepriseId;
        }
      }

      if (!canDelete) {
        throw errors.forbidden(
          "Seul l'administrateur du côté qui pilote cette exécution peut la supprimer.",
        );
      }
    }

    // Supprimer (cascade sur les prix via FK)
    await db
      .delete(clientServiceExecutions)
      .where(eq(clientServiceExecutions.id, executionId));

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: "Prestataire retiré avec succès.",
      executions: updatedExecutions,
    };
  });

// ==================== GET EXECUTIONS ====================

export const getExecutionsAction = actionClient
  .metadata({ actionName: "getExecutionsAction" })
  .inputSchema(getExecutionsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const prestation = await getPrestationById(parsedInput.prestationId);
    if (!prestation || prestation.entrepriseId !== parsedInput.entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const canAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );
    if (!canAccess)
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");

    const executions = await getExecutionsWithPrixByPrestationId(
      parsedInput.prestationId,
    );
    return { executions };
  });

// ==================== UPDATE EXECUTION CHECKLIST ====================

export const updateExecutionTacheListeAction = actionClient
  .metadata({ actionName: "updateExecutionTacheListeAction" })
  .inputSchema(updateExecutionTacheListeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
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
    const { allowed: canManageChecklist } = await canManageExecution(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!canManageChecklist) {
      throw errors.forbidden(
        "Vous devez être responsable de ce site pour modifier la checklist.",
      );
    }

    // Vérifier que l'exécution appartient à la prestation
    const [execution] = await db
      .select({
        id: clientServiceExecutions.id,
        serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) throw errors.notFound("Exécution");

    // Prestataire : vérifier que cette exécution appartient à leur entreprise
    const activePostureChecklist = await getActivePosture();
    if (
      activePostureChecklist === "prestataire" &&
      execution.serviceEntrepriseId
    ) {
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (prestataireAdhesion) {
        const [se] = await db
          .select({ entrepriseId: serviceEntreprises.entrepriseId })
          .from(serviceEntreprises)
          .where(eq(serviceEntreprises.id, execution.serviceEntrepriseId))
          .limit(1);
        if (!se || se.entrepriseId !== prestataireAdhesion.entrepriseId) {
          throw errors.forbidden(
            "Vous ne pouvez modifier que les exécutions de votre entreprise.",
          );
        }
      }
    }

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
    const canManage = await canManageExecution(
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
      .select({
        id: clientServiceExecutions.id,
        serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      })
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

    // Prestataire : vérifier que cette exécution appartient à leur entreprise
    const activePostureUpdate = await getActivePosture();
    if (
      activePostureUpdate === "prestataire" &&
      !canManage.isPlateforme &&
      existingExecution.serviceEntrepriseId
    ) {
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (prestataireAdhesion) {
        const [se] = await db
          .select({ entrepriseId: serviceEntreprises.entrepriseId })
          .from(serviceEntreprises)
          .where(
            eq(serviceEntreprises.id, existingExecution.serviceEntrepriseId),
          )
          .limit(1);
        if (!se || se.entrepriseId !== prestataireAdhesion.entrepriseId) {
          throw errors.forbidden(
            "Vous ne pouvez modifier que les exécutions de votre entreprise.",
          );
        }
      }
    }

    // Valider modePilotage selon le statut fantôme des entreprises
    await validateModePilotage(
      parsedInput.modePilotage,
      entrepriseId,
      existingExecution.serviceEntrepriseId,
    );

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
      prestation.modeCommercial === "intermediaire_fm4all" &&
      canManage.isPlateforme;

    // Helper : calcule les valeurs normalisées d'une ligne prix
    function buildPrixValues(p: (typeof parsedInput.prix)[0]) {
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
          montantHt: Math.round(montant * 100),
          coutPrestataireHt: Math.round(cout * 100),
          margePourcent: marge,
          periodeFacturation: p.periodeFacturation ?? null,
          nbOccurrencesIncluses:
            p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
              ? Number(p.nbOccurrencesIncluses)
              : null,
        };
      }
      return {
        montantHt: Math.round(Number(p.montantHt) * 100),
        coutPrestataireHt: null,
        margePourcent: null,
        periodeFacturation: p.periodeFacturation ?? null,
        nbOccurrencesIncluses:
          p.nbOccurrencesIncluses && p.nbOccurrencesIncluses !== ""
            ? Number(p.nbOccurrencesIncluses)
            : null,
      };
    }

    await db.transaction(async (tx) => {
      // 1. Récupérer les lignes prix actives existantes
      const existingPrix = await tx
        .select({ id: clientServiceExecutionPrix.id })
        .from(clientServiceExecutionPrix)
        .where(
          and(
            eq(clientServiceExecutionPrix.executionId, executionId),
            eq(clientServiceExecutionPrix.actif, true),
          ),
        );

      const inputIds = new Set(
        parsedInput.prix.filter((p) => p.id).map((p) => p.id!),
      );

      // 2. Lignes supprimées du formulaire : soft-delete si utilisées, hard-delete sinon
      for (const existing of existingPrix) {
        if (inputIds.has(existing.id)) continue;
        const [ref] = await tx
          .select({ count: count() })
          .from(clientServicePrixAppliques)
          .where(eq(clientServicePrixAppliques.executionPrixId, existing.id));
        if (ref && ref.count > 0) {
          await tx
            .update(clientServiceExecutionPrix)
            .set({ actif: false, updatedById: currentUser.id })
            .where(eq(clientServiceExecutionPrix.id, existing.id));
        } else {
          await tx
            .delete(clientServiceExecutionPrix)
            .where(eq(clientServiceExecutionPrix.id, existing.id));
        }
      }

      // 3. UPDATE lignes existantes / INSERT nouvelles
      for (const p of parsedInput.prix) {
        const values = buildPrixValues(p);
        if (p.id) {
          await tx
            .update(clientServiceExecutionPrix)
            .set({ ...values, updatedById: currentUser.id })
            .where(eq(clientServiceExecutionPrix.id, p.id));
        } else {
          await tx.insert(clientServiceExecutionPrix).values({
            executionId,
            typePrix: p.typePrix,
            ...values,
            actif: true,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          });
        }
      }

      // 4. Mettre à jour l'en-tête de l'exécution
      await tx
        .update(clientServiceExecutions)
        .set({
          priorite: Number(parsedInput.priorite),
          modePilotage: parsedInput.modePilotage,
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
    if (
      prestation.statut === "actif" &&
      prestation.modePlanning === "planifie"
    ) {
      await onClientServiceChanged({
        clientServiceId: prestationId,
        now: new Date(),
      });
    }

    const updatedExecutions =
      await getExecutionsWithPrixByPrestationId(prestationId);
    return {
      message: "Exécution mise à jour avec succès.",
      executions: updatedExecutions,
    };
  });

// ==================== GET CLIENT PRESTATAIRES ====================

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs). Utilisé dans TicketFormDialog.
 */
export const getClientPrestatairesAction = actionClient
  .metadata({ actionName: "getClientPrestatairesAction" })
  .inputSchema(getClientPrestatairesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const adhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.clientEntrepriseId,
    });
    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const prestataires = await getClientPrestataires(
      parsedInput.clientEntrepriseId,
    );
    return { prestataires };
  });

// ==================== MES SITES CLIENTS (Posture Prestataire) ====================

export const getMesSitesClientsAction = actionClient
  .metadata({ actionName: "getMesSitesClientsAction" })
  .inputSchema(getMesSitesClientsSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier l'adhésion à l'entreprise prestataire
    const adhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, currentUser.id),
        eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
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

    const sites = await getSitesCouvertsParPrestataire(
      parsedInput.entrepriseId,
    );

    return { sites };
  });

// ==================== UPDATE EXECUTION MODE PILOTAGE ====================

export const updateExecutionModePilotageAction = actionClient
  .metadata({ actionName: "updateExecutionModePilotageAction" })
  .inputSchema(updateExecutionModePilotageSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { executionId, prestationId, entrepriseId, modePilotage } =
      parsedInput;

    const prestation = await getPrestationById(prestationId);
    if (!prestation || prestation.entrepriseId !== entrepriseId) {
      throw errors.notFound("Prestation");
    }

    const { allowed } = await canManageExecution(
      currentUser.id,
      entrepriseId,
      prestation.siteId,
    );
    if (!allowed) {
      throw errors.forbidden(
        "Seuls la plateforme, un admin ou un responsable de site peuvent modifier le mode de pilotage.",
      );
    }

    const [execution] = await db
      .select({
        id: clientServiceExecutions.id,
        serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      })
      .from(clientServiceExecutions)
      .where(
        and(
          eq(clientServiceExecutions.id, executionId),
          eq(clientServiceExecutions.clientServiceId, prestationId),
        ),
      )
      .limit(1);

    if (!execution) throw errors.notFound("Exécution");

    // Prestataire : vérifier que cette exécution appartient à leur entreprise
    const activePostureModePilotage = await getActivePosture();
    if (
      activePostureModePilotage === "prestataire" &&
      execution.serviceEntrepriseId
    ) {
      const prestataireAdhesion = await getUserPrestataireAdhesion({
        userId: currentUser.id,
      });
      if (prestataireAdhesion) {
        const [se] = await db
          .select({ entrepriseId: serviceEntreprises.entrepriseId })
          .from(serviceEntreprises)
          .where(eq(serviceEntreprises.id, execution.serviceEntrepriseId))
          .limit(1);
        if (!se || se.entrepriseId !== prestataireAdhesion.entrepriseId) {
          throw errors.forbidden(
            "Vous ne pouvez modifier que les exécutions de votre entreprise.",
          );
        }
      }
    }

    // Valider modePilotage selon le statut fantôme des entreprises
    await validateModePilotage(
      modePilotage,
      entrepriseId,
      execution.serviceEntrepriseId,
    );

    const [updated] = await db
      .update(clientServiceExecutions)
      .set({
        modePilotage,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientServiceExecutions.id, executionId))
      .returning({
        id: clientServiceExecutions.id,
        modePilotage: clientServiceExecutions.modePilotage,
      });

    if (!updated) throw errors.internal("Échec de la mise à jour.");

    return { execution: updated };
  });

// ==================== MES PRESTATAIRES (Posture Client) ====================

export const getMesPrestatairesAction = actionClient
  .metadata({ actionName: "getMesPrestatairesAction" })
  .inputSchema(getMesPrestatairesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const adhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const prestataires = await getClientPrestatairesAvecDetails(
      parsedInput.entrepriseId,
    );
    return { prestataires };
  });

// ==================== MES CLIENTS (Posture Prestataire) ====================

export const getMesClientsAction = actionClient
  .metadata({ actionName: "getMesClientsAction" })
  .inputSchema(getMesClientsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const adhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.entrepriseId, parsedInput.entrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const rolePrest = await db.query.entrepriseRoles.findFirst({
      where: and(
        eq(entrepriseRoles.entrepriseId, parsedInput.entrepriseId),
        eq(entrepriseRoles.role, "prestataire"),
      ),
    });
    if (!rolePrest) {
      throw errors.forbidden("Cette entreprise n'est pas prestataire.");
    }

    const clients = await getMesClients(parsedInput.entrepriseId);
    return { clients };
  });

// ==================== CREATE OR LINK CLIENT (Posture Prestataire) ====================

export const createOrLinkClientAction = actionClient
  .metadata({ actionName: "createOrLinkClientAction" })
  .inputSchema(createOrLinkClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier que l'utilisateur a accès à l'entreprise prestataire avec au moins le rôle manager
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.entrepriseId, parsedInput.prestataireEntrepriseId),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    if (!prestataireAdhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }
    if (prestataireAdhesion.role === "collaborateur") {
      throw errors.forbidden("Vous devez être au moins manager pour ajouter un client.");
    }

    const { nom, prenomContact, nomContact, emailContact, phoneContact } =
      parsedInput;
    const siret = parsedInput.siret.replace(/\s/g, "");

    const { entrepriseId, entrepriseNom } = await db.transaction(async (tx) => {
      // 1. Trouver ou créer l'entreprise cliente
      let clientId: string;
      let clientNom: string;
      const existing = await findEntrepriseBySiret(siret);

      if (existing) {
        clientId = existing.id;
        clientNom = existing.nom;
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
          .returning({ id: entreprises.id, nom: entreprises.nom });
        clientId = created.id;
        clientNom = created.nom;
      }

      // Vérifier qu'un prestataire ne s'ajoute pas lui-même comme client
      if (clientId === parsedInput.prestataireEntrepriseId) {
        throw errors.conflict(
          "Une entreprise ne peut pas être son propre client.",
        );
      }

      // 2. S'assurer que le rôle client existe
      await tx
        .insert(entrepriseRoles)
        .values({
          entrepriseId: clientId,
          role: "client",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .onConflictDoNothing();

      // 3. Créer la relation client↔prestataire persistante
      await tx
        .insert(clientPrestataireRelations)
        .values({
          clientEntrepriseId: clientId,
          prestataireEntrepriseId: parsedInput.prestataireEntrepriseId,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .onConflictDoNothing();

      return { entrepriseId: clientId, entrepriseNom: clientNom };
    });

    return { entrepriseId, nom: entrepriseNom };
  });

// ==================== CREATE OR LINK PRESTATAIRE SIMPLE (Posture Client, sans service) ====================

export const createOrLinkPrestataireSimpleAction = actionClient
  .metadata({ actionName: "createOrLinkPrestataireSimpleAction" })
  .inputSchema(createOrLinkPrestataireSimpleSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier que l'utilisateur a accès à l'entreprise cliente
    const hasAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.clientEntrepriseId,
    );
    if (!hasAccess) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const { nom, prenomContact, nomContact, emailContact, phoneContact } =
      parsedInput;
    const siret = parsedInput.siret.replace(/\s/g, "");

    const { entrepriseId, entrepriseNom } = await db.transaction(async (tx) => {
      // 1. Trouver ou créer l'entreprise prestataire
      let prestId: string;
      let prestNom: string;
      const existing = await findEntrepriseBySiret(siret);

      if (existing) {
        prestId = existing.id;
        prestNom = existing.nom;
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
          .returning({ id: entreprises.id, nom: entreprises.nom });
        prestId = created.id;
        prestNom = created.nom;
      }

      // 2. S'assurer que le rôle prestataire existe
      await tx
        .insert(entrepriseRoles)
        .values({
          entrepriseId: prestId,
          role: "prestataire",
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .onConflictDoNothing();

      return { entrepriseId: prestId, entrepriseNom: prestNom };
    });

    return { entrepriseId, nom: entrepriseNom };
  });

// ==================== GET SERVICES FOR PICKER ====================

export const getServicesForPickerAction = actionClient
  .metadata({ actionName: "getServicesForPickerAction" })
  .action(async () => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    const services = await getAllServices();
    return { services };
  });

// ==================== INVITER ADMIN PRESTATAIRE ====================

export const inviterPrestataireAdminAction = actionClient
  .metadata({ actionName: "inviterPrestataireAdminAction" })
  .inputSchema(
    z.object({
      clientEntrepriseId: z.uuid("ID client invalide"),
      prestataireEntrepriseId: z.uuid("ID prestataire invalide"),
      email: z.string().email("Email invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    const currentUser = session.user;

    // 1. Vérifier que l'utilisateur est client de clientEntrepriseId avec au moins rôle manager
    const clientAdhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.clientEntrepriseId,
    });
    if (!clientAdhesion) {
      throw errors.forbidden(
        "Vous n'avez pas accès à cette entreprise cliente.",
      );
    }
    if (clientAdhesion.role === "collaborateur") {
      throw errors.forbidden(
        "Vous devez être au moins manager pour inviter un administrateur.",
      );
    }

    // 2. Vérifier que la relation client-prestataire existe
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(
          clientPrestataireRelations.clientEntrepriseId,
          parsedInput.clientEntrepriseId,
        ),
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          parsedInput.prestataireEntrepriseId,
        ),
      ),
    });
    if (!relation) {
      throw errors.forbidden(
        "Ce prestataire n'est pas lié à votre entreprise.",
      );
    }

    // 3. Vérifier qu'il n'y a pas déjà un admin actif côté prestataire
    const existingAdmin = await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(
          userPrestataireAdhesions.entrepriseId,
          parsedInput.prestataireEntrepriseId,
        ),
        eq(userPrestataireAdhesions.role, "admin"),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    });
    if (existingAdmin) {
      throw errors.conflict("Ce prestataire a déjà un administrateur actif.");
    }

    // 4. Vérifier que l'email n'est pas déjà utilisé par un compte existant
    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, parsedInput.email))
      .limit(1);
    if (existingUser.length > 0) {
      throw errors.conflict(
        `Un compte existe déjà avec l'adresse "${parsedInput.email}".`,
      );
    }

    // 5. Récupérer le nom de l'entreprise prestataire pour l'email
    const [prestataireEntreprise] = await db
      .select({ nom: entreprises.nom })
      .from(entreprises)
      .where(eq(entreprises.id, parsedInput.prestataireEntrepriseId))
      .limit(1);
    if (!prestataireEntreprise)
      throw errors.notFound("Entreprise prestataire introuvable.");

    // 6. Annuler les invitations en attente existantes pour ce prestataire
    await db
      .delete(entrepriseInvitations)
      .where(
        and(
          eq(
            entrepriseInvitations.entrepriseId,
            parsedInput.prestataireEntrepriseId,
          ),
          isNull(entrepriseInvitations.acceptedAt),
        ),
      );

    // 7. Créer la nouvelle invitation (même flow que inviterClientAdminAction)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sentAt = new Date();

    await db.insert(entrepriseInvitations).values({
      entrepriseId: parsedInput.prestataireEntrepriseId,
      email: parsedInput.email,
      token,
      typeAdhesion: "prestataire",
      expiresAt,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // 8. Envoyer l'email d'invitation
    const lien = `${env.APP_URL}/auth/inscription-admin?token=${token}`;
    await sendEmailDirect({
      to: parsedInput.email,
      subject: "Invitation à rejoindre FM4ALL",
      text: `
        <h2>Vous avez été invité à rejoindre FM4ALL</h2>
        <p>Vous avez été invité à créer votre compte administrateur pour l'entreprise <strong>${prestataireEntreprise.nom}</strong>.</p>
        <p>Cliquez sur le lien ci-dessous pour créer votre compte :</p>
        <p><a href="${lien}">Créer mon compte</a></p>
        <p><small>Ce lien est valable 7 jours.</small></p>
      `,
      useTemplate: false,
    });

    return {
      pendingInvitation: { email: parsedInput.email, sentAt },
    };
  });

// ==================== INVITER ADMIN CLIENT (Posture Prestataire) ====================

/**
 * Enregistre une invitation administrateur pour un client (posture prestataire).
 * Ne crée PAS de compte utilisateur — envoie uniquement un email avec un lien d'onboarding.
 */
export const inviterClientAdminAction = actionClient
  .metadata({ actionName: "inviterClientAdminAction" })
  .inputSchema(
    z.object({
      prestataireEntrepriseId: z.uuid("ID prestataire invalide"),
      clientEntrepriseId: z.uuid("ID client invalide"),
      email: z.string().email("Email invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    const currentUser = session.user;

    // 1. Vérifier que l'utilisateur est prestataire actif avec au moins rôle manager
    const prestataireAdhesion =
      await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(
            userPrestataireAdhesions.entrepriseId,
            parsedInput.prestataireEntrepriseId,
          ),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
    if (!prestataireAdhesion) {
      throw errors.forbidden(
        "Vous n'avez pas accès à cette entreprise prestataire.",
      );
    }
    if (prestataireAdhesion.role === "collaborateur") {
      throw errors.forbidden(
        "Vous devez être au moins manager pour inviter un administrateur.",
      );
    }

    // 2. Vérifier que la relation prestataire-client existe
    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: and(
        eq(
          clientPrestataireRelations.clientEntrepriseId,
          parsedInput.clientEntrepriseId,
        ),
        eq(
          clientPrestataireRelations.prestataireEntrepriseId,
          parsedInput.prestataireEntrepriseId,
        ),
      ),
    });
    if (!relation) {
      throw errors.forbidden("Ce client n'est pas lié à votre entreprise.");
    }

    // 3. Vérifier qu'il n'y a pas déjà un admin actif côté client
    const existingAdmin = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.entrepriseId, parsedInput.clientEntrepriseId),
        eq(userClientAdhesions.role, "admin"),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (existingAdmin) {
      throw errors.conflict("Ce client a déjà un administrateur actif.");
    }

    // 4. Vérifier que l'email n'est pas déjà utilisé par un compte existant
    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, parsedInput.email))
      .limit(1);
    if (existingUser.length > 0) {
      throw errors.conflict(
        `Un compte existe déjà avec l'adresse "${parsedInput.email}".`,
      );
    }

    // 5. Récupérer le nom de l'entreprise cliente pour l'email
    const [clientEntreprise] = await db
      .select({ nom: entreprises.nom })
      .from(entreprises)
      .where(eq(entreprises.id, parsedInput.clientEntrepriseId))
      .limit(1);
    if (!clientEntreprise)
      throw errors.notFound("Entreprise cliente introuvable.");

    // 6. Annuler les invitations en attente existantes pour ce client
    await db
      .delete(entrepriseInvitations)
      .where(
        and(
          eq(
            entrepriseInvitations.entrepriseId,
            parsedInput.clientEntrepriseId,
          ),
          isNull(entrepriseInvitations.acceptedAt),
        ),
      );

    // 7. Créer la nouvelle invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sentAt = new Date();

    await db.insert(entrepriseInvitations).values({
      entrepriseId: parsedInput.clientEntrepriseId,
      email: parsedInput.email,
      token,
      typeAdhesion: "client",
      expiresAt,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // 8. Envoyer l'email d'invitation
    const lien = `${env.APP_URL}/auth/inscription-admin?token=${token}`;
    await sendEmailDirect({
      to: parsedInput.email,
      subject: "Invitation à rejoindre FM4ALL",
      text: `
        <h2>Vous avez été invité à rejoindre FM4ALL</h2>
        <p>Vous avez été invité à créer votre compte administrateur pour l'entreprise <strong>${clientEntreprise.nom}</strong>.</p>
        <p>Cliquez sur le lien ci-dessous pour créer votre compte :</p>
        <p><a href="${lien}">Créer mon compte</a></p>
        <p><small>Ce lien est valable 7 jours.</small></p>
      `,
      useTemplate: false,
    });

    return {
      pendingInvitation: { email: parsedInput.email, sentAt },
    };
  });
