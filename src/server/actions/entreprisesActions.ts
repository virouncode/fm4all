"use server";

import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { documents } from "@/db/schema/documents";
import {
  clientPrestataireRelationContacts,
  clientPrestataireRelations,
  contactsInvitations,
  entrepriseContacts,
  entrepriseRoles,
  entreprises,
  serviceEntreprises,
} from "@/db/schema/entreprises";
import { clientServiceExecutions, clientServices } from "@/db/schema/services";
import {
  userClientAdhesions,
  userPrestataireAdhesions,
} from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { env } from "@/lib/env";
import { auth } from "@/server/auth/auth";
import { getSession } from "@/server/auth/get-session";
import { sendEmailDirect } from "@/server/email/mailgunDirect";
import {
  getClientPrestataires,
  getMesClients,
} from "@/server/queries/clientServiceExecutions.query";
import {
  countEntreprises,
  getAllEntreprises,
  getEntrepriseContactsByEntrepriseId,
  getEntreprisesClientes,
  getEntreprisesPaginated,
  getEntreprisesPrestataires,
  getEntrepriseWithDetailsById,
  getRelationContactsByRelationId,
  getServicesByEntrepriseId,
} from "@/server/queries/entreprises.query";
import {
  countProspects,
  getProspectsPaginated,
} from "@/server/queries/prospects.query";
import { getAllServices } from "@/server/queries/services.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
  hasAccessToEntreprise,
} from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import {
  deleteS3Object as deleteS3ObjectFromServer,
  promoteS3Key,
} from "@/server/s3/s3";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { fetchEntrepriseBySiret } from "@/server/utils/sirene.utils";
import { insertUserArborescence } from "@/server/utils/usersArborescence.utils";
import { normalizeForSubmit, upper } from "@/zod-helpers/normalize";
import {
  insertEntrepriseContactAndLinkToRelationSchema,
  insertEntrepriseContactSchema,
  insertEntrepriseFormSchema,
  insertRelationContactSchema,
  updateEntrepriseContactSchema,
  updateEntrepriseInfosSchema,
  updateEntrepriseLogoSchema,
  updateEntrepriseRolesSchema,
  updateEntrepriseSireneFieldsSchema,
  updateRelationContactSchema,
  type RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import {
  accepterInvitationContactSchema,
  inviterContactSchema,
} from "@/zod-schemas/inscriptionContact.schema";
import { and, count, eq, gt, ilike, inArray, isNull, notExists } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { cookies, headers } from "next/headers";
import { z } from "zod";

/**
 * Récupère la liste de toutes les entreprises
 * Utilisé pour afficher les noms dans les colonnes relationnelles
 */
export const getEntreprisesAction = actionClient
  .metadata({ actionName: "getEntreprisesAction" })
  .action(async () => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const entreprisesData = await getAllEntreprises();
    return { entreprises: entreprisesData };
  });

/**
 * Récupère la liste des entreprises clientes
 * - Plateforme : toutes les entreprises clientes
 * - Prestataire : uniquement les clients liés via clientPrestataireRelations
 */
export const getEntreprisesClientesAction = actionClient
  .metadata({ actionName: "getEntreprisesClientesAction" })
  .action(async () => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // Branche plateforme : toutes les entreprises clientes
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (plateformeRole) {
      const clients = await getEntreprisesClientes();
      return { clients };
    }

    // Branche prestataire : ses clients via getMesClients (même logique que /app/mes-clients)
    const prestataireAdhesion =
      await db.query.userPrestataireAdhesions.findFirst({
        where: and(
          eq(userPrestataireAdhesions.userId, currentUser.id),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      });
    if (prestataireAdhesion) {
      const mesClients = await getMesClients(prestataireAdhesion.entrepriseId);
      const clients = mesClients.map((c) => ({ id: c.id, nom: c.nom }));
      return { clients };
    }

    throw errors.forbidden("Accès non autorisé.");
  });

/**
 * Récupère la liste des entreprises prestataires
 * Utilisé pour le filtre prestataire dans les tickets
 */
export const getEntreprisesPrestatairesAction = actionClient
  .metadata({ actionName: "getEntreprisesPrestatairesAction" })
  .action(async () => {
    const session = await getSession();
    if (!session?.user)
      throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const userId = session.user.id;

    // Plateforme → tous les prestataires
    const plateformeRole = await getEffectivePlateformeRole(userId);
    if (plateformeRole?.role) {
      const prestataires = await getEntreprisesPrestataires();
      return { prestataires };
    }

    const cookieStore = await cookies();
    const posture = cookieStore.get("fm4all:postureActive")?.value;

    // Prestataire → lui-même uniquement
    if (posture === "prestataire") {
      const adhesion = await getUserPrestataireAdhesion({ userId });
      if (!adhesion) return { prestataires: [] };
      const entreprise = await db.query.entreprises.findFirst({
        where: eq(entreprises.id, adhesion.entrepriseId),
        columns: { id: true, nom: true },
      });
      if (!entreprise) return { prestataires: [] };
      return { prestataires: [{ id: entreprise.id, nom: entreprise.nom }] };
    }

    // Client (défaut) → ses prestataires uniquement
    const clientAdhesion = await db.query.userClientAdhesions.findFirst({
      where: and(
        eq(userClientAdhesions.userId, userId),
        eq(userClientAdhesions.statut, "actif"),
      ),
    });
    if (!clientAdhesion) return { prestataires: [] };
    const prestataires = await getClientPrestataires(
      clientAdhesion.entrepriseId,
    );
    return { prestataires };
  });

// ==================== PAGINATED LIST ====================

const entreprisesQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["client", "prestataire", "plateforme"]).optional(),
  orderBy: z.enum(["nom", "createdAt", "updatedAt", "formeJuridique", "nbSites"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(30),
});

/**
 * Récupère la liste paginée des entreprises avec rôles et nb de sites
 * Réservé à la posture plateforme
 */
export const getEntreprisesPaginatedAction = actionClient
  .metadata({ actionName: "getEntreprisesPaginatedAction" })
  .inputSchema(entreprisesQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );
    }

    const { search, role, orderBy, orderDir, page, pageSize } = parsedInput;

    const [entreprisesData, total] = await Promise.all([
      getEntreprisesPaginated({
        search,
        role: role as RoleEntrepriseType | undefined,
        orderBy,
        orderDir,
        page,
        pageSize,
      }),
      countEntreprises({
        search,
        role: role as RoleEntrepriseType | undefined,
      }),
    ]);

    return {
      entreprises: entreprisesData,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  });

// ==================== MON ENTREPRISE (client / prestataire) ====================

/**
 * Récupère les détails complets d'une entreprise pour la page "Mon Entreprise"
 * Accessible en posture client ou prestataire (vérifie l'adhésion de l'utilisateur)
 */
export const getMonEntrepriseDetailsAction = actionClient
  .metadata({ actionName: "getMonEntrepriseDetailsAction" })
  .inputSchema(z.object({ entrepriseId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Bypass plateforme — tous les rôles plateforme ont accès
    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);

    if (!plateformeRole) {
      // Vérifier une adhésion client OU prestataire active
      const [clientAdhesionRows, prestataireAdhesionRows] = await Promise.all([
        db
          .select({ id: userClientAdhesions.id })
          .from(userClientAdhesions)
          .where(
            and(
              eq(userClientAdhesions.userId, currentUser.id),
              eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
              eq(userClientAdhesions.statut, "actif"),
            ),
          )
          .limit(1),
        db
          .select({ id: userPrestataireAdhesions.id })
          .from(userPrestataireAdhesions)
          .where(
            and(
              eq(userPrestataireAdhesions.userId, currentUser.id),
              eq(
                userPrestataireAdhesions.entrepriseId,
                parsedInput.entrepriseId,
              ),
              eq(userPrestataireAdhesions.statut, "actif"),
            ),
          )
          .limit(1),
      ]);

      if (!clientAdhesionRows[0] && !prestataireAdhesionRows[0]) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const entreprise = await getEntrepriseWithDetailsById(
      parsedInput.entrepriseId,
    );
    if (!entreprise) throw errors.notFound("Entreprise introuvable.");

    const [services, contacts] = await Promise.all([
      entreprise.roles.includes("prestataire")
        ? getServicesByEntrepriseId(parsedInput.entrepriseId)
        : Promise.resolve([]),
      getEntrepriseContactsByEntrepriseId(parsedInput.entrepriseId),
    ]);

    return { entreprise, services, contacts };
  });

// ==================== PROSPECTS PICKER ====================

const prospectsQuerySchema = z.object({
  search: z.string().optional(),
  orderBy: z.enum(["nomEntreprise", "createdAt"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(30),
});

/**
 * Récupère les prospects pour le picker dans le formulaire de création d'entreprise
 * Réservé à la posture plateforme
 */
export const getProspectsAction = actionClient
  .metadata({ actionName: "getProspectsAction" })
  .inputSchema(prospectsQuerySchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );
    }

    const { search, orderBy, orderDir, page, pageSize } = parsedInput;

    const [prospectsData, total] = await Promise.all([
      getProspectsPaginated({ search, orderBy, orderDir, page, pageSize }),
      countProspects({ search }),
    ]);

    return {
      prospects: prospectsData,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  });

// ==================== GET ALL SERVICES ====================

/**
 * Récupère la liste de tous les services du catalogue
 * Utilisé dans le formulaire de création/modification d'une entreprise prestataire
 * Accessible à tout utilisateur authentifié (catalogue non sensible)
 */
export const getAllServicesAction = actionClient
  .metadata({ actionName: "getAllServicesAction" })
  .action(async () => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const servicesData = await getAllServices();
    return { services: servicesData };
  });

// ==================== CREATE ENTREPRISE ====================

/**
 * Crée une nouvelle entreprise avec son utilisateur administrateur principal
 * Réservé à la posture plateforme (super_admin ou operateur)
 *
 * Flow:
 * 1. Vérif plateforme
 * 2. Transaction: INSERT entreprise + roles + services
 * 3. Créer user admin via better-auth
 * 4. Transaction: INSERT user_adhesions + users_arborescence
 * 5. Envoyer email activation
 */
export const createEntrepriseAction = actionClient
  .metadata({ actionName: "createEntrepriseAction" })
  .inputSchema(insertEntrepriseFormSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      throw errors.forbidden("Seule la plateforme peut créer des entreprises.");
    }

    const {
      nom,
      siret,
      adresseLigne1,
      adresseLigne2,
      codePostal,
      ville,
      formeJuridique,
      roles,
      serviceIds,
      numeroTva,
    } = parsedInput;

    // Normaliser les champs optionnels: "" → null + appliquer la casse
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: [
        "numeroTva",
        "adresseLigne1",
        "adresseLigne2",
        "codePostal",
        "ville",
        "formeJuridique",
      ] as const,
    });

    // Nettoyer le nom (capitalisation) et le SIRET (supprimer espaces éventuels)
    const nomClean = upper(nom);
    const siretClean = siret.trim().replace(/\s/g, "");

    // Vérifier l'unicité du nom
    const existingByNom = await db
      .select({ id: entreprises.id })
      .from(entreprises)
      .where(ilike(entreprises.nom, nomClean))
      .limit(1);

    if (existingByNom.length > 0) {
      throw errors.conflict(
        `Une entreprise avec le nom "${nomClean}" existe déjà.`,
      );
    }

    // ===== ÉTAPE 1: Créer l'entreprise + rôles + services =====
    let newEntreprise: { id: string; nom: string };

    try {
      newEntreprise = await db.transaction(async (tx) => {
        // 1a. INSERT entreprise
        const [entreprise] = await tx
          .insert(entreprises)
          .values({
            nom: nomClean,
            siret: siretClean,
            adresseLigne1: normalized.adresseLigne1,
            adresseLigne2: normalized.adresseLigne2,
            codePostal: normalized.codePostal,
            ville: normalized.ville,
            formeJuridique: normalized.formeJuridique,
            numeroTva: normalized.numeroTva
              ? normalized.numeroTva.toUpperCase()
              : null,
            sireneSyncedAt: new Date(),
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })
          .returning({ id: entreprises.id, nom: entreprises.nom });

        if (!entreprise) {
          throw new Error("Échec de la création de l'entreprise.");
        }

        // 1b. INSERT rôles (un par rôle sélectionné)
        await tx.insert(entrepriseRoles).values(
          roles.map((role) => ({
            entrepriseId: entreprise.id,
            role,
            createdById: currentUser.id,
            updatedById: currentUser.id,
          })),
        );

        // 1c. Si prestataire et services sélectionnés: INSERT service_entreprises
        const isPrestataire = roles.includes("prestataire");
        if (isPrestataire && serviceIds && serviceIds.length > 0) {
          await tx.insert(serviceEntreprises).values(
            serviceIds.map((serviceId) => ({
              entrepriseId: entreprise.id,
              serviceId,
              actif: true,
              createdById: currentUser.id,
              updatedById: currentUser.id,
            })),
          );
        }

        return entreprise;
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.toLowerCase().includes("unique") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("entreprises_siret_key")
      ) {
        throw errors.conflict(
          `Une entreprise avec le SIRET "${siretClean}" existe déjà.`,
        );
      }
      throw errors.internal(
        `Erreur lors de la création de l'entreprise: ${errorMessage}`,
      );
    }

    return {
      entreprise: newEntreprise,
      message: `Entreprise "${nomClean}" créée avec succès.`,
    };
  });

// ==================== UPDATE ENTREPRISE ====================

/**
 * Met à jour les informations (nom + SIRET) d'une entreprise
 */
export const updateEntrepriseInfosAction = actionClient
  .metadata({ actionName: "updateEntrepriseInfosAction" })
  .inputSchema(updateEntrepriseInfosSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId, siret, adresseLigne2, numeroTva } = parsedInput;

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      const [clientAdhesion, prestataireAdhesion] = await Promise.all([
        getUserClientAdhesion({ userId: currentUser.id, entrepriseId }),
        getUserPrestataireAdhesion({ userId: currentUser.id }),
      ]);
      const isOwnEnterpriseAdmin =
        clientAdhesion?.role === "admin" ||
        (prestataireAdhesion?.entrepriseId === entrepriseId &&
          prestataireAdhesion?.role === "admin");
      if (!isOwnEnterpriseAdmin)
        throw errors.forbidden(
          "Vous n'avez pas les droits pour modifier cette entreprise.",
        );
    }

    const siretClean = siret.trim().replace(/\s/g, "");
    const adresseLigne2Clean =
      adresseLigne2 && adresseLigne2 !== "" ? adresseLigne2 : null;
    const numeroTvaClean =
      numeroTva && numeroTva !== "" ? numeroTva.toUpperCase() : null;

    try {
      await db
        .update(entreprises)
        .set({
          siret: siretClean,
          adresseLigne2: adresseLigne2Clean,
          numeroTva: numeroTvaClean,
          updatedById: currentUser.id,
        })
        .where(eq(entreprises.id, entrepriseId));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("entreprises_siret_key"))
        throw errors.conflict(
          `Une entreprise avec le SIRET "${siretClean}" existe déjà.`,
        );
      throw errors.internal(`Erreur lors de la mise à jour: ${msg}`);
    }

    return { success: true };
  });

/**
 * Met à jour les rôles (et services si prestataire) d'une entreprise
 * Supprime les anciens rôles/services et insère les nouveaux
 */
export const updateEntrepriseRolesAction = actionClient
  .metadata({ actionName: "updateEntrepriseRolesAction" })
  .inputSchema(updateEntrepriseRolesSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId, roles, serviceIds } = parsedInput;
    const isPrestataire = roles.includes("prestataire");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      // Vérifier que l'utilisateur est admin de sa propre entreprise
      const [clientAdhesion, prestataireAdhesion] = await Promise.all([
        getUserClientAdhesion({ userId: currentUser.id, entrepriseId }),
        getUserPrestataireAdhesion({ userId: currentUser.id }),
      ]);

      const isOwnEnterpriseAdmin =
        clientAdhesion?.role === "admin" ||
        (prestataireAdhesion?.entrepriseId === entrepriseId &&
          prestataireAdhesion?.role === "admin");

      if (!isOwnEnterpriseAdmin) {
        throw errors.forbidden(
          "Vous n'avez pas les droits pour modifier les rôles de cette entreprise.",
        );
      }

      // Garde serveur : le rôle "plateforme" est réservé à FM4ALL
      if (roles.includes("plateforme")) {
        throw errors.forbidden("Le rôle Plateforme est réservé à FM4ALL.");
      }
    }

    // --- Récupérer l'état actuel en DB ---
    const currentRolesRows = await db
      .select({ role: entrepriseRoles.role })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.entrepriseId, entrepriseId));
    const currentRoles = currentRolesRows.map((r) => r.role);

    const currentServiceRows = await db
      .select({
        id: serviceEntreprises.id,
        serviceId: serviceEntreprises.serviceId,
      })
      .from(serviceEntreprises)
      .where(eq(serviceEntreprises.entrepriseId, entrepriseId));
    const currentServiceIds = currentServiceRows.map((r) => r.serviceId);

    const removedRoles = currentRoles.filter((r) => !roles.includes(r));
    const removedServiceIds = currentServiceIds.filter(
      (sId) => !isPrestataire || !(serviceIds ?? []).includes(sId),
    );

    // --- Guards : bloquer le retrait si des données liées existent ---

    // Retrait du rôle "client"
    if (removedRoles.includes("client")) {
      const [{ value: nbPrestations }] = await db
        .select({ value: count() })
        .from(clientServices)
        .where(eq(clientServices.entrepriseId, entrepriseId));
      if (nbPrestations > 0) {
        throw errors.conflict(
          `Impossible de retirer le rôle Client : ${nbPrestations} prestation${nbPrestations > 1 ? "s" : ""} active${nbPrestations > 1 ? "s" : ""} existent pour cette entreprise.`,
        );
      }
    }

    // Retrait du rôle "prestataire" ou de services spécifiques
    const serviceEntrepriseIdsToCheck: string[] = [];

    if (removedRoles.includes("prestataire")) {
      // Tous les service_entreprises de ce prestataire
      serviceEntrepriseIdsToCheck.push(...currentServiceRows.map((r) => r.id));
    } else if (removedServiceIds.length > 0) {
      // Seulement les service_entreprises des services retirés
      const removedRows = currentServiceRows.filter((r) =>
        removedServiceIds.includes(r.serviceId),
      );
      serviceEntrepriseIdsToCheck.push(...removedRows.map((r) => r.id));
    }

    if (serviceEntrepriseIdsToCheck.length > 0) {
      const [{ value: nbExecutions }] = await db
        .select({ value: count() })
        .from(clientServiceExecutions)
        .where(
          inArray(
            clientServiceExecutions.serviceEntrepriseId,
            serviceEntrepriseIdsToCheck,
          ),
        );

      if (nbExecutions > 0) {
        const what = removedRoles.includes("prestataire")
          ? "le rôle Prestataire"
          : `${removedServiceIds.length} service${removedServiceIds.length > 1 ? "s" : ""}`;
        throw errors.conflict(
          `Impossible de retirer ${what} : ${nbExecutions} exécution${nbExecutions > 1 ? "s" : ""} active${nbExecutions > 1 ? "s" : ""} y sont rattachées.`,
        );
      }
    }

    // --- Appliquer les modifications ---
    await db.transaction(async (tx) => {
      // 1. Remplacer les rôles
      await tx
        .delete(entrepriseRoles)
        .where(eq(entrepriseRoles.entrepriseId, entrepriseId));
      await tx.insert(entrepriseRoles).values(
        roles.map((role) => ({
          entrepriseId,
          role,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      // 2. Remplacer les services
      await tx
        .delete(serviceEntreprises)
        .where(eq(serviceEntreprises.entrepriseId, entrepriseId));
      if (isPrestataire && serviceIds && serviceIds.length > 0) {
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
    });

    return { success: true };
  });

/**
 * Met à jour les services d'un prestataire — via proxy client
 * Autorisé si : prestataire sans admin actif + user est admin/manager client + relation existe
 */
export const updatePrestataireServicesAsProxyAction = actionClient
  .metadata({ actionName: "updatePrestataireServicesAsProxyAction" })
  .inputSchema(
    z.object({
      prestataireEntrepriseId: z.uuid(),
      serviceIds: z.array(z.uuid()).min(1, "Au moins un service est requis"),
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

    const { prestataireEntrepriseId, serviceIds } = parsedInput;

    const canManage = await canManagePrestataireInfosAsClient(
      currentUser.id,
      prestataireEntrepriseId,
    );
    if (!canManage) {
      throw errors.forbidden(
        "Vous n'avez pas les droits pour modifier les services de ce prestataire.",
      );
    }

    // Récupérer les service_entreprises actuels (id + serviceId)
    const currentServiceRows = await db
      .select({
        id: serviceEntreprises.id,
        serviceId: serviceEntreprises.serviceId,
      })
      .from(serviceEntreprises)
      .where(eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId));

    // IDs des service_entreprises retirés
    const removedRows = currentServiceRows.filter(
      (r) => !serviceIds.includes(r.serviceId),
    );
    const serviceEntrepriseIdsToCheck = removedRows.map((r) => r.id);

    // Bloquer si des exécutions actives référencent ces service_entreprises
    if (serviceEntrepriseIdsToCheck.length > 0) {
      const [{ value: nbExecutions }] = await db
        .select({ value: count() })
        .from(clientServiceExecutions)
        .where(
          inArray(
            clientServiceExecutions.serviceEntrepriseId,
            serviceEntrepriseIdsToCheck,
          ),
        );

      if (nbExecutions > 0) {
        throw errors.conflict(
          `Impossible de retirer ${removedRows.length} service${removedRows.length > 1 ? "s" : ""} : ${nbExecutions} exécution${nbExecutions > 1 ? "s" : ""} active${nbExecutions > 1 ? "s" : ""} y sont rattachées.`,
        );
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(serviceEntreprises)
        .where(eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId));
      await tx.insert(serviceEntreprises).values(
        serviceIds.map((serviceId) => ({
          entrepriseId: prestataireEntrepriseId,
          serviceId,
          actif: true,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );
    });

    return { success: true };
  });

/**
 * Récupère les services d'une entreprise prestataire
 * Utilisé dans la vue détail pour afficher les services proposés
 */
export const getEntrepriseServicesAction = actionClient
  .metadata({ actionName: "getEntrepriseServicesAction" })
  .inputSchema(z.object({ entrepriseId: z.uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );

    const servicesData = await getServicesByEntrepriseId(
      parsedInput.entrepriseId,
    );
    return { services: servicesData };
  });

/**
 * Met à jour le logo d'une entreprise
 * Promeut le fichier temp → documents, insère en DB, met à jour entreprises.logoId
 * Supprime l'ancien logo S3 si existant
 */
export const updateEntrepriseLogoAction = actionClient
  .metadata({ actionName: "updateEntrepriseLogoAction" })
  .inputSchema(updateEntrepriseLogoSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const { entrepriseId, logo } = parsedInput;

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      const [clientAdhesion, prestataireAdhesion] = await Promise.all([
        getUserClientAdhesion({ userId: currentUser.id, entrepriseId }),
        getUserPrestataireAdhesion({ userId: currentUser.id }),
      ]);
      const isOwnEnterpriseAdmin =
        clientAdhesion?.role === "admin" ||
        (prestataireAdhesion?.entrepriseId === entrepriseId &&
          prestataireAdhesion?.role === "admin");
      if (!isOwnEnterpriseAdmin)
        throw errors.forbidden(
          "Vous n'avez pas les droits pour modifier cette entreprise.",
        );
    }

    // Si la clé n'est pas temp, le logo n'a pas changé
    if (!logo.storageKey.startsWith("temp/")) {
      return { success: true };
    }

    // 1. Récupérer l'ancien logoId et storageKey avant modification
    const [currentEntreprise] = await db
      .select({ logoId: entreprises.logoId })
      .from(entreprises)
      .where(eq(entreprises.id, entrepriseId))
      .limit(1);

    const oldLogoId = currentEntreprise?.logoId ?? null;
    let oldLogoStorageKey: string | null = null;

    if (oldLogoId) {
      const [oldDoc] = await db
        .select({ storageKey: documents.storageKey })
        .from(documents)
        .where(eq(documents.id, oldLogoId))
        .limit(1);
      oldLogoStorageKey = oldDoc?.storageKey ?? null;
    }

    // 2. Promouvoir le fichier temp → permanent
    const permanentKey = await promoteS3Key({ tempKey: logo.storageKey });

    // 3. Transaction : insert nouveau doc + update entreprise + delete ancien doc
    await db.transaction(async (tx) => {
      const [newDoc] = await tx
        .insert(documents)
        .values({
          proprietaireEntrepriseId: entrepriseId,
          categorie: "logo",
          storageProvider: "s3",
          storageKey: permanentKey,
          filename: logo.filename,
          mimeType: logo.mimeType,
          sizeBytes: logo.sizeBytes,
          createdById: currentUser.id,
        })
        .returning({ id: documents.id });

      await tx
        .update(entreprises)
        .set({ logoId: newDoc.id, updatedById: currentUser.id })
        .where(eq(entreprises.id, entrepriseId));

      if (oldLogoId) {
        await tx.delete(documents).where(eq(documents.id, oldLogoId));
      }
    });

    // 4. Supprimer l'ancien fichier S3 (non-bloquant)
    if (oldLogoStorageKey) {
      deleteS3ObjectFromServer({ key: oldLogoStorageKey }).catch(() => {
        // Erreur non-critique, on ne bloque pas l'UX
      });
    }

    return { success: true };
  });

// ==================== CONTACTS ENTREPRISE ====================

/**
 * Liste les contacts d'une entreprise
 */
export const getEntrepriseContactsAction = actionClient
  .metadata({ actionName: "getEntrepriseContactsAction" })
  .inputSchema(z.object({ entrepriseId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const [canAccess, platformRole] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId),
      getUserPlateformeAdhesion(currentUser.id),
    ]);
    if (!canAccess && !platformRole?.role)
      throw errors.forbidden("Accès non autorisé.");

    const contacts = await getEntrepriseContactsByEntrepriseId(
      parsedInput.entrepriseId,
    );
    return { contacts };
  });

/**
 * Crée un contact pour une entreprise
 */
export const insertEntrepriseContactAction = actionClient
  .metadata({ actionName: "insertEntrepriseContactAction" })
  .inputSchema(insertEntrepriseContactSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const canAccess = await hasAccessToEntreprise(
      currentUser.id,
      parsedInput.entrepriseId,
    );
    if (!canAccess) throw errors.forbidden("Accès non autorisé.");

    // Normaliser les champs optionnels : "" → null
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["email", "phone", "fonction", "notes"] as const,
    });

    // Vérifier que l'email n'appartient pas déjà à un compte existant
    if (normalized.email) {
      const existingUser = await db.query.user.findFirst({
        where: eq(userTable.email, normalized.email),
        columns: { id: true },
      });
      if (existingUser) {
        throw errors.conflict(
          "Un compte existe déjà avec cet email. Invitez cet utilisateur via le module Utilisateurs.",
        );
      }
    }

    const [contact] = await db
      .insert(entrepriseContacts)
      .values({
        entrepriseId: normalized.entrepriseId,
        prenom: normalized.prenom,
        nom: normalized.nom,
        email: normalized.email,
        phone: normalized.phone,
        fonction: normalized.fonction,
        notes: normalized.notes,
        userId: parsedInput.userId ?? null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { contact };
  });

/**
 * Met à jour un contact d'entreprise (champs editables uniquement)
 */
export const updateEntrepriseContactAction = actionClient
  .metadata({ actionName: "updateEntrepriseContactAction" })
  .inputSchema(updateEntrepriseContactSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier que le contact existe et récupérer son entrepriseId + email actuel
    const existing = await db.query.entrepriseContacts.findFirst({
      where: eq(entrepriseContacts.id, parsedInput.contactId),
      columns: { id: true, entrepriseId: true, email: true, userId: true },
    });
    if (!existing) throw errors.notFound("Contact non trouvé.");

    if (existing.userId)
      throw errors.conflict(
        "Ce contact possède déjà un compte utilisateur. Modifiez-le depuis le module Utilisateurs.",
      );

    const canAccess = await hasAccessToEntreprise(
      currentUser.id,
      existing.entrepriseId,
    );
    if (!canAccess) throw errors.forbidden("Accès non autorisé.");

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["email", "phone", "fonction", "notes"] as const,
    });

    // Vérifier que le nouvel email n'appartient pas déjà à un compte existant
    // (seulement si l'email a changé par rapport à la valeur actuelle)
    if (normalized.email && normalized.email !== existing.email) {
      const existingUser = await db.query.user.findFirst({
        where: eq(userTable.email, normalized.email),
        columns: { id: true },
      });
      if (existingUser) {
        throw errors.conflict(
          "Un compte existe déjà avec cet email. Invitez cet utilisateur via le module Utilisateurs.",
        );
      }
    }

    const [contact] = await db
      .update(entrepriseContacts)
      .set({
        prenom: normalized.prenom,
        nom: normalized.nom,
        email: normalized.email,
        phone: normalized.phone,
        fonction: normalized.fonction,
        notes: normalized.notes,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(entrepriseContacts.id, parsedInput.contactId))
      .returning();

    return { contact };
  });

/**
 * Supprime un contact d'entreprise (DELETE physique)
 */
export const deleteEntrepriseContactAction = actionClient
  .metadata({ actionName: "deleteEntrepriseContactAction" })
  .inputSchema(z.object({ contactId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const existing = await db.query.entrepriseContacts.findFirst({
      where: eq(entrepriseContacts.id, parsedInput.contactId),
      columns: { id: true, entrepriseId: true, userId: true },
    });
    if (!existing) throw errors.notFound("Contact non trouvé.");

    if (existing.userId)
      throw errors.conflict(
        "Ce contact possède déjà un compte utilisateur. Il ne peut pas être supprimé.",
      );

    const canAccess = await hasAccessToEntreprise(
      currentUser.id,
      existing.entrepriseId,
    );
    if (!canAccess) throw errors.forbidden("Accès non autorisé.");

    // Bloquer si le contact est lié à une relation client↔prestataire
    const [{ value: nbLinks }] = await db
      .select({ value: count() })
      .from(clientPrestataireRelationContacts)
      .where(
        eq(clientPrestataireRelationContacts.contactId, parsedInput.contactId),
      );
    if (nbLinks > 0)
      throw errors.conflict(
        `Impossible de supprimer ce contact : il est référencé dans ${nbLinks} relation${nbLinks > 1 ? "s" : ""} client↔prestataire. Retirez-le d'abord de ces relations.`,
      );

    await db
      .delete(entrepriseContacts)
      .where(eq(entrepriseContacts.id, parsedInput.contactId));

    return { success: true };
  });

// ==================== CONTACTS RELATION ====================

/**
 * Liste les contacts liés à une relation client↔prestataire
 */
export const getRelationContactsAction = actionClient
  .metadata({ actionName: "getRelationContactsAction" })
  .inputSchema(z.object({ relationId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, parsedInput.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const [hasClient, hasPrestataire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, relation.clientEntrepriseId),
      hasAccessToEntreprise(currentUser.id, relation.prestataireEntrepriseId),
    ]);
    if (!hasClient && !hasPrestataire)
      throw errors.forbidden("Accès non autorisé.");

    const contacts = await getRelationContactsByRelationId(
      parsedInput.relationId,
    );
    return { contacts };
  });

/**
 * Lie un contact existant à une relation (avec side, role, estPrincipal)
 */
export const insertRelationContactAction = actionClient
  .metadata({ actionName: "insertRelationContactAction" })
  .inputSchema(insertRelationContactSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, parsedInput.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const canManage = await canManageRelationContacts(
      currentUser.id,
      relation.clientEntrepriseId,
      relation.prestataireEntrepriseId,
    );
    if (!canManage)
      throw errors.forbidden(
        "Seuls les administrateurs et managers peuvent gérer les contacts.",
      );

    // Normaliser role : "" → null
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["role"] as const,
    });

    const [link] = await db
      .insert(clientPrestataireRelationContacts)
      .values({
        relationId: normalized.relationId,
        contactId: normalized.contactId,
        side: normalized.side,
        role: normalized.role,
        estPrincipal: parsedInput.estPrincipal,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      })
      .returning();

    return { link };
  });

/**
 * Retire un contact d'une relation (DELETE physique du lien junction)
 */
export const deleteRelationContactAction = actionClient
  .metadata({ actionName: "deleteRelationContactAction" })
  .inputSchema(z.object({ linkId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const link = await db.query.clientPrestataireRelationContacts.findFirst({
      where: eq(clientPrestataireRelationContacts.id, parsedInput.linkId),
      columns: { id: true, relationId: true },
    });
    if (!link) throw errors.notFound("Lien de contact non trouvé.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, link.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const canManage = await canManageRelationContacts(
      currentUser.id,
      relation.clientEntrepriseId,
      relation.prestataireEntrepriseId,
    );
    if (!canManage)
      throw errors.forbidden(
        "Seuls les administrateurs et managers peuvent gérer les contacts.",
      );

    await db
      .delete(clientPrestataireRelationContacts)
      .where(eq(clientPrestataireRelationContacts.id, parsedInput.linkId));

    return { success: true };
  });

/**
 * Met à jour le rôle et estPrincipal d'un lien contact↔relation.
 * Permission : admin ou manager côté client OU côté prestataire (+ plateforme).
 */
export const updateRelationContactAction = actionClient
  .metadata({ actionName: "updateRelationContactAction" })
  .inputSchema(updateRelationContactSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const link = await db.query.clientPrestataireRelationContacts.findFirst({
      where: eq(clientPrestataireRelationContacts.id, parsedInput.linkId),
      columns: { id: true, relationId: true },
    });
    if (!link) throw errors.notFound("Lien de contact non trouvé.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, link.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const canManage = await canManageRelationContacts(
      currentUser.id,
      relation.clientEntrepriseId,
      relation.prestataireEntrepriseId,
    );
    if (!canManage)
      throw errors.forbidden(
        "Seuls les administrateurs et managers peuvent gérer les contacts.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["role"] as const,
    });

    const [updated] = await db
      .update(clientPrestataireRelationContacts)
      .set({
        role: normalized.role,
        estPrincipal: parsedInput.estPrincipal,
        updatedById: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(clientPrestataireRelationContacts.id, parsedInput.linkId))
      .returning();

    return { link: updated };
  });

/**
 * Récupère les contacts d'une entreprise accessibles via une relation client↔prestataire.
 * Retourne les contacts de targetEntrepriseId qui ne sont pas encore liés à la relation.
 * Permission : accès via la relation (pas via hasAccessToEntreprise direct).
 */
export const getEntrepriseContactsForRelationAction = actionClient
  .metadata({ actionName: "getEntrepriseContactsForRelationAction" })
  .inputSchema(z.object({ relationId: z.uuid(), targetEntrepriseId: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, parsedInput.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const [hasClient, hasPrestataire] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, relation.clientEntrepriseId),
      hasAccessToEntreprise(currentUser.id, relation.prestataireEntrepriseId),
    ]);
    if (!hasClient && !hasPrestataire)
      throw errors.forbidden("Accès non autorisé.");

    // Contacts de targetEntrepriseId non encore liés à cette relation
    const [contacts, [totalRow]] = await Promise.all([
      db
        .select({
          id: entrepriseContacts.id,
          prenom: entrepriseContacts.prenom,
          nom: entrepriseContacts.nom,
          fonction: entrepriseContacts.fonction,
          email: entrepriseContacts.email,
          phone: entrepriseContacts.phone,
        })
        .from(entrepriseContacts)
        .where(
          and(
            eq(entrepriseContacts.entrepriseId, parsedInput.targetEntrepriseId),
            notExists(
              db
                .select({ _: clientPrestataireRelationContacts.id })
                .from(clientPrestataireRelationContacts)
                .where(
                  and(
                    eq(
                      clientPrestataireRelationContacts.relationId,
                      parsedInput.relationId,
                    ),
                    eq(
                      clientPrestataireRelationContacts.contactId,
                      entrepriseContacts.id,
                    ),
                  ),
                ),
            ),
          ),
        )
        .orderBy(entrepriseContacts.nom, entrepriseContacts.prenom),
      db
        .select({ total: count() })
        .from(entrepriseContacts)
        .where(
          eq(entrepriseContacts.entrepriseId, parsedInput.targetEntrepriseId),
        ),
    ]);

    return { contacts, totalContactCount: totalRow?.total ?? 0 };
  });

/**
 * Crée un nouveau contact dans entrepriseContacts et le lie à une relation.
 * Permission : accès via la relation (pas via hasAccessToEntreprise direct sur targetEntrepriseId).
 * Atomique : les deux insertions se font dans une même transaction.
 */
export const insertEntrepriseContactAndLinkToRelationAction = actionClient
  .metadata({ actionName: "insertEntrepriseContactAndLinkToRelationAction" })
  .inputSchema(insertEntrepriseContactAndLinkToRelationSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const relation = await db.query.clientPrestataireRelations.findFirst({
      where: eq(clientPrestataireRelations.id, parsedInput.relationId),
      columns: {
        id: true,
        clientEntrepriseId: true,
        prestataireEntrepriseId: true,
      },
    });
    if (!relation) throw errors.notFound("Relation non trouvée.");

    const canManage = await canManageRelationContacts(
      currentUser.id,
      relation.clientEntrepriseId,
      relation.prestataireEntrepriseId,
    );
    if (!canManage)
      throw errors.forbidden(
        "Seuls les administrateurs et managers peuvent gérer les contacts.",
      );

    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["email", "phone", "fonction", "notes", "role"] as const,
    });

    // Si email fourni, vérifier qu'il n'existe pas déjà dans entrepriseContacts pour cette entreprise
    if (normalized.email) {
      const existingContact = await db.query.entrepriseContacts.findFirst({
        where: and(
          eq(entrepriseContacts.entrepriseId, normalized.targetEntrepriseId),
          eq(entrepriseContacts.email, normalized.email),
        ),
        columns: { id: true },
      });
      if (existingContact)
        throw errors.conflict(
          "Ce contact existe déjà pour cette entreprise. Utilisez « Choisir existant ».",
        );
    }

    const link = await db.transaction(async (tx) => {
      const [contact] = await tx
        .insert(entrepriseContacts)
        .values({
          entrepriseId: normalized.targetEntrepriseId,
          prenom: normalized.prenom,
          nom: normalized.nom,
          email: normalized.email,
          phone: normalized.phone,
          fonction: normalized.fonction,
          notes: normalized.notes,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      const [relationContact] = await tx
        .insert(clientPrestataireRelationContacts)
        .values({
          relationId: normalized.relationId,
          contactId: contact.id,
          side: normalized.side,
          role: normalized.role,
          estPrincipal: parsedInput.estPrincipal,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      return relationContact;
    });

    return { link };
  });

/**
 * Vérifie si un utilisateur peut gérer les contacts d'une relation (ajouter/supprimer).
 * Requiert d'être admin ou manager côté client OU côté prestataire.
 */
async function canManageRelationContacts(
  userId: string,
  clientEntrepriseId: string,
  prestataireEntrepriseId: string,
): Promise<boolean> {
  const plateformeRole = await getEffectivePlateformeRole(userId);
  if (plateformeRole) return true;

  const [clientAdhesion, prestataireAdhesion] = await Promise.all([
    getUserClientAdhesion({ userId, entrepriseId: clientEntrepriseId }),
    getUserPrestataireAdhesion({ userId }),
  ]);

  const isClientAdminOrManager =
    (clientAdhesion?.role === "admin" || clientAdhesion?.role === "manager") &&
    clientAdhesion.statut === "actif";

  const isPrestataireAdminOrManager =
    prestataireAdhesion?.entrepriseId === prestataireEntrepriseId &&
    (prestataireAdhesion.role === "admin" ||
      prestataireAdhesion.role === "manager") &&
    prestataireAdhesion.statut === "actif";

  return isClientAdminOrManager || isPrestataireAdminOrManager;
}

/**
 * Vérifie si un client peut gérer les informations d'un prestataire
 * (le prestataire n'a pas d'admin actif ET l'utilisateur est admin/manager client lié à ce prestataire)
 */
async function canManagePrestataireInfosAsClient(
  userId: string,
  prestataireEntrepriseId: string,
): Promise<boolean> {
  // 1. Le prestataire a-t-il un admin actif ?
  const prestataireActiveAdmin =
    await db.query.userPrestataireAdhesions.findFirst({
      where: and(
        eq(userPrestataireAdhesions.entrepriseId, prestataireEntrepriseId),
        eq(userPrestataireAdhesions.role, "admin"),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
      columns: { id: true },
    });
  if (prestataireActiveAdmin) return false;

  // 2. L'utilisateur est-il admin/manager client actif ?
  const clientAdhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, userId),
      eq(userClientAdhesions.statut, "actif"),
      inArray(userClientAdhesions.role, ["admin", "manager"]),
    ),
    columns: { entrepriseId: true },
  });
  if (!clientAdhesion) return false;

  // 3. Le prestataire est-il lié à ce client ?
  const relation = await db.query.clientPrestataireRelations.findFirst({
    where: and(
      eq(
        clientPrestataireRelations.prestataireEntrepriseId,
        prestataireEntrepriseId,
      ),
      eq(
        clientPrestataireRelations.clientEntrepriseId,
        clientAdhesion.entrepriseId,
      ),
    ),
    columns: { id: true },
  });
  return !!relation;
}

/**
 * Vérifie si un prestataire peut gérer les informations d'un client en proxy
 * (le client n'a pas d'admin actif ET l'utilisateur est admin/manager prestataire lié à ce client)
 */
async function canManageClientInfosAsProxy(
  userId: string,
  clientEntrepriseId: string,
): Promise<boolean> {
  // 1. Le client a-t-il un admin actif ?
  const clientActiveAdmin = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.entrepriseId, clientEntrepriseId),
      eq(userClientAdhesions.role, "admin"),
      eq(userClientAdhesions.statut, "actif"),
    ),
    columns: { id: true },
  });
  if (clientActiveAdmin) return false;

  // 2. L'utilisateur est-il admin/manager prestataire actif ?
  const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst(
    {
      where: and(
        eq(userPrestataireAdhesions.userId, userId),
        eq(userPrestataireAdhesions.statut, "actif"),
        inArray(userPrestataireAdhesions.role, ["admin", "manager"]),
      ),
      columns: { entrepriseId: true },
    },
  );
  if (!prestataireAdhesion) return false;

  // 3. Le prestataire est-il lié à ce client ?
  const relation = await db.query.clientPrestataireRelations.findFirst({
    where: and(
      eq(
        clientPrestataireRelations.prestataireEntrepriseId,
        prestataireAdhesion.entrepriseId,
      ),
      eq(clientPrestataireRelations.clientEntrepriseId, clientEntrepriseId),
    ),
    columns: { id: true },
  });
  return !!relation;
}

/**
 * Récupère les données SIRENE pour un SIRET donné.
 * Accessible à tout utilisateur authentifié (données publiques).
 */
export const getSireneDataAction = actionClient
  .metadata({ actionName: "getSireneDataAction" })
  .inputSchema(z.object({ siret: z.string().min(14).max(14) }))
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const sireneData = await fetchEntrepriseBySiret(parsedInput.siret);
    if (!sireneData) {
      throw errors.internal(
        "Impossible de récupérer les données depuis l'API SIRENE. Vérifiez le SIRET ou réessayez dans quelques instants.",
      );
    }

    return { sireneData };
  });

/**
 * Met à jour les champs issus de SIRENE d'une entreprise
 * Réservé à la posture plateforme (super_admin_plateforme)
 */
export const updateEntrepriseSireneFieldsAction = actionClient
  .metadata({ actionName: "updateEntrepriseSireneFieldsAction" })
  .inputSchema(updateEntrepriseSireneFieldsSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole) {
      const isClientProxy = await canManagePrestataireInfosAsClient(
        currentUser.id,
        parsedInput.entrepriseId,
      );
      const isPrestataireProxy = await canManageClientInfosAsProxy(
        currentUser.id,
        parsedInput.entrepriseId,
      );
      if (!isClientProxy && !isPrestataireProxy)
        throw errors.forbidden("Réservé à la posture plateforme ou proxy.");
    }

    const {
      entrepriseId,
      nom,
      adresseLigne1,
      codePostal,
      ville,
      formeJuridique,
      numeroTva,
    } = parsedInput;

    const numeroTvaClean =
      numeroTva && numeroTva !== "" ? numeroTva.toUpperCase() : null;

    await db
      .update(entreprises)
      .set({
        nom,
        adresseLigne1: adresseLigne1 || null,
        codePostal: codePostal || null,
        ville: ville || null,
        formeJuridique: formeJuridique || null,
        numeroTva: numeroTvaClean,
        sireneSyncedAt: new Date(),
        updatedById: currentUser.id,
      })
      .where(eq(entreprises.id, entrepriseId));

    return { success: true };
  });

// ==================== INVITATION CONTACT ====================

/**
 * Envoie une invitation à un contact d'entreprise pour créer son compte.
 * Crée un token dans contactsInvitations et envoie un email avec le lien.
 * Rôle forcé à "collaborateur".
 */
export const inviterContactAction = actionClient
  .metadata({ actionName: "inviterContactAction" })
  .inputSchema(inviterContactSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    // Vérifier accès à l'entreprise (plateforme ou admin/manager de l'entreprise)
    const [canAccess, platformRole] = await Promise.all([
      hasAccessToEntreprise(currentUser.id, parsedInput.entrepriseId),
      getUserPlateformeAdhesion(currentUser.id),
    ]);
    if (!canAccess && !platformRole?.role)
      throw errors.forbidden("Accès non autorisé.");

    // Récupérer le contact
    const [contact] = await db
      .select({
        id: entrepriseContacts.id,
        email: entrepriseContacts.email,
        prenom: entrepriseContacts.prenom,
        nom: entrepriseContacts.nom,
        entrepriseId: entrepriseContacts.entrepriseId,
        userId: entrepriseContacts.userId,
      })
      .from(entrepriseContacts)
      .where(eq(entrepriseContacts.id, parsedInput.contactId))
      .limit(1);

    if (!contact) throw errors.notFound("Contact non trouvé.");
    if (!contact.email)
      throw errors.conflict("Ce contact n'a pas d'adresse email.");
    if (contact.userId)
      throw errors.conflict("Ce contact possède déjà un compte utilisateur.");
    if (contact.entrepriseId !== parsedInput.entrepriseId)
      throw errors.forbidden("Le contact n'appartient pas à cette entreprise.");

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, contact.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw errors.conflict(
        "Cette adresse email est déjà associée à un compte existant.",
      );
    }

    // Récupérer le nom de l'entreprise et les rôles pour le type d'adhésion
    const [entreprise] = await db
      .select({ nom: entreprises.nom })
      .from(entreprises)
      .where(eq(entreprises.id, parsedInput.entrepriseId))
      .limit(1);

    if (!entreprise) throw errors.notFound("Entreprise introuvable.");

    const companyRoles = await db
      .select({ role: entrepriseRoles.role })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.entrepriseId, parsedInput.entrepriseId));
    const roles = companyRoles.map((r) => r.role);

    const typeAdhesion: "client" | "prestataire" = roles.includes("client")
      ? "client"
      : "prestataire";

    // Annuler les invitations en attente pour ce contact
    await db
      .delete(contactsInvitations)
      .where(
        and(
          eq(contactsInvitations.contactId, parsedInput.contactId),
          isNull(contactsInvitations.acceptedAt),
        ),
      );

    // Créer la nouvelle invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(contactsInvitations).values({
      entrepriseId: parsedInput.entrepriseId,
      email: contact.email,
      token,
      typeAdhesion,
      contactId: parsedInput.contactId,
      expiresAt,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // Envoyer l'email d'invitation
    const lien = `${env.APP_URL}/auth/inscription?token=${token}`;
    await sendEmailDirect({
      to: contact.email,
      from: "noreply@mg.fm4all.com",
      subject: "Invitation à rejoindre le logiciel FM4ALL",
      text: `
        <h2>Vous avez été invité à rejoindre le logiciel FM4ALL</h2>
        <p>Vous avez été invité à créer votre compte pour l'entreprise <strong>${entreprise.nom}</strong>.</p>
        <p>Cliquez sur le lien ci-dessous pour créer votre compte :</p>
        <p><a href="${lien}">Créer mon compte</a></p>
        <p><small>Ce lien est valable 7 jours.</small></p>
      `,
      nomDestinataire: `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim() || undefined,
      useTemplate: true,
    });

    return { email: contact.email };
  });

/**
 * Accepte une invitation contact : crée le compte utilisateur + adhésion collaborateur
 * + met à jour entrepriseContacts.userId.
 * Appelé depuis la page publique /auth/inscription.
 */
export const accepterInvitationContactAction = actionClient
  .metadata({ actionName: "accepterInvitationContactAction" })
  .inputSchema(accepterInvitationContactSchema)
  .action(async ({ parsedInput }) => {
    // 1. Valider le token
    const [invitation] = await db
      .select({
        id: contactsInvitations.id,
        entrepriseId: contactsInvitations.entrepriseId,
        email: contactsInvitations.email,
        typeAdhesion: contactsInvitations.typeAdhesion,
        contactId: contactsInvitations.contactId,
        createdById: contactsInvitations.createdById,
      })
      .from(contactsInvitations)
      .where(
        and(
          eq(contactsInvitations.token, parsedInput.token),
          isNull(contactsInvitations.acceptedAt),
          gt(contactsInvitations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!invitation)
      throw errors.notFound("Lien d'invitation invalide ou expiré.");

    // 2. Normaliser les données
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["phone", "fonction"] as const,
    });

    // 3. Créer le compte utilisateur
    let authResult;
    try {
      authResult = await auth.api.signUpEmail({
        body: {
          email: invitation.email,
          password: crypto.randomUUID(),
          name: `${normalized.prenom} ${normalized.nom}`,
          prenom: normalized.prenom,
          nom: normalized.nom,
          phone: normalized.phone ?? null,
          avatarId: null,
          createdById: invitation.createdById ?? undefined,
          updatedById: invitation.createdById ?? undefined,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("already exists")) {
        throw errors.conflict(
          "Cette adresse email est déjà associée à un compte existant.",
        );
      }
      throw errors.internal(`Erreur lors de la création du compte : ${msg}`);
    }

    if (!authResult?.user)
      throw errors.internal("Échec de la création du compte.");
    const newUserId = authResult.user.id;

    // 4. Transaction : adhésion collaborateur + userId contact + arborescence + marquer acceptée
    try {
      await db.transaction(async (tx) => {
        if (invitation.typeAdhesion === "client") {
          await tx
            .insert(userClientAdhesions)
            .values({
              userId: newUserId,
              entrepriseId: invitation.entrepriseId,
              role: "collaborateur",
              statut: "actif",
              createdById: invitation.createdById,
              updatedById: invitation.createdById,
            })
            .onConflictDoNothing();
        } else {
          await tx
            .insert(userPrestataireAdhesions)
            .values({
              userId: newUserId,
              entrepriseId: invitation.entrepriseId,
              role: "collaborateur",
              statut: "actif",
              createdById: invitation.createdById,
              updatedById: invitation.createdById,
            })
            .onConflictDoNothing();
        }

        // Mettre à jour ou créer l'entrée dans entrepriseContacts
        if (invitation.contactId) {
          await tx
            .update(entrepriseContacts)
            .set({
              userId: newUserId,
              prenom: normalized.prenom,
              nom: normalized.nom,
              phone: normalized.phone ?? null,
              fonction: normalized.fonction ?? null,
              updatedById: newUserId,
              updatedAt: new Date(),
            })
            .where(eq(entrepriseContacts.id, invitation.contactId));
        } else {
          // Invitation sans contactId (ancienne invitation admin) — créer le contact maintenant
          await tx.insert(entrepriseContacts).values({
            entrepriseId: invitation.entrepriseId,
            prenom: normalized.prenom,
            nom: normalized.nom,
            email: invitation.email,
            phone: normalized.phone ?? null,
            fonction: normalized.fonction ?? null,
            userId: newUserId,
            createdById: invitation.createdById ?? newUserId,
            updatedById: newUserId,
          });
        }

        await tx
          .update(contactsInvitations)
          .set({ acceptedAt: new Date(), updatedById: newUserId })
          .where(eq(contactsInvitations.id, invitation.id));

        await insertUserArborescence({
          entrepriseId: invitation.entrepriseId,
          userId: newUserId,
          parentId: null,
          createdById: invitation.createdById ?? newUserId,
          tx,
        });
      });
    } catch (txError) {
      try {
        const betterAuthCtx = await auth.$context;
        await betterAuthCtx.internalAdapter.deleteUser(newUserId);
      } catch {
        // Ignorer l'erreur de cleanup
      }
      throw txError;
    }

    // 5. Envoyer email pour définir le mot de passe
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: invitation.email,
          redirectTo: `${env.APP_URL}/auth/reset-password?type=activation`,
        },
        headers: await headers(),
      });
    } catch {
      // Non bloquant
    }

    return {
      message:
        "Votre compte a été créé. Un email vous a été envoyé pour définir votre mot de passe.",
    };
  });
