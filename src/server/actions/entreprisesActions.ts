"use server";

import { db } from "@/db";
import { entreprises, entrepriseRoles, serviceEntreprises } from "@/db/schema/entreprises";
import { clientServices, clientServiceExecutions } from "@/db/schema/services";
import { documents } from "@/db/schema/documents";
import { count, ilike, eq, ne, and, inArray } from "drizzle-orm";
import { promoteS3Key, deleteS3Object as deleteS3ObjectFromServer } from "@/server/s3/s3";
import { userClientAdhesions } from "@/db/schema/users";
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
import { getUserClientAdhesion } from "@/server/queries/userAdhesions.query";
import {
  getProspectsPaginated,
  countProspects,
} from "@/server/queries/prospects.query";
import { getAllServices } from "@/server/queries/services.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
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
import { headers } from "next/headers";
import { z } from "zod";
import { capitalizeWords, lower, normalizeForSubmit } from "@/zod-helpers/normalize";

/**
 * Récupère la liste de toutes les entreprises
 * Utilisé pour afficher les noms dans les colonnes relationnelles
 */
export const getEntreprisesAction = actionClient
  .metadata({ actionName: "getEntreprisesAction" })
  .action(async () => {
    const entreprisesData = await getAllEntreprises();
    return { entreprises: entreprisesData };
  });

/**
 * Récupère la liste des entreprises clientes
 * Réservé à la plateforme uniquement
 */
export const getEntreprisesClientesAction = actionClient
  .metadata({ actionName: "getEntreprisesClientesAction" })
  .action(async () => {
    // Vérifier que l'utilisateur est plateforme
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);

    if (!plateformeRole) {
      throw errors.forbidden(
        "Seule la plateforme peut accéder à cette ressource.",
      );
    }

    const clients = await getEntreprisesClientes();

    return { clients };
  });

/**
 * Récupère la liste des entreprises prestataires
 * Utilisé pour le filtre prestataire dans les tickets
 */
export const getEntreprisesPrestatairesAction = actionClient
  .metadata({ actionName: "getEntreprisesPrestatairesAction" })
  .action(async () => {
    const prestataires = await getEntreprisesPrestataires();
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const adhesion = await getUserClientAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });
    if (!adhesion) throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");

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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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
      adminPrenom,
      adminNom,
      adminEmail,
      adminPhone,
    } = parsedInput;

    // Normaliser les champs optionnels: "" → null + appliquer la casse
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["prenomContact", "nomContact", "emailContact", "phoneContact", "adminPhone"] as const,
    });

    // Nettoyer le nom (capitalisation) et le SIRET (supprimer espaces éventuels)
    const nomClean = capitalizeWords(nom);
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

    // ===== ÉTAPE 2: Créer l'utilisateur admin via better-auth =====
    const tempPassword = crypto.randomUUID();

    let newUser: { id: string; email: string };

    try {
      const authResult = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: tempPassword,
          name: `${adminPrenom} ${adminNom}`,
          prenom: adminPrenom,
          nom: adminNom,
          phone: normalized.adminPhone ?? null,
          avatarId: null,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        },
      });

      if (!authResult?.user) {
        throw new Error("Échec de la création de l'utilisateur.");
      }

      newUser = { id: authResult.user.id, email: authResult.user.email };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("user already exists")
      ) {
        throw errors.conflict(
          `Un utilisateur avec l'email "${adminEmail}" existe déjà.`,
        );
      }

      throw errors.internal(
        `Erreur lors de la création de l'administrateur: ${errorMessage}`,
      );
    }

    // ===== ÉTAPE 3: Créer l'adhésion admin + arborescence =====
    await db.transaction(async (tx) => {
      await tx.insert(userClientAdhesions).values({
        userId: newUser.id,
        entrepriseId: newEntreprise.id,
        role: "admin",
        statut: "actif",
        createdById: currentUser.id,
        updatedById: currentUser.id,
      });

      // Arborescence sans parent (premier admin de l'entreprise)
      await insertUserArborescence({
        entrepriseId: newEntreprise.id,
        userId: newUser.id,
        parentId: null,
        createdById: currentUser.id,
        tx,
      });
    });

    // ===== ÉTAPE 4: Envoyer l'email d'activation =====
    // better-auth détecte emailVerified=false et envoie l'email d'activation
    const reqHeaders = await headers();
    await auth.api.requestPasswordReset({
      body: {
        email: adminEmail,
        redirectTo: `${process.env.APP_URL}/auth/reset-password`,
      },
      headers: reqHeaders,
    });

    return {
      entreprise: newEntreprise,
      message: `Entreprise "${nomClean}" créée avec succès. Un email d'activation a été envoyé à ${adminEmail}.`,
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!plateformeRole)
      throw errors.forbidden("Seule la plateforme peut modifier les entreprises.");

    const { entrepriseId, nom, siret } = parsedInput;
    const nomClean = capitalizeWords(nom);
    const siretClean = siret.trim().replace(/\s/g, "");

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
        .set({ nom: nomClean, siret: siretClean, updatedById: currentUser.id })
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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

    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
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
