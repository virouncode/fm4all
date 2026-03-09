"use server";

import { db } from "@/db";
import { entreprises, entrepriseRoles, serviceEntreprises, entrepriseInvitations } from "@/db/schema/entreprises";
import { clientServices, clientServiceExecutions } from "@/db/schema/services";
import { documents } from "@/db/schema/documents";
import { count, ilike, eq, ne, and, inArray, isNull, gt } from "drizzle-orm";
import { promoteS3Key, deleteS3Object as deleteS3ObjectFromServer } from "@/server/s3/s3";
import { user as userTable } from "@/db/schema/auth";
import { userClientAdhesions, userPrestataireAdhesions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { auth } from "@/server/auth/auth";
import { getSession } from "@/server/auth/get-session";
import {
  getAllEntreprises,
  getEntreprisesClientes,
  getEntreprisesPrestataires,
  getEntreprisesPaginated,
  countEntreprises,
  getEntrepriseWithDetailsById,
  getServicesByEntrepriseId,
} from "@/server/queries/entreprises.query";
import { getMesClients, getClientPrestataires } from "@/server/queries/clientServiceExecutions.query";
import { getUserClientAdhesion, getUserPrestataireAdhesion } from "@/server/queries/userAdhesions.query";
import {
  getProspectsPaginated,
  countProspects,
} from "@/server/queries/prospects.query";
import { getAllServices } from "@/server/queries/services.query";
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
import { insertUserArborescence } from "@/server/utils/usersArborescence.utils";
import {
  insertEntrepriseFormSchema,
  updateEntrepriseInfosSchema,
  updateEntrepriseContactSchema,
  updateEntrepriseRolesSchema,
  updateEntrepriseLogoSchema,
  type RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { flattenValidationErrors } from "next-safe-action";
import { headers, cookies } from "next/headers";
import { z } from "zod";
import { capitalizeWords, lower, normalizeForSubmit, upper } from "@/zod-helpers/normalize";
import { sendEmailDirect } from "@/server/email/mailgunDirect";
import {
  accepterInvitationAdminSchema,
  inviterEntrepriseAdminSchema,
} from "@/zod-schemas/inscriptionAdmin.schema";

/**
 * Récupère la liste de toutes les entreprises
 * Utilisé pour afficher les noms dans les colonnes relationnelles
 */
export const getEntreprisesAction = actionClient
  .metadata({ actionName: "getEntreprisesAction" })
  .action(async () => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

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
    const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
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
    if (!session?.user) throw errors.unauthorized("Vous n'êtes pas authentifié.");

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
    const prestataires = await getClientPrestataires(clientAdhesion.entrepriseId);
    return { prestataires };
  });

// ==================== PAGINATED LIST ====================

const entreprisesQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["client", "prestataire", "plateforme"]).optional(),
  orderBy: z.enum(["nom", "createdAt"]).optional(),
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
      countEntreprises({ search, role: role as RoleEntrepriseType | undefined }),
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
  .inputSchema(
    z.object({ entrepriseId: z.string().uuid() }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
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
              eq(userPrestataireAdhesions.entrepriseId, parsedInput.entrepriseId),
              eq(userPrestataireAdhesions.statut, "actif"),
            ),
          )
          .limit(1),
      ]);

      if (!clientAdhesionRows[0] && !prestataireAdhesionRows[0]) {
        throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
      }
    }

    const entreprise = await getEntrepriseWithDetailsById(parsedInput.entrepriseId);
    if (!entreprise) throw errors.notFound("Entreprise introuvable.");

    const services = entreprise.roles.includes("prestataire")
      ? await getServicesByEntrepriseId(parsedInput.entrepriseId)
      : [];

    return { entreprise, services };
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
 * Utilisé dans le formulaire de création d'une entreprise prestataire
 */
export const getAllServicesAction = actionClient
  .metadata({ actionName: "getAllServicesAction" })
  .action(async () => {
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
      throw errors.forbidden(
        "Seule la plateforme peut créer des entreprises.",
      );
    }

    const {
      nom,
      siret,
      prenomContact,
      nomContact,
      emailContact,
      phoneContact,
      roles,
      serviceIds,
      numeroTva,
    } = parsedInput;

    // Normaliser les champs optionnels: "" → null + appliquer la casse
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["prenomContact", "nomContact", "emailContact", "phoneContact", "numeroTva"] as const,
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
            prenomContact: normalized.prenomContact ? capitalizeWords(normalized.prenomContact) : null,
            nomContact: normalized.nomContact ? capitalizeWords(normalized.nomContact) : null,
            emailContact: normalized.emailContact ? lower(normalized.emailContact) : null,
            phoneContact: normalized.phoneContact,
            numeroTva: normalized.numeroTva ? normalized.numeroTva.toUpperCase() : null,
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

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut modifier les entreprises.");

    const { entrepriseId, nom, siret, numeroTva } = parsedInput;
    const nomClean = upper(nom);
    const siretClean = siret.trim().replace(/\s/g, "");
    const numeroTvaClean = numeroTva && numeroTva !== "" ? numeroTva.toUpperCase() : null;

    // Unicité nom (hors l'entreprise elle-même)
    const existingByNom = await db
      .select({ id: entreprises.id })
      .from(entreprises)
      .where(and(ilike(entreprises.nom, nomClean), ne(entreprises.id, entrepriseId)))
      .limit(1);
    if (existingByNom.length > 0)
      throw errors.conflict(`Une entreprise avec le nom "${nomClean}" existe déjà.`);

    try {
      await db
        .update(entreprises)
        .set({ nom: nomClean, siret: siretClean, numeroTva: numeroTvaClean, updatedById: currentUser.id })
        .where(eq(entreprises.id, entrepriseId));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes("entreprises_siret_key"))
        throw errors.conflict(`Une entreprise avec le SIRET "${siretClean}" existe déjà.`);
      throw errors.internal(`Erreur lors de la mise à jour: ${msg}`);
    }

    return { success: true };
  });

/**
 * Met à jour les informations de contact d'une entreprise
 */
export const updateEntrepriseContactAction = actionClient
  .metadata({ actionName: "updateEntrepriseContactAction" })
  .inputSchema(updateEntrepriseContactSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut modifier les entreprises.");

    const { entrepriseId, prenomContact, nomContact, emailContact, phoneContact } = parsedInput;

    const normalized = normalizeForSubmit(
      { prenomContact, nomContact, emailContact, phoneContact },
      { optionalStrings: ["prenomContact", "nomContact", "emailContact", "phoneContact"] as const },
    );

    await db
      .update(entreprises)
      .set({
        prenomContact: normalized.prenomContact ? capitalizeWords(normalized.prenomContact) : null,
        nomContact: normalized.nomContact ? capitalizeWords(normalized.nomContact) : null,
        emailContact: normalized.emailContact ? lower(normalized.emailContact) : null,
        phoneContact: normalized.phoneContact,
        updatedById: currentUser.id,
      })
      .where(eq(entreprises.id, entrepriseId));

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

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut modifier les entreprises.");

    const { entrepriseId, roles, serviceIds } = parsedInput;
    const isPrestataire = roles.includes("prestataire");

    // --- Récupérer l'état actuel en DB ---
    const currentRolesRows = await db
      .select({ role: entrepriseRoles.role })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.entrepriseId, entrepriseId));
    const currentRoles = currentRolesRows.map((r) => r.role);

    const currentServiceRows = await db
      .select({ id: serviceEntreprises.id, serviceId: serviceEntreprises.serviceId })
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
        .where(inArray(clientServiceExecutions.serviceEntrepriseId, serviceEntrepriseIdsToCheck));

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
      await tx.delete(entrepriseRoles).where(eq(entrepriseRoles.entrepriseId, entrepriseId));
      await tx.insert(entrepriseRoles).values(
        roles.map((role) => ({
          entrepriseId,
          role,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })),
      );

      // 2. Remplacer les services
      await tx.delete(serviceEntreprises).where(eq(serviceEntreprises.entrepriseId, entrepriseId));
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
 * Récupère les services d'une entreprise prestataire
 * Utilisé dans la vue détail pour afficher les services proposés
 */
export const getEntrepriseServicesAction = actionClient
  .metadata({ actionName: "getEntrepriseServicesAction" })
  .inputSchema(z.object({ entrepriseId: z.string().uuid() }), {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut accéder à cette ressource.");

    const servicesData = await getServicesByEntrepriseId(parsedInput.entrepriseId);
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

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut modifier les entreprises.");

    const { entrepriseId, logo } = parsedInput;

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

/**
 * Enregistre une invitation administrateur pour une entreprise (posture plateforme).
 * Ne crée PAS de compte utilisateur — envoie uniquement un email avec un lien d'onboarding.
 */
export const inviterEntrepriseAdminAction = actionClient
  .metadata({ actionName: "inviterEntrepriseAdminAction" })
  .inputSchema(inviterEntrepriseAdminSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;
    if (!currentUser) throw errors.unauthorized("Vous n'êtes pas authentifié.");

    const plateformeRole = await getEffectivePlateformeRole(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden(
        "Seule la plateforme peut inviter des administrateurs.",
      );

    // 1. Vérifier qu'il n'y a pas déjà un admin actif
    const existingClientAdmin = await db
      .select({ id: userClientAdhesions.id })
      .from(userClientAdhesions)
      .where(
        and(
          eq(userClientAdhesions.entrepriseId, parsedInput.entrepriseId),
          eq(userClientAdhesions.role, "admin"),
          eq(userClientAdhesions.statut, "actif"),
        ),
      )
      .limit(1);

    const existingPrestataireAdmin = await db
      .select({ id: userPrestataireAdhesions.id })
      .from(userPrestataireAdhesions)
      .where(
        and(
          eq(userPrestataireAdhesions.entrepriseId, parsedInput.entrepriseId),
          eq(userPrestataireAdhesions.role, "admin"),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      )
      .limit(1);

    if (existingClientAdmin.length > 0 || existingPrestataireAdmin.length > 0) {
      throw errors.conflict(
        "Cette entreprise possède déjà un administrateur actif.",
      );
    }

    // 2. Vérifier que l'email n'est pas déjà utilisé par un compte existant
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

    // 3. Récupérer le nom de l'entreprise pour l'email
    const [entreprise] = await db
      .select({ nom: entreprises.nom })
      .from(entreprises)
      .where(eq(entreprises.id, parsedInput.entrepriseId))
      .limit(1);

    if (!entreprise) throw errors.notFound("Entreprise introuvable.");

    // 3. Annuler les invitations en attente existantes
    await db
      .delete(entrepriseInvitations)
      .where(
        and(
          eq(entrepriseInvitations.entrepriseId, parsedInput.entrepriseId),
          isNull(entrepriseInvitations.acceptedAt),
        ),
      );

    // 4. Créer la nouvelle invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sentAt = new Date();

    await db.insert(entrepriseInvitations).values({
      entrepriseId: parsedInput.entrepriseId,
      email: parsedInput.email,
      token,
      expiresAt,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    // 5. Envoyer l'email d'invitation
    const lien = `${process.env.APP_URL}/auth/inscription-admin?token=${token}`;
    await sendEmailDirect({
      to: parsedInput.email,
      subject: "Invitation à rejoindre FM4ALL",
      text: `
        <h2>Vous avez été invité à rejoindre FM4ALL</h2>
        <p>Vous avez été invité à créer votre compte administrateur pour l'entreprise <strong>${entreprise.nom}</strong>.</p>
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

/**
 * Accepte une invitation administrateur : crée le compte + les adhésions.
 * Appelé depuis la page publique /auth/inscription-admin.
 */
export const accepterInvitationAdminAction = actionClient
  .metadata({ actionName: "accepterInvitationAdminAction" })
  .inputSchema(accepterInvitationAdminSchema)
  .action(async ({ parsedInput }) => {
    // 1. Valider le token
    const [invitation] = await db
      .select({
        id: entrepriseInvitations.id,
        entrepriseId: entrepriseInvitations.entrepriseId,
        email: entrepriseInvitations.email,
        createdById: entrepriseInvitations.createdById,
      })
      .from(entrepriseInvitations)
      .where(
        and(
          eq(entrepriseInvitations.token, parsedInput.token),
          isNull(entrepriseInvitations.acceptedAt),
          gt(entrepriseInvitations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!invitation)
      throw errors.notFound("Lien d'invitation invalide ou expiré.");

    // 2. Récupérer les rôles de l'entreprise
    const companyRoles = await db
      .select({ role: entrepriseRoles.role })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.entrepriseId, invitation.entrepriseId));

    const roles = companyRoles.map((r) => r.role);

    // 3. Normaliser les données
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["phone"] as const,
    });

    // 4. Créer le compte utilisateur
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
          `Un compte avec l'email "${invitation.email}" existe déjà.`,
        );
      }
      throw errors.internal(`Erreur lors de la création du compte : ${msg}`);
    }

    if (!authResult?.user) throw errors.internal("Échec de la création du compte.");
    const newUserId = authResult.user.id;

    // 6. Transaction : adhésions + marquer invitation acceptée
    // Si la transaction échoue, supprimer l'utilisateur Better Auth pour éviter un compte orphelin
    try {
      await db.transaction(async (tx) => {
        if (roles.includes("client")) {
          await tx
            .insert(userClientAdhesions)
            .values({
              userId: newUserId,
              entrepriseId: invitation.entrepriseId,
              role: "admin",
              statut: "actif",
              createdById: invitation.createdById,
              updatedById: invitation.createdById,
            })
            .onConflictDoNothing();
        }

        if (roles.includes("prestataire")) {
          await tx
            .insert(userPrestataireAdhesions)
            .values({
              userId: newUserId,
              entrepriseId: invitation.entrepriseId,
              role: "admin",
              statut: "actif",
              createdById: invitation.createdById,
              updatedById: invitation.createdById,
            })
            .onConflictDoNothing();
        }

        await tx
          .update(entrepriseInvitations)
          .set({ acceptedAt: new Date(), updatedById: newUserId })
          .where(eq(entrepriseInvitations.id, invitation.id));

        // Entrée closure table (racine — admin sans parent hiérarchique)
        await insertUserArborescence({
          entrepriseId: invitation.entrepriseId,
          userId: newUserId,
          parentId: null,
          createdById: invitation.createdById ?? newUserId,
          tx,
        });
      });
    } catch (txError) {
      // Rollback via le contexte interne de Better Auth (cascades sessions/accounts)
      try {
        const betterAuthCtx = await auth.$context;
        await betterAuthCtx.internalAdapter.deleteUser(newUserId);
      } catch {
        // Ignorer l'erreur de cleanup — log suffisant côté serveur
      }
      throw txError;
    }

    // 7. Envoyer email pour définir le mot de passe
    // Ne pas faire échouer l'action si l'email échoue : le compte est déjà créé.
    // L'utilisateur peut demander un nouveau lien depuis la page de login.
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: invitation.email,
          redirectTo: `${process.env.APP_URL}/auth/reset-password?type=activation`,
        },
        headers: await headers(),
      });
    } catch {
      // Email non bloquant — le compte est créé, l'utilisateur peut réinitialiser son mdp
    }

    return {
      message:
        "Votre compte a été créé. Un email vous a été envoyé pour définir votre mot de passe.",
    };
  });
