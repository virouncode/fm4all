import "server-only";

import { db } from "@/db";
import { documents, documentsLinks } from "@/db/schema/documents";
import { devis, devisDemandes } from "@/db/schema/devis";
import { entreprises } from "@/db/schema/entreprises";
import { services } from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import { user } from "@/db/schema/auth";
import type {
  DevisDemandeQueryType,
  SelectDevisDemandeType,
} from "@/zod-schemas/devis.schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  SQL,
} from "drizzle-orm";

// ============================= TYPES ENRICHIS ==============================//

export type DevisDemandeAvecDetails = SelectDevisDemandeType & {
  siteNom: string;
  serviceNom: string;
  createdByPrenom: string | null;
  createdByNom: string | null;
  devisCount: number;
  proprietaireEntrepriseNom: string | null;
};

// ============================= QUERIES ==============================//

/**
 * Récupère une demande de devis par ID avec ses infos enrichies.
 */
export async function getDevisDemandeById(
  devisDemandeId: string,
): Promise<DevisDemandeAvecDetails | null> {
  const rows = await db
    .select({
      demande: devisDemandes,
      siteNom: sites.nom,
      serviceNom: services.nom,
      createdByPrenom: user.prenom,
      createdByNom: user.nom,
      proprietaireEntrepriseNom: entreprises.nom,
    })
    .from(devisDemandes)
    .leftJoin(sites, eq(sites.id, devisDemandes.siteId))
    .leftJoin(services, eq(services.id, devisDemandes.serviceId))
    .leftJoin(user, eq(user.id, devisDemandes.createdById))
    .leftJoin(entreprises, eq(entreprises.id, devisDemandes.demandeurEntrepriseId))
    .where(eq(devisDemandes.id, devisDemandeId))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];

  // Compter les devis liés
  const [{ value: devisCount }] = await db
    .select({ value: count() })
    .from(devis)
    .where(eq(devis.devisDemandeId, devisDemandeId));

  return {
    ...row.demande,
    siteNom: row.siteNom ?? "",
    serviceNom: row.serviceNom ?? "",
    createdByPrenom: row.createdByPrenom ?? null,
    createdByNom: row.createdByNom ?? null,
    devisCount: Number(devisCount),
    proprietaireEntrepriseNom: row.proprietaireEntrepriseNom ?? null,
  };
}

/**
 * Liste paginée des demandes de devis avec filtres.
 *
 * scopeCondition : filtre additionnel pour restreindre aux sites accessibles
 *   (null = pas de restriction = admin / plateforme)
 */
export async function getDevisDemandesPaginated(
  query: DevisDemandeQueryType,
  scopeSiteIds?: string[],
): Promise<{ items: DevisDemandeAvecDetails[]; total: number }> {
  const { entrepriseId, statut, siteId, serviceId, search, orderBy, orderDir, page, pageSize } =
    query;

  // Construire les conditions WHERE
  const conditions: SQL[] = [
    eq(devisDemandes.demandeurEntrepriseId, entrepriseId),
  ];

  if (scopeSiteIds !== undefined) {
    if (scopeSiteIds.length === 0) {
      // Aucun site accessible → retourner vide immédiatement
      return { items: [], total: 0 };
    }
    conditions.push(inArray(devisDemandes.siteId, scopeSiteIds));
  }

  if (statut) {
    conditions.push(eq(devisDemandes.statut, statut));
  }

  if (siteId) {
    conditions.push(eq(devisDemandes.siteId, siteId));
  }

  if (serviceId) {
    conditions.push(eq(devisDemandes.serviceId, serviceId));
  }

  if (search) {
    conditions.push(
      or(
        ilike(devisDemandes.titre, `%${search}%`),
        ilike(devisDemandes.description, `%${search}%`),
      ) as SQL,
    );
  }

  const whereClause = and(...conditions);

  // Colonnes de tri
  const orderColumn = (() => {
    switch (orderBy) {
      case "titre":
        return devisDemandes.titre;
      case "statut":
        return devisDemandes.statut;
      case "updatedAt":
        return devisDemandes.updatedAt;
      case "siteNom":
        return sites.nom;
      case "serviceNom":
        return services.nom;
      case "createdAt":
      default:
        return devisDemandes.createdAt;
    }
  })();

  const orderFn = orderDir === "asc" ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select({
        demande: devisDemandes,
        siteNom: sites.nom,
        serviceNom: services.nom,
        createdByPrenom: user.prenom,
        createdByNom: user.nom,
        proprietaireEntrepriseNom: entreprises.nom,
      })
      .from(devisDemandes)
      .leftJoin(sites, eq(sites.id, devisDemandes.siteId))
      .leftJoin(services, eq(services.id, devisDemandes.serviceId))
      .leftJoin(user, eq(user.id, devisDemandes.createdById))
      .leftJoin(entreprises, eq(entreprises.id, devisDemandes.demandeurEntrepriseId))
      .where(whereClause)
      .orderBy(orderFn(orderColumn))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(devisDemandes)
      .where(whereClause),
  ]);

  // Pour chaque demande, compter les devis liés en batch
  const demandeIds = rows.map((r) => r.demande.id);
  const devisCounts =
    demandeIds.length > 0
      ? await db
          .select({ devisDemandeId: devis.devisDemandeId, value: count() })
          .from(devis)
          .where(
            and(
              inArray(devis.devisDemandeId, demandeIds),
              isNotNull(devis.devisDemandeId),
            ),
          )
          .groupBy(devis.devisDemandeId)
      : [];

  const devisCountMap = new Map(
    devisCounts.map((r) => [r.devisDemandeId, Number(r.value)]),
  );

  const items: DevisDemandeAvecDetails[] = rows.map((row) => ({
    ...row.demande,
    siteNom: row.siteNom ?? "",
    serviceNom: row.serviceNom ?? "",
    createdByPrenom: row.createdByPrenom ?? null,
    createdByNom: row.createdByNom ?? null,
    devisCount: devisCountMap.get(row.demande.id) ?? 0,
    proprietaireEntrepriseNom: row.proprietaireEntrepriseNom ?? null,
  }));

  return { items, total: Number(total) };
}

/**
 * Liste paginée des demandes de devis pour un prestataire.
 *
 * Règles (regles_metier.md §B) :
 * - Filtre par clients du prestataire (clientPrestataireRelations)
 * - Filtre par services proposés par le prestataire (serviceIds)
 * - admin prestataire → pas de restriction de sites
 * - non-admin → scopeSiteIds restreint aux sites attribués
 */
export async function getDevisDemandesPaginatedForPrestataire(params: {
  allClientIds: string[];
  allServiceIds: string[];
  scopeSiteIds?: string[];
  clientId?: string;
  serviceId?: string;
  siteId?: string;
  statut?: DevisDemandeQueryType["statut"];
  search?: string;
  orderBy: DevisDemandeQueryType["orderBy"];
  orderDir: "asc" | "desc";
  page: number;
  pageSize: number;
}): Promise<{ items: DevisDemandeAvecDetails[]; total: number }> {
  const {
    allClientIds,
    allServiceIds,
    scopeSiteIds,
    clientId,
    serviceId,
    siteId,
    statut,
    search,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params;

  // Aucun client ou service → rien à afficher
  if (allClientIds.length === 0 || allServiceIds.length === 0) {
    return { items: [], total: 0 };
  }

  // Scope sites : si vide tableau → aucun accès
  if (scopeSiteIds !== undefined && scopeSiteIds.length === 0) {
    return { items: [], total: 0 };
  }

  const conditions: SQL[] = [
    inArray(devisDemandes.demandeurEntrepriseId, allClientIds),
    inArray(devisDemandes.serviceId, allServiceIds),
  ];

  if (scopeSiteIds !== undefined) {
    conditions.push(inArray(devisDemandes.siteId, scopeSiteIds));
  }

  if (clientId) {
    conditions.push(eq(devisDemandes.demandeurEntrepriseId, clientId));
  }

  if (serviceId) {
    conditions.push(eq(devisDemandes.serviceId, serviceId));
  }

  if (siteId) {
    conditions.push(eq(devisDemandes.siteId, siteId));
  }

  if (statut) {
    conditions.push(eq(devisDemandes.statut, statut));
  }

  if (search) {
    conditions.push(
      or(
        ilike(devisDemandes.titre, `%${search}%`),
        ilike(devisDemandes.description, `%${search}%`),
      ) as SQL,
    );
  }

  const whereClause = and(...conditions);

  const orderColumn = (() => {
    switch (orderBy) {
      case "titre":
        return devisDemandes.titre;
      case "statut":
        return devisDemandes.statut;
      case "updatedAt":
        return devisDemandes.updatedAt;
      case "siteNom":
        return sites.nom;
      case "serviceNom":
        return services.nom;
      case "proprietaireEntrepriseNom":
        return entreprises.nom;
      case "createdAt":
      default:
        return devisDemandes.createdAt;
    }
  })();

  const orderFn = orderDir === "asc" ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select({
        demande: devisDemandes,
        siteNom: sites.nom,
        serviceNom: services.nom,
        createdByPrenom: user.prenom,
        createdByNom: user.nom,
        proprietaireEntrepriseNom: entreprises.nom,
      })
      .from(devisDemandes)
      .leftJoin(sites, eq(sites.id, devisDemandes.siteId))
      .leftJoin(services, eq(services.id, devisDemandes.serviceId))
      .leftJoin(user, eq(user.id, devisDemandes.createdById))
      .leftJoin(entreprises, eq(entreprises.id, devisDemandes.demandeurEntrepriseId))
      .where(whereClause)
      .orderBy(orderFn(orderColumn))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(devisDemandes)
      .where(whereClause),
  ]);

  const demandeIds = rows.map((r) => r.demande.id);
  const devisCounts =
    demandeIds.length > 0
      ? await db
          .select({ devisDemandeId: devis.devisDemandeId, value: count() })
          .from(devis)
          .where(
            and(
              inArray(devis.devisDemandeId, demandeIds),
              isNotNull(devis.devisDemandeId),
            ),
          )
          .groupBy(devis.devisDemandeId)
      : [];

  const devisCountMap = new Map(
    devisCounts.map((r) => [r.devisDemandeId, Number(r.value)]),
  );

  const items: DevisDemandeAvecDetails[] = rows.map((row) => ({
    ...row.demande,
    siteNom: row.siteNom ?? "",
    serviceNom: row.serviceNom ?? "",
    createdByPrenom: row.createdByPrenom ?? null,
    createdByNom: row.createdByNom ?? null,
    devisCount: devisCountMap.get(row.demande.id) ?? 0,
    proprietaireEntrepriseNom: row.proprietaireEntrepriseNom ?? null,
  }));

  return { items, total: Number(total) };
}

// ============================= ATTACHMENTS ==============================//

export type DevisDemandeAttachmentItemType = {
  documentId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

export async function getDevisDemandeAttachments(
  devisDemandeId: string,
): Promise<DevisDemandeAttachmentItemType[]> {
  const rows = await db
    .select({
      documentId: documents.id,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      createdAt: documents.createdAt,
    })
    .from(documentsLinks)
    .innerJoin(documents, eq(documents.id, documentsLinks.documentId))
    .where(eq(documentsLinks.devisDemandeId, devisDemandeId))
    .orderBy(asc(documents.createdAt));

  return rows;
}
