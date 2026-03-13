import "server-only";

import { ModePilotageType } from "@/zod-schemas/clientServiceExecutions.schema";
import {
  OccurrenceStatutType,
  OccurrenceTacheStatutType,
} from "@/zod-schemas/enums";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { documents, documentsLinks } from "@/db/schema/documents";
import {
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServices,
  services,
  tacheListeItems,
  tacheListesTemplates,
} from "@/db/schema/services";
import {
  clientPrestataireRelations,
  entrepriseRoles,
  serviceEntreprises,
  entreprises,
} from "@/db/schema/entreprises";
import { sites } from "@/db/schema/sites";
import { userClientAdhesions, userClientSiteAttributions, userPrestataireAdhesions } from "@/db/schema/users";
import { occurrenceTaches } from "@/db/schema/services";
import { and, asc, count, desc, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

/**
 * Récupère la liste des prestataires avec lesquels un client a une relation
 * (via clientServiceExecutions actifs)
 *
 * @param clientEntrepriseId - ID de l'entreprise cliente
 * @returns Liste des prestataires avec id et nom
 */
export async function getClientPrestataires(
  clientEntrepriseId: string
): Promise<Array<{ id: string; nom: string }>> {
  const results = await db
    .selectDistinct({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(clientServiceExecutions)
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId)
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId)
    )
    .innerJoin(
      entreprises,
      eq(entreprises.id, serviceEntreprises.entrepriseId)
    )
    .where(
      and(
        eq(clientServices.entrepriseId, clientEntrepriseId),
        eq(clientServices.statut, "actif"),
        eq(clientServiceExecutions.actif, true),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, new Date())
        )
      )
    )
    .orderBy(entreprises.nom);

  return results;
}

// ==================== MES PRESTATAIRES AVEC DETAILS (Posture Client) ====================

export type PrestataireAvecDetails = {
  id: string;
  nom: string;
  siret: string;
  numeroTva: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  formeJuridique: string | null;
  sireneSyncedAt: Date | null;
  createdAt: Date;
  logoStorageKey: string | null;
  roles: string[];
  hasActiveAdmin: boolean;
  adminEmail: string | null;
  services: Array<{ id: string; nom: string }>;
  relationId: string | null;
};

/**
 * Récupère les prestataires du client via UNION de :
 * - Relations explicites (client_prestataire_relations)
 * - Exécutions actives (clientServiceExecutions)
 * Enrichi avec siret, contact et rôles.
 */
export async function getClientPrestatairesAvecDetails(
  clientEntrepriseId: string,
): Promise<PrestataireAvecDetails[]> {
  // 1. IDs depuis les relations explicites
  const fromRelations = await db
    .select({ id: clientPrestataireRelations.prestataireEntrepriseId })
    .from(clientPrestataireRelations)
    .where(
      eq(clientPrestataireRelations.clientEntrepriseId, clientEntrepriseId),
    );

  // 2. IDs depuis les exécutions actives
  const fromExecutions = await db
    .selectDistinct({ id: entreprises.id })
    .from(clientServiceExecutions)
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId),
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .innerJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .where(
      and(
        eq(clientServices.entrepriseId, clientEntrepriseId),
        eq(clientServices.statut, "actif"),
        eq(clientServiceExecutions.actif, true),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, new Date()),
        ),
      ),
    );

  // 3. Déduplication
  const allIds = [
    ...new Set([
      ...fromRelations.map((r) => r.id),
      ...fromExecutions.map((r) => r.id),
    ]),
  ];
  if (allIds.length === 0) return [];

  // 4. Fetch détails entreprises (+ logo via LEFT JOIN documents)
  const rows = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
      siret: entreprises.siret,
      numeroTva: entreprises.numeroTva,
      adresseLigne1: entreprises.adresseLigne1,
      adresseLigne2: entreprises.adresseLigne2,
      codePostal: entreprises.codePostal,
      ville: entreprises.ville,
      formeJuridique: entreprises.formeJuridique,
      sireneSyncedAt: entreprises.sireneSyncedAt,
      createdAt: entreprises.createdAt,
      logoStorageKey: documents.storageKey,
    })
    .from(entreprises)
    .leftJoin(documents, eq(documents.id, entreprises.logoId))
    .where(inArray(entreprises.id, allIds))
    .orderBy(entreprises.nom);

  // 5. Fetch rôles
  const rolesRows = await db
    .select({
      entrepriseId: entrepriseRoles.entrepriseId,
      role: entrepriseRoles.role,
    })
    .from(entrepriseRoles)
    .where(inArray(entrepriseRoles.entrepriseId, allIds));

  const rolesByEntrepriseId = new Map<string, string[]>();
  for (const r of rolesRows) {
    if (!rolesByEntrepriseId.has(r.entrepriseId)) {
      rolesByEntrepriseId.set(r.entrepriseId, []);
    }
    rolesByEntrepriseId.get(r.entrepriseId)!.push(r.role);
  }

  // 6. Check hasActiveAdmin + fetch email du premier admin actif prestataire
  const adminRows = await db
    .select({
      entrepriseId: userPrestataireAdhesions.entrepriseId,
      email: user.email,
    })
    .from(userPrestataireAdhesions)
    .innerJoin(user, eq(user.id, userPrestataireAdhesions.userId))
    .where(
      and(
        inArray(userPrestataireAdhesions.entrepriseId, allIds),
        eq(userPrestataireAdhesions.role, "admin"),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    );
  const hasAdminSet = new Set(adminRows.map((r) => r.entrepriseId));
  // Premier admin actif par entreprise (ordre non garanti, on prend le premier)
  const adminEmailByEntrepriseId = new Map<string, string>();
  for (const r of adminRows) {
    if (!adminEmailByEntrepriseId.has(r.entrepriseId)) {
      adminEmailByEntrepriseId.set(r.entrepriseId, r.email);
    }
  }

  // 7. Fetch services offerts par chaque prestataire
  const serviceRows = await db
    .select({
      entrepriseId: serviceEntreprises.entrepriseId,
      serviceId: services.id,
      serviceNom: services.nom,
    })
    .from(serviceEntreprises)
    .innerJoin(services, eq(services.id, serviceEntreprises.serviceId))
    .where(
      and(
        inArray(serviceEntreprises.entrepriseId, allIds),
        eq(serviceEntreprises.actif, true),
      ),
    );

  const servicesByEntrepriseId = new Map<
    string,
    Array<{ id: string; nom: string }>
  >();
  for (const r of serviceRows) {
    if (!servicesByEntrepriseId.has(r.entrepriseId)) {
      servicesByEntrepriseId.set(r.entrepriseId, []);
    }
    servicesByEntrepriseId.get(r.entrepriseId)!.push({
      id: r.serviceId,
      nom: r.serviceNom,
    });
  }

  // 8. Fetch relation IDs
  const relationRows = await db
    .select({
      prestataireEntrepriseId: clientPrestataireRelations.prestataireEntrepriseId,
      relationId: clientPrestataireRelations.id,
    })
    .from(clientPrestataireRelations)
    .where(
      and(
        eq(clientPrestataireRelations.clientEntrepriseId, clientEntrepriseId),
        inArray(clientPrestataireRelations.prestataireEntrepriseId, allIds),
      ),
    );

  const relationByPrestataireId = new Map<string, string>();
  for (const r of relationRows) {
    relationByPrestataireId.set(r.prestataireEntrepriseId, r.relationId);
  }

  return rows.map((p) => ({
    ...p,
    logoStorageKey: p.logoStorageKey ?? null,
    roles: rolesByEntrepriseId.get(p.id) ?? [],
    hasActiveAdmin: hasAdminSet.has(p.id),
    adminEmail: adminEmailByEntrepriseId.get(p.id) ?? null,
    services: servicesByEntrepriseId.get(p.id) ?? [],
    relationId: relationByPrestataireId.get(p.id) ?? null,
  }));
}

// ==================== PRESTATAIRES FOR SERVICE ====================

/**
 * Récupère les prestataires actifs offrant un service donné.
 *
 * - Si clientEntrepriseId fourni (mode direct) : uniquement les prestataires
 *   référencés dans client_prestataire_relations pour ce client (et offrant le service).
 * - Sinon (mode intermédiaire FM4ALL / plateforme) : catalogue complet.
 */
export async function getPrestatairesForService(params: {
  serviceId: string;
  clientEntrepriseId?: string;
}): Promise<Array<{ serviceEntrepriseId: string; entrepriseId: string; nom: string; hasActiveAdmin: boolean }>> {
  const { serviceId, clientEntrepriseId } = params;

  const baseConditions = and(
    eq(serviceEntreprises.serviceId, serviceId),
    eq(serviceEntreprises.actif, true),
  );

  const conditions = clientEntrepriseId
    ? and(
        baseConditions,
        inArray(
          serviceEntreprises.entrepriseId,
          db
            .selectDistinct({
              id: clientPrestataireRelations.prestataireEntrepriseId,
            })
            .from(clientPrestataireRelations)
            .where(
              eq(
                clientPrestataireRelations.clientEntrepriseId,
                clientEntrepriseId,
              ),
            ),
        ),
      )
    : baseConditions;

  const rows = await db
    .select({
      serviceEntrepriseId: serviceEntreprises.id,
      entrepriseId: entreprises.id,
      nom: entreprises.nom,
    })
    .from(serviceEntreprises)
    .innerJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .where(conditions)
    .orderBy(entreprises.nom);

  if (rows.length === 0) return [];

  const entrepriseIds = rows.map((r) => r.entrepriseId);
  const adminRows = await db
    .select({ entrepriseId: userPrestataireAdhesions.entrepriseId })
    .from(userPrestataireAdhesions)
    .where(
      and(
        inArray(userPrestataireAdhesions.entrepriseId, entrepriseIds),
        eq(userPrestataireAdhesions.role, "admin"),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    );
  const hasAdminSet = new Set(adminRows.map((r) => r.entrepriseId));

  return rows.map((r) => ({ ...r, hasActiveAdmin: hasAdminSet.has(r.entrepriseId) }));
}

/**
 * Recherche une entreprise par SIRET.
 */
export async function findEntrepriseBySiret(
  siret: string,
): Promise<{ id: string; nom: string; siret: string } | null> {
  const [row] = await db
    .select({ id: entreprises.id, nom: entreprises.nom, siret: entreprises.siret })
    .from(entreprises)
    .where(eq(entreprises.siret, siret))
    .limit(1);
  return row ?? null;
}

// ==================== TYPES ====================

export type ExecutionPrixItem = {
  id: string;
  typePrix: "abonnement" | "par_occurrence" | "installation" | "frais_livraison";
  montantHt: number;
  coutPrestataireHt: number | null;
  margePourcent: number | null;
  periodeFacturation: "semaine" | "mois" | "annee" | null;
  nbOccurrencesIncluses: number | null;
  actif: boolean;
};

export type ExecutionChecklistItem = {
  id: string;
  ordre: number;
  titre: string;
  dureeEstimeeMinutes: number | null;
};

export type ExecutionWithPrix = {
  id: string;
  clientServiceId: string;
  siteId: string;
  serviceEntrepriseId: string | null;
  prestataireEntrepriseId: string | null;
  prestataireNom: string | null;
  prestataireHasActiveAdmin: boolean;
  dateDebutValidite: Date;
  dateFinValidite: Date | null;
  priorite: number;
  modePilotage: ModePilotageType;
  actif: boolean;
  tacheListeTemplateId: string | null;
  tacheListeTemplateName: string | null;
  tacheListeItems: ExecutionChecklistItem[];
  createdAt: Date;
  prix: ExecutionPrixItem[];
};

export type OccurrenceListItem = {
  id: string;
  clientServiceId: string;
  siteId: string;
  siteNom: string | null;
  executionId: string | null;
  dateDebutPrevue: Date | null;
  dateFinPrevue: Date | null;
  dateDebutReelle: Date | null;
  dateFinReelle: Date | null;
  statut: OccurrenceStatutType;
  notes: string | null;
  createdAt: Date;
  assigneeUserId: string | null;
  assigneePrenom: string | null;
  assigneeNom: string | null;
};

// ==================== EXECUTIONS WITH PRIX ====================

/**
 * Récupère les exécutions d'une prestation avec leurs lignes de prix.
 */
export async function getExecutionsWithPrixByPrestationId(
  prestationId: string,
): Promise<ExecutionWithPrix[]> {
  // 1. Récupérer les exécutions (avec nom prestataire via LEFT JOINs)
  const executionRows = await db
    .select({
      id: clientServiceExecutions.id,
      clientServiceId: clientServiceExecutions.clientServiceId,
      siteId: clientServiceExecutions.siteId,
      serviceEntrepriseId: clientServiceExecutions.serviceEntrepriseId,
      prestataireEntrepriseId: entreprises.id,
      prestataireNom: entreprises.nom,
      dateDebutValidite: clientServiceExecutions.dateDebutValidite,
      dateFinValidite: clientServiceExecutions.dateFinValidite,
      priorite: clientServiceExecutions.priorite,
      actif: clientServiceExecutions.actif,
      modePilotage: clientServiceExecutions.modePilotage,
      tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId,
      tacheListeTemplateName: tacheListesTemplates.nom,
      createdAt: clientServiceExecutions.createdAt,
    })
    .from(clientServiceExecutions)
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .leftJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .leftJoin(
      tacheListesTemplates,
      eq(tacheListesTemplates.id, clientServiceExecutions.tacheListeTemplateId),
    )
    .where(eq(clientServiceExecutions.clientServiceId, prestationId))
    .orderBy(desc(clientServiceExecutions.priorite), asc(clientServiceExecutions.createdAt));

  if (executionRows.length === 0) return [];

  // 2. Vérifier si les prestataires ont un admin actif (ghost check)
  const prestataireEntrepriseIds = [
    ...new Set(
      executionRows
        .map((e) => e.prestataireEntrepriseId)
        .filter((id): id is string => id !== null),
    ),
  ];
  const prestataireAdminSet = new Set<string>();
  if (prestataireEntrepriseIds.length > 0) {
    const prestataireAdminRows = await db
      .select({ entrepriseId: userPrestataireAdhesions.entrepriseId })
      .from(userPrestataireAdhesions)
      .where(
        and(
          inArray(userPrestataireAdhesions.entrepriseId, prestataireEntrepriseIds),
          eq(userPrestataireAdhesions.role, "admin"),
          eq(userPrestataireAdhesions.statut, "actif"),
        ),
      );
    for (const r of prestataireAdminRows) {
      prestataireAdminSet.add(r.entrepriseId);
    }
  }

  // 4. Récupérer les items des checklists assignées
  const templateIds = [
    ...new Set(
      executionRows
        .map((e) => e.tacheListeTemplateId)
        .filter((id): id is string => id !== null),
    ),
  ];
  const itemsByTemplate = new Map<string, ExecutionChecklistItem[]>();
  if (templateIds.length > 0) {
    const itemRows = await db
      .select({
        id: tacheListeItems.id,
        templateId: tacheListeItems.listeTemplateId,
        ordre: tacheListeItems.ordre,
        titre: tacheListeItems.titre,
        dureeEstimeeMinutes: tacheListeItems.dureeEstimeeMinutes,
      })
      .from(tacheListeItems)
      .where(
        templateIds.length === 1
          ? eq(tacheListeItems.listeTemplateId, templateIds[0]!)
          : inArray(tacheListeItems.listeTemplateId, templateIds),
      )
      .orderBy(asc(tacheListeItems.ordre));
    for (const item of itemRows) {
      const list = itemsByTemplate.get(item.templateId) ?? [];
      list.push({
        id: item.id,
        ordre: item.ordre,
        titre: item.titre,
        dureeEstimeeMinutes: item.dureeEstimeeMinutes,
      });
      itemsByTemplate.set(item.templateId, list);
    }
  }

  // 5. Récupérer tous les prix pour ces exécutions
  const executionIds = executionRows.map((e) => e.id);
  const prixRows = await db
    .select()
    .from(clientServiceExecutionPrix)
    .where(
      and(
        eq(clientServiceExecutionPrix.actif, true),
        executionIds.length === 1
          ? eq(clientServiceExecutionPrix.executionId, executionIds[0]!)
          : or(
              ...executionIds.map((id) =>
                eq(clientServiceExecutionPrix.executionId, id),
              ),
            ),
      ),
    )
    .orderBy(asc(clientServiceExecutionPrix.typePrix));

  // 6. Grouper les prix par executionId
  const prixByExecution = new Map<string, ExecutionPrixItem[]>();
  for (const prix of prixRows) {
    const list = prixByExecution.get(prix.executionId) ?? [];
    list.push({
      id: prix.id,
      typePrix: prix.typePrix,
      montantHt: prix.montantHt,
      coutPrestataireHt: prix.coutPrestataireHt,
      margePourcent: prix.margePourcent,
      periodeFacturation: prix.periodeFacturation ?? null,
      nbOccurrencesIncluses: prix.nbOccurrencesIncluses,
      actif: prix.actif,
    });
    prixByExecution.set(prix.executionId, list);
  }

  // 5. Assembler
  return executionRows.map((e) => ({
    ...e,
    prestataireNom: e.prestataireNom ?? null,
    prestataireHasActiveAdmin: e.prestataireEntrepriseId
      ? prestataireAdminSet.has(e.prestataireEntrepriseId)
      : false,
    tacheListeTemplateName: e.tacheListeTemplateName ?? null,
    tacheListeItems: e.tacheListeTemplateId
      ? (itemsByTemplate.get(e.tacheListeTemplateId) ?? [])
      : [],
    prix: prixByExecution.get(e.id) ?? [],
  }));
}

// ==================== OCCURRENCES ====================

export type OccurrenceFilters = {
  limit?: number;
  offset?: number;
  statut?: "planifiee" | "en_cours" | "terminee" | "non_honoree" | "annulee";
  nonAssignedOnly?: boolean;
  siteId?: string;
  sortDir?: "asc" | "desc";
};

/**
 * Récupère les occurrences d'une prestation avec filtres, tri et pagination.
 */
export async function getOccurrencesByPrestationId(
  prestationId: string,
  options?: OccurrenceFilters,
): Promise<OccurrenceListItem[]> {
  const conditions = [
    eq(clientServiceOccurrences.clientServiceId, prestationId),
  ];
  if (options?.statut) {
    conditions.push(eq(clientServiceOccurrences.statut, options.statut));
  }
  if (options?.nonAssignedOnly) {
    conditions.push(isNull(clientServiceOccurrences.executionId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServiceOccurrences.siteId, options.siteId));
  }

  const assigneeUser = alias(user, "assignee_user_occ");

  const rows = await db
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      siteId: clientServiceOccurrences.siteId,
      siteNom: sites.nom,
      executionId: clientServiceOccurrences.executionId,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      dateDebutReelle: clientServiceOccurrences.dateDebutReelle,
      dateFinReelle: clientServiceOccurrences.dateFinReelle,
      statut: clientServiceOccurrences.statut,
      notes: clientServiceOccurrences.notes,
      createdAt: clientServiceOccurrences.createdAt,
      assigneeUserId: clientServiceOccurrences.assigneeUserId,
      assigneePrenom: assigneeUser.prenom,
      assigneeNom: assigneeUser.nom,
    })
    .from(clientServiceOccurrences)
    .leftJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .leftJoin(
      assigneeUser,
      eq(assigneeUser.id, clientServiceOccurrences.assigneeUserId),
    )
    .where(and(...conditions))
    .orderBy(
      options?.sortDir === "desc"
        ? desc(clientServiceOccurrences.dateDebutPrevue)
        : asc(clientServiceOccurrences.dateDebutPrevue),
      asc(clientServiceOccurrences.id),
    )
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);

  return rows as OccurrenceListItem[];
}

/**
 * Compte le nombre d'occurrences pour une prestation (sans filtres).
 */
export async function countOccurrencesByPrestationId(
  prestationId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: db.$count(clientServiceOccurrences) })
    .from(clientServiceOccurrences)
    .where(eq(clientServiceOccurrences.clientServiceId, prestationId));

  return Number(row?.count ?? 0);
}

/**
 * Compte les occurrences avec les mêmes filtres que getOccurrencesByPrestationId.
 */
export async function countFilteredOccurrencesByPrestationId(
  prestationId: string,
  options?: Pick<OccurrenceFilters, "statut" | "nonAssignedOnly" | "siteId">,
): Promise<number> {
  const conditions = [
    eq(clientServiceOccurrences.clientServiceId, prestationId),
  ];
  if (options?.statut) {
    conditions.push(eq(clientServiceOccurrences.statut, options.statut));
  }
  if (options?.nonAssignedOnly) {
    conditions.push(isNull(clientServiceOccurrences.executionId));
  }
  if (options?.siteId) {
    conditions.push(eq(clientServiceOccurrences.siteId, options.siteId));
  }

  const [row] = await db
    .select({ count: count() })
    .from(clientServiceOccurrences)
    .where(and(...conditions));

  return Number(row?.count ?? 0);
}

/**
 * Compte les occurrences sans prestataire assigné (executionId IS NULL).
 */
export async function countNonAssignedOccurrencesByPrestationId(
  prestationId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, prestationId),
        isNull(clientServiceOccurrences.executionId),
      ),
    );

  return Number(row?.count ?? 0);
}

/**
 * Récupère les sites distincts ayant des occurrences pour une prestation.
 */
export async function getDistinctSitesForPrestation(
  prestationId: string,
): Promise<Array<{ id: string; nom: string }>> {
  const rows = await db
    .selectDistinct({
      id: clientServiceOccurrences.siteId,
      nom: sites.nom,
    })
    .from(clientServiceOccurrences)
    .innerJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .where(eq(clientServiceOccurrences.clientServiceId, prestationId))
    .orderBy(sites.nom);

  return rows.map((r) => ({ id: r.id, nom: r.nom ?? r.id }));
}

// ==================== OCCURRENCE DETAIL ====================

export type OccurrenceDetail = {
  id: string;
  clientServiceId: string;
  siteId: string;
  siteNom: string | null;
  executionId: string | null;
  modePilotage: ModePilotageType | null;
  prestataireNom: string | null;
  prestataireEntrepriseId: string | null;
  dateDebutPrevue: Date | null;
  dateFinPrevue: Date | null;
  dateDebutReelle: Date | null;
  dateFinReelle: Date | null;
  statut: OccurrenceStatutType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  assigneeUserId: string | null;
  assigneePrenom: string | null;
  assigneeNom: string | null;
};

export type TachePieceJointe = {
  linkId: string;
  documentId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export type OccurrenceTacheDetail = {
  id: string;
  occurrenceId: string;
  listeItemId: string | null;
  ordre: number;
  titre: string;
  description: string | null;
  statut: OccurrenceTacheStatutType;
  notes: string | null;
  startedAt: Date | null;
  doneAt: Date | null;
  tempsPasseSecondes: number | null;
  assigneeUserId: string | null;
  assigneePrenom: string | null;
  assigneeNom: string | null;
  piecesJointes: TachePieceJointe[];
};

/**
 * Récupère le détail d'une occurrence (avec site + prestataire) pour la page de détail.
 */
export async function getOccurrenceWithDetailsById(
  occurrenceId: string,
): Promise<OccurrenceDetail | null> {
  const assigneeUser = alias(user, "assignee_user_occ_detail");

  const [row] = await db
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      siteId: clientServiceOccurrences.siteId,
      siteNom: sites.nom,
      executionId: clientServiceOccurrences.executionId,
      modePilotage: clientServiceExecutions.modePilotage,
      prestataireNom: entreprises.nom,
      prestataireEntrepriseId: serviceEntreprises.entrepriseId,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
      dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
      dateDebutReelle: clientServiceOccurrences.dateDebutReelle,
      dateFinReelle: clientServiceOccurrences.dateFinReelle,
      statut: clientServiceOccurrences.statut,
      notes: clientServiceOccurrences.notes,
      createdAt: clientServiceOccurrences.createdAt,
      updatedAt: clientServiceOccurrences.updatedAt,
      assigneeUserId: clientServiceOccurrences.assigneeUserId,
      assigneePrenom: assigneeUser.prenom,
      assigneeNom: assigneeUser.nom,
    })
    .from(clientServiceOccurrences)
    .leftJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
    .leftJoin(
      clientServiceExecutions,
      eq(clientServiceExecutions.id, clientServiceOccurrences.executionId),
    )
    .leftJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .leftJoin(entreprises, eq(entreprises.id, serviceEntreprises.entrepriseId))
    .leftJoin(
      assigneeUser,
      eq(assigneeUser.id, clientServiceOccurrences.assigneeUserId),
    )
    .where(eq(clientServiceOccurrences.id, occurrenceId))
    .limit(1);

  return (row as OccurrenceDetail | undefined) ?? null;
}

/**
 * Récupère les tâches d'une occurrence (ordonnées) avec leurs pièces jointes et l'assigné.
 */
export async function getOccurrenceTaches(
  occurrenceId: string,
): Promise<OccurrenceTacheDetail[]> {
  const assigneeUser = alias(user, "assignee_user");

  const rows = await db
    .select({
      id: occurrenceTaches.id,
      occurrenceId: occurrenceTaches.occurrenceId,
      listeItemId: occurrenceTaches.listeItemId,
      ordre: occurrenceTaches.ordre,
      titre: occurrenceTaches.titre,
      description: occurrenceTaches.description,
      statut: occurrenceTaches.statut,
      notes: occurrenceTaches.notes,
      startedAt: occurrenceTaches.startedAt,
      doneAt: occurrenceTaches.doneAt,
      tempsPasseSecondes: occurrenceTaches.tempsPasseSecondes,
      assigneeUserId: occurrenceTaches.assigneeUserId,
      assigneePrenom: assigneeUser.prenom,
      assigneeNom: assigneeUser.nom,
    })
    .from(occurrenceTaches)
    .leftJoin(assigneeUser, eq(assigneeUser.id, occurrenceTaches.assigneeUserId))
    .where(eq(occurrenceTaches.occurrenceId, occurrenceId))
    .orderBy(asc(occurrenceTaches.ordre));

  if (rows.length === 0) return [];

  // Charger les PJs de toutes les tâches en une seule requête
  const tacheIds = rows.map((r) => r.id);
  const pjRows = await db
    .select({
      tacheId: documentsLinks.occurrenceTacheId,
      linkId: documentsLinks.id,
      documentId: documents.id,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
    })
    .from(documentsLinks)
    .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
    .where(inArray(documentsLinks.occurrenceTacheId, tacheIds));

  // Grouper par tacheId
  const pjByTacheId = new Map<string, TachePieceJointe[]>();
  for (const pj of pjRows) {
    if (!pj.tacheId) continue;
    if (!pjByTacheId.has(pj.tacheId)) pjByTacheId.set(pj.tacheId, []);
    pjByTacheId.get(pj.tacheId)!.push({
      linkId: pj.linkId,
      documentId: pj.documentId,
      storageKey: pj.storageKey,
      filename: pj.filename,
      mimeType: pj.mimeType,
      sizeBytes: pj.sizeBytes,
    });
  }

  return rows.map((row) => ({
    ...row,
    assigneeUserId: row.assigneeUserId ?? null,
    assigneePrenom: row.assigneePrenom ?? null,
    assigneeNom: row.assigneeNom ?? null,
    piecesJointes: pjByTacheId.get(row.id) ?? [],
  }));
}

// ==================== MES SITES CLIENTS (Posture Prestataire) ====================

export type SiteClientCouvert = {
  siteId: string;
  siteNom: string | null;
  clientEntrepriseId: string;
  clientEntrepriseNom: string | null;
  serviceNoms: string[];
};

export type PrestataireUserOnSite = {
  attributionId: string;
  userId: string;
  userPrenom: string;
  userNom: string;
  userEmail: string;
  role: string;
};

export type SiteClientAvecAgents = SiteClientCouvert & {
  agentsAttribues: PrestataireUserOnSite[];
};

/**
 * Retourne les sites clients couverts par le prestataire via des exécutions actives,
 * avec la liste des agents prestataires déjà attribués à chaque site.
 */
export async function getSitesCouvertsParPrestataire(
  prestataireEntrepriseId: string,
): Promise<SiteClientAvecAgents[]> {
  // 1. Sites couverts (exécutions actives sur prestations actives)
  const rows = await db
    .select({
      siteId: sites.id,
      siteNom: sites.nom,
      clientEntrepriseId: clientServices.entrepriseId,
      clientEntrepriseNom: entreprises.nom,
      serviceNom: services.nom,
    })
    .from(clientServiceExecutions)
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId),
    )
    .innerJoin(sites, eq(sites.id, clientServiceExecutions.siteId))
    .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
    .innerJoin(services, eq(services.id, clientServices.serviceId))
    .where(
      and(
        eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId),
        eq(clientServiceExecutions.actif, true),
        eq(clientServices.statut, "actif"),
      ),
    )
    .orderBy(entreprises.nom, sites.nom, services.nom);

  if (rows.length === 0) return [];

  // Grouper par siteId
  const siteMap = new Map<string, SiteClientCouvert>();
  for (const row of rows) {
    const existing = siteMap.get(row.siteId);
    if (existing) {
      if (row.serviceNom && !existing.serviceNoms.includes(row.serviceNom)) {
        existing.serviceNoms.push(row.serviceNom);
      }
    } else {
      siteMap.set(row.siteId, {
        siteId: row.siteId,
        siteNom: row.siteNom,
        clientEntrepriseId: row.clientEntrepriseId,
        clientEntrepriseNom: row.clientEntrepriseNom,
        serviceNoms: row.serviceNom ? [row.serviceNom] : [],
      });
    }
  }

  const siteIds = Array.from(siteMap.keys());

  // 2. Agents prestataires attribués à ces sites
  const attributions = await db
    .select({
      attributionId: userClientSiteAttributions.id,
      siteId: userClientSiteAttributions.siteId,
      userId: user.id,
      userPrenom: user.prenom,
      userNom: user.nom,
      userEmail: user.email,
      role: userClientSiteAttributions.role,
    })
    .from(userClientSiteAttributions)
    .innerJoin(user, eq(user.id, userClientSiteAttributions.userId))
    .where(
      and(
        eq(userClientSiteAttributions.entrepriseId, prestataireEntrepriseId),
        eq(userClientSiteAttributions.mode, "inclure"),
        inArray(userClientSiteAttributions.siteId, siteIds),
      ),
    );

  // Grouper les attributions par siteId
  const agentsBySiteId = new Map<string, PrestataireUserOnSite[]>();
  for (const a of attributions) {
    if (!agentsBySiteId.has(a.siteId)) agentsBySiteId.set(a.siteId, []);
    agentsBySiteId.get(a.siteId)!.push({
      attributionId: a.attributionId,
      userId: a.userId,
      userPrenom: a.userPrenom,
      userNom: a.userNom,
      userEmail: a.userEmail,
      role: a.role,
    });
  }

  return Array.from(siteMap.values()).map((site) => ({
    ...site,
    agentsAttribues: agentsBySiteId.get(site.siteId) ?? [],
  }));
}

// ==================== MES CLIENTS (Posture Prestataire) ====================

export type ClientAvecDetails = {
  id: string;
  nom: string;
  siret: string;
  numeroTva: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  formeJuridique: string | null;
  sireneSyncedAt: Date | null;
  createdAt: Date;
  logoStorageKey: string | null;
  roles: string[];
  hasActiveAdmin: boolean;
  adminEmail: string | null;
  nbSites: number;
  services: Array<{ id: string; nom: string }>;
  relationId: string | null;
};

/**
 * Récupère les clients du prestataire via UNION de :
 * - Relations explicites (client_prestataire_relations)
 * - Exécutions actives (clientServiceExecutions)
 * Enrichi avec siret, contact, rôles et hasActiveAdmin.
 */
export async function getMesClients(
  prestataireEntrepriseId: string,
): Promise<ClientAvecDetails[]> {
  // 1. IDs depuis les relations explicites
  const fromRelations = await db
    .select({ id: clientPrestataireRelations.clientEntrepriseId })
    .from(clientPrestataireRelations)
    .where(
      eq(
        clientPrestataireRelations.prestataireEntrepriseId,
        prestataireEntrepriseId,
      ),
    );

  // 2. IDs depuis les exécutions actives
  const fromExecutions = await db
    .selectDistinct({ id: clientServices.entrepriseId })
    .from(clientServiceExecutions)
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceExecutions.clientServiceId),
    )
    .innerJoin(
      serviceEntreprises,
      eq(serviceEntreprises.id, clientServiceExecutions.serviceEntrepriseId),
    )
    .where(
      and(
        eq(serviceEntreprises.entrepriseId, prestataireEntrepriseId),
        eq(clientServices.statut, "actif"),
        eq(clientServiceExecutions.actif, true),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, new Date()),
        ),
      ),
    );

  // 3. Déduplication
  const allIds = [
    ...new Set([
      ...fromRelations.map((r) => r.id),
      ...fromExecutions.map((r) => r.id),
    ]),
  ];
  if (allIds.length === 0) return [];

  // 4. Fetch détails entreprises (+ logo via LEFT JOIN documents)
  const rows = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
      siret: entreprises.siret,
      numeroTva: entreprises.numeroTva,
      adresseLigne1: entreprises.adresseLigne1,
      adresseLigne2: entreprises.adresseLigne2,
      codePostal: entreprises.codePostal,
      ville: entreprises.ville,
      formeJuridique: entreprises.formeJuridique,
      sireneSyncedAt: entreprises.sireneSyncedAt,
      createdAt: entreprises.createdAt,
      logoStorageKey: documents.storageKey,
    })
    .from(entreprises)
    .leftJoin(documents, eq(documents.id, entreprises.logoId))
    .where(inArray(entreprises.id, allIds))
    .orderBy(entreprises.nom);

  // 5. Fetch rôles
  const rolesRows = await db
    .select({
      entrepriseId: entrepriseRoles.entrepriseId,
      role: entrepriseRoles.role,
    })
    .from(entrepriseRoles)
    .where(inArray(entrepriseRoles.entrepriseId, allIds));

  const rolesByEntrepriseId = new Map<string, string[]>();
  for (const r of rolesRows) {
    if (!rolesByEntrepriseId.has(r.entrepriseId)) {
      rolesByEntrepriseId.set(r.entrepriseId, []);
    }
    rolesByEntrepriseId.get(r.entrepriseId)!.push(r.role);
  }

  // 6. Check hasActiveAdmin + fetch email du premier admin actif
  const adminRows = await db
    .select({
      entrepriseId: userClientAdhesions.entrepriseId,
      email: user.email,
    })
    .from(userClientAdhesions)
    .innerJoin(user, eq(user.id, userClientAdhesions.userId))
    .where(
      and(
        inArray(userClientAdhesions.entrepriseId, allIds),
        eq(userClientAdhesions.role, "admin"),
        eq(userClientAdhesions.statut, "actif"),
      ),
    );
  const hasAdminSet = new Set(adminRows.map((r) => r.entrepriseId));
  // Premier admin actif par entreprise (ordre non garanti, on prend le premier)
  const adminEmailByEntrepriseId = new Map<string, string>();
  for (const r of adminRows) {
    if (!adminEmailByEntrepriseId.has(r.entrepriseId)) {
      adminEmailByEntrepriseId.set(r.entrepriseId, r.email);
    }
  }

  // 7. Fetch services offerts par chaque client (si double casquette prestataire)
  const serviceRows = await db
    .select({
      entrepriseId: serviceEntreprises.entrepriseId,
      serviceId: services.id,
      serviceNom: services.nom,
    })
    .from(serviceEntreprises)
    .innerJoin(services, eq(services.id, serviceEntreprises.serviceId))
    .where(
      and(
        inArray(serviceEntreprises.entrepriseId, allIds),
        eq(serviceEntreprises.actif, true),
      ),
    );

  const servicesByEntrepriseId = new Map<
    string,
    Array<{ id: string; nom: string }>
  >();
  for (const r of serviceRows) {
    if (!servicesByEntrepriseId.has(r.entrepriseId)) {
      servicesByEntrepriseId.set(r.entrepriseId, []);
    }
    servicesByEntrepriseId.get(r.entrepriseId)!.push({
      id: r.serviceId,
      nom: r.serviceNom,
    });
  }

  // 8. Comptage des sites par client
  const sitesCountRows = await db
    .select({
      entrepriseId: sites.entrepriseId,
      nbSites: count(sites.id),
    })
    .from(sites)
    .where(inArray(sites.entrepriseId, allIds))
    .groupBy(sites.entrepriseId);

  const nbSitesByEntrepriseId = new Map<string, number>();
  for (const r of sitesCountRows) {
    nbSitesByEntrepriseId.set(r.entrepriseId, r.nbSites);
  }

  // 9. Fetch relation IDs
  const relationRows = await db
    .select({
      clientEntrepriseId: clientPrestataireRelations.clientEntrepriseId,
      relationId: clientPrestataireRelations.id,
    })
    .from(clientPrestataireRelations)
    .where(
      and(
        eq(clientPrestataireRelations.prestataireEntrepriseId, prestataireEntrepriseId),
        inArray(clientPrestataireRelations.clientEntrepriseId, allIds),
      ),
    );

  const relationByClientId = new Map<string, string>();
  for (const r of relationRows) {
    relationByClientId.set(r.clientEntrepriseId, r.relationId);
  }

  return rows.map((c) => ({
    ...c,
    logoStorageKey: c.logoStorageKey ?? null,
    roles: rolesByEntrepriseId.get(c.id) ?? [],
    hasActiveAdmin: hasAdminSet.has(c.id),
    adminEmail: adminEmailByEntrepriseId.get(c.id) ?? null,
    nbSites: nbSitesByEntrepriseId.get(c.id) ?? 0,
    services: servicesByEntrepriseId.get(c.id) ?? [],
    relationId: relationByClientId.get(c.id) ?? null,
  }));
}

/**
 * Récupère les détails d'un client spécifique pour un prestataire donné.
 * Utilise getMesClients et filtre par clientEntrepriseId.
 */
export async function getClientAvecDetailsById(
  prestataireEntrepriseId: string,
  clientEntrepriseId: string,
): Promise<ClientAvecDetails | null> {
  const all = await getMesClients(prestataireEntrepriseId);
  return all.find((c) => c.id === clientEntrepriseId) ?? null;
}

/**
 * Récupère les détails d'un prestataire spécifique pour un client donné.
 * Utilise getClientPrestatairesAvecDetails et filtre par prestataireEntrepriseId.
 */
export async function getPrestataireAvecDetailsById(
  clientEntrepriseId: string,
  prestataireEntrepriseId: string,
): Promise<PrestataireAvecDetails | null> {
  const all = await getClientPrestatairesAvecDetails(clientEntrepriseId);
  return all.find((p) => p.id === prestataireEntrepriseId) ?? null;
}
