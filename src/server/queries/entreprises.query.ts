import "server-only";

import { db } from "@/db";
import {
  clientPrestataireRelationContacts,
  contactsInvitations,
  entrepriseContacts,
  entreprises,
  entrepriseRoles,
  serviceEntreprises,
  entrepriseInvitations,
} from "@/db/schema/entreprises";
import { documents } from "@/db/schema/documents";
import { services } from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import { eq, and, ilike, or, sql, count, asc, desc } from "drizzle-orm";
import type {
  EntrepriseContactSelectType,
  EntrepriseWithDetails,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";

export type EntrepriseContactWithInvitationType = EntrepriseContactSelectType & {
  pendingInvitationSentAt: Date | null;
};

/**
 * Récupère toutes les entreprises ayant le rôle "client"
 * Utilisé par la plateforme pour sélectionner le client lors de la création d'un ticket
 *
 * @returns Liste des entreprises clientes avec id et nom
 */
export async function getEntreprisesClientes(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .innerJoin(
      entrepriseRoles,
      eq(entreprises.id, entrepriseRoles.entrepriseId),
    )
    .where(eq(entrepriseRoles.role, "client"))
    .orderBy(entreprises.nom);

  return results;
}

/**
 * Récupère une entreprise par ID
 *
 * @param entrepriseId - ID de l'entreprise
 * @returns L'entreprise ou null si non trouvée
 */
export async function getEntrepriseById(entrepriseId: string) {
  const entreprise = await db.query.entreprises.findFirst({
    where: eq(entreprises.id, entrepriseId),
  });

  return entreprise || null;
}

/**
 * Récupère toutes les entreprises
 * Retourne id et nom uniquement pour optimisation
 *
 * @returns Liste de toutes les entreprises avec id et nom
 */
export async function getAllEntreprises(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .orderBy(entreprises.nom);

  return results;
}

/**
 * Vérifie si une entreprise possède un rôle spécifique
 *
 * @param entrepriseId - ID de l'entreprise
 * @param role - Rôle à vérifier (client, prestataire, plateforme)
 * @returns true si l'entreprise possède le rôle
 */
export async function hasEntrepriseRole(
  entrepriseId: string,
  role: RoleEntrepriseType,
): Promise<boolean> {
  const result = await db.query.entrepriseRoles.findFirst({
    where: and(
      eq(entrepriseRoles.entrepriseId, entrepriseId),
      eq(entrepriseRoles.role, role),
    ),
  });

  return !!result;
}

/**
 * Récupère toutes les entreprises ayant le rôle "prestataire"
 * Utilisé pour le filtre prestataire dans les tickets
 *
 * @returns Liste des entreprises prestataires avec id et nom
 */
export async function getEntreprisesPrestataires(): Promise<
  Array<{ id: string; nom: string }>
> {
  const results = await db
    .select({
      id: entreprises.id,
      nom: entreprises.nom,
    })
    .from(entreprises)
    .innerJoin(
      entrepriseRoles,
      eq(entreprises.id, entrepriseRoles.entrepriseId),
    )
    .where(eq(entrepriseRoles.role, "prestataire"))
    .orderBy(entreprises.nom);

  return results;
}

// ==================== PAGINATED LIST ====================

type GetEntreprisesPaginatedParamsType = {
  search?: string;
  role?: RoleEntrepriseType;
  orderBy?: "nom" | "createdAt" | "updatedAt" | "formeJuridique" | "nbSites";
  orderDir?: "asc" | "desc";
  page: number;
  pageSize: number;
};

/**
 * Récupère les entreprises paginées avec rôles agrégés et nb de sites
 * Réservé à la posture plateforme
 */
export async function getEntreprisesPaginated({
  search,
  role,
  orderBy = "nom",
  orderDir = "asc",
  page,
  pageSize,
}: GetEntreprisesPaginatedParamsType): Promise<EntrepriseWithDetails[]> {
  const offset = (page - 1) * pageSize;

  // Sous-query pour filtrer par rôle si nécessaire
  const roleSubquery = role
    ? sql`EXISTS (
        SELECT 1 FROM ${entrepriseRoles} er
        WHERE er.entreprise_id = ${entreprises.id}
        AND er.role = ${role}
      )`
    : undefined;

  // Filtre recherche
  const searchFilter = search
    ? or(
        ilike(entreprises.nom, `%${search}%`),
        ilike(entreprises.siret, `%${search}%`),
      )
    : undefined;

  const whereConditions = [searchFilter, roleSubquery].filter(Boolean);

  const orderFn = orderDir === "asc" ? sql`ASC` : sql`DESC`;

  const orderByClause =
    orderBy === "nbSites"
      ? sql`COUNT(DISTINCT ${sites.id}) ${orderFn}`
      : sql`${
          orderBy === "updatedAt" ? entreprises.updatedAt
          : orderBy === "formeJuridique" ? entreprises.formeJuridique
          : orderBy === "createdAt" ? entreprises.createdAt
          : entreprises.nom
        } ${orderFn}`;

  const results = await db
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
      logoId: entreprises.logoId,
      logoStorageKey: sql<string | null>`MAX(${documents.storageKey})`,
      createdAt: entreprises.createdAt,
      updatedAt: entreprises.updatedAt,
      roles: sql<string[] | null>`array_agg(DISTINCT ${entrepriseRoles.role}::text) FILTER (WHERE ${entrepriseRoles.role} IS NOT NULL)`,
      nbSites: sql<number>`COUNT(DISTINCT ${sites.id})::integer`,
      hasActiveAdmin: sql<boolean>`EXISTS (
        SELECT 1 FROM user_client_adhesions uca
        WHERE uca.entreprise_id = ${entreprises.id}
        AND uca.role = 'admin'
        AND uca.statut = 'actif'
        UNION ALL
        SELECT 1 FROM user_prestataire_adhesions upa
        WHERE upa.entreprise_id = ${entreprises.id}
        AND upa.role = 'admin'
        AND upa.statut = 'actif'
      )`,
      services: sql<Array<{ id: string; nom: string }> | null>`(
        SELECT json_agg(json_build_object('id', s.id::text, 'nom', s.nom))
        FROM service_entreprises se
        INNER JOIN services s ON s.id = se.service_id
        WHERE se.entreprise_id = ${entreprises.id}
      )`,
      pendingInvitation: sql<{ email: string; sentAt: Date } | null>`(
        SELECT json_build_object('email', ei.email, 'sentAt', ei.created_at)
        FROM ${entrepriseInvitations} ei
        WHERE ei.entreprise_id = ${entreprises.id}
          AND ei.accepted_at IS NULL
          AND ei.expires_at > NOW()
        ORDER BY ei.created_at DESC
        LIMIT 1
      )`,
    })
    .from(entreprises)
    .leftJoin(entrepriseRoles, eq(entreprises.id, entrepriseRoles.entrepriseId))
    .leftJoin(sites, eq(entreprises.id, sites.entrepriseId))
    .leftJoin(documents, eq(entreprises.logoId, documents.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .groupBy(entreprises.id)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  return results.map((r) => ({
    ...r,
    roles: (r.roles ?? []) as RoleEntrepriseType[],
    nbSites: Number(r.nbSites) || 0,
    logoStorageKey: r.logoStorageKey ?? null,
    hasActiveAdmin: Boolean(r.hasActiveAdmin),
    adminEmail: null,
    services: (r.services ?? []) as Array<{ id: string; nom: string }>,
    pendingInvitation: r.pendingInvitation ?? null,
    relationId: null,
  }));
}

/**
 * Compte le total d'entreprises pour la pagination
 */
export async function countEntreprises({
  search,
  role,
}: {
  search?: string;
  role?: RoleEntrepriseType;
}): Promise<number> {
  const roleSubquery = role
    ? sql`EXISTS (
        SELECT 1 FROM ${entrepriseRoles} er
        WHERE er.entreprise_id = ${entreprises.id}
        AND er.role = ${role}
      )`
    : undefined;

  const searchFilter = search
    ? or(
        ilike(entreprises.nom, `%${search}%`),
        ilike(entreprises.siret, `%${search}%`),
      )
    : undefined;

  const whereConditions = [searchFilter, roleSubquery].filter(Boolean);

  const result = await db
    .select({ total: count() })
    .from(entreprises)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  return result[0]?.total ?? 0;
}

/**
 * Récupère une entreprise avec ses détails (rôles + nb sites) par ID
 * Utilisé pour la page de détail d'une entreprise
 */
export async function getEntrepriseWithDetailsById(
  entrepriseId: string,
): Promise<EntrepriseWithDetails | null> {
  const results = await db
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
      logoId: entreprises.logoId,
      logoStorageKey: sql<string | null>`MAX(${documents.storageKey})`,
      createdAt: entreprises.createdAt,
      updatedAt: entreprises.updatedAt,
      roles: sql<string[] | null>`array_agg(DISTINCT ${entrepriseRoles.role}::text) FILTER (WHERE ${entrepriseRoles.role} IS NOT NULL)`,
      nbSites: sql<number>`COUNT(DISTINCT ${sites.id})::integer`,
      hasActiveAdmin: sql<boolean>`EXISTS (
        SELECT 1 FROM user_client_adhesions uca
        WHERE uca.entreprise_id = ${entreprises.id}
        AND uca.role = 'admin'
        AND uca.statut = 'actif'
        UNION ALL
        SELECT 1 FROM user_prestataire_adhesions upa
        WHERE upa.entreprise_id = ${entreprises.id}
        AND upa.role = 'admin'
        AND upa.statut = 'actif'
      )`,
      services: sql<Array<{ id: string; nom: string }> | null>`(
        SELECT json_agg(json_build_object('id', s.id::text, 'nom', s.nom))
        FROM service_entreprises se
        INNER JOIN services s ON s.id = se.service_id
        WHERE se.entreprise_id = ${entreprises.id}
      )`,
      pendingInvitation: sql<{ email: string; sentAt: Date } | null>`(
        SELECT json_build_object('email', ei.email, 'sentAt', ei.created_at)
        FROM ${entrepriseInvitations} ei
        WHERE ei.entreprise_id = ${entreprises.id}
          AND ei.accepted_at IS NULL
          AND ei.expires_at > NOW()
        ORDER BY ei.created_at DESC
        LIMIT 1
      )`,
    })
    .from(entreprises)
    .leftJoin(entrepriseRoles, eq(entreprises.id, entrepriseRoles.entrepriseId))
    .leftJoin(sites, eq(entreprises.id, sites.entrepriseId))
    .leftJoin(documents, eq(entreprises.logoId, documents.id))
    .where(eq(entreprises.id, entrepriseId))
    .groupBy(entreprises.id)
    .limit(1);

  const result = results[0];
  if (!result) return null;

  return {
    ...result,
    roles: (result.roles ?? []) as RoleEntrepriseType[],
    nbSites: Number(result.nbSites) || 0,
    logoStorageKey: result.logoStorageKey ?? null,
    hasActiveAdmin: Boolean(result.hasActiveAdmin),
    adminEmail: null,
    services: (result.services ?? []) as Array<{ id: string; nom: string }>,
    pendingInvitation: result.pendingInvitation ?? null,
    relationId: null,
  };
}

/**
 * Récupère les services proposés par une entreprise prestataire
 */
export async function getServicesByEntrepriseId(
  entrepriseId: string,
): Promise<Array<{ serviceId: string; nom: string }>> {
  return await db
    .select({
      serviceId: serviceEntreprises.serviceId,
      nom: services.nom,
    })
    .from(serviceEntreprises)
    .innerJoin(services, eq(serviceEntreprises.serviceId, services.id))
    .where(eq(serviceEntreprises.entrepriseId, entrepriseId))
    .orderBy(services.nom);
}

// ==================== CONTACTS ====================

/**
 * Récupère les contacts d'une entreprise, ordonnés par nom puis prénom.
 * Inclut `pendingInvitationSentAt` si une invitation non acceptée et non expirée existe.
 */
export async function getEntrepriseContactsByEntrepriseId(
  entrepriseId: string,
): Promise<EntrepriseContactWithInvitationType[]> {
  const rows = await db
    .select({
      id: entrepriseContacts.id,
      entrepriseId: entrepriseContacts.entrepriseId,
      prenom: entrepriseContacts.prenom,
      nom: entrepriseContacts.nom,
      email: entrepriseContacts.email,
      phone: entrepriseContacts.phone,
      fonction: entrepriseContacts.fonction,
      notes: entrepriseContacts.notes,
      userId: entrepriseContacts.userId,
      createdAt: entrepriseContacts.createdAt,
      updatedAt: entrepriseContacts.updatedAt,
      createdById: entrepriseContacts.createdById,
      updatedById: entrepriseContacts.updatedById,
      pendingInvitationSentAt: sql<Date | null>`(
        SELECT ci.created_at FROM ${contactsInvitations} ci
        WHERE ci.contact_id = ${entrepriseContacts.id}
          AND ci.accepted_at IS NULL
          AND ci.expires_at > NOW()
        ORDER BY ci.created_at DESC
        LIMIT 1
      )`,
    })
    .from(entrepriseContacts)
    .where(eq(entrepriseContacts.entrepriseId, entrepriseId))
    .orderBy(asc(entrepriseContacts.nom), asc(entrepriseContacts.prenom));

  return rows.map((r) => ({
    ...r,
    pendingInvitationSentAt: r.pendingInvitationSentAt ?? null,
  }));
}

export type RelationContactWithDetails = {
  id: string;
  contactId: string;
  side: "client" | "prestataire";
  role: string | null;
  estPrincipal: boolean;
  prenom: string;
  nom: string;
  email: string | null;
  phone: string | null;
  fonction: string | null;
  notes: string | null;
  userId: string | null;
  entrepriseId: string;
};

/**
 * Récupère les contacts liés à une relation client↔prestataire,
 * enrichis avec les données du contact (prenom, nom, etc.)
 */
export async function getRelationContactsByRelationId(
  relationId: string,
): Promise<RelationContactWithDetails[]> {
  const rows = await db
    .select({
      id: clientPrestataireRelationContacts.id,
      contactId: clientPrestataireRelationContacts.contactId,
      side: clientPrestataireRelationContacts.side,
      role: clientPrestataireRelationContacts.role,
      estPrincipal: clientPrestataireRelationContacts.estPrincipal,
      prenom: entrepriseContacts.prenom,
      nom: entrepriseContacts.nom,
      email: entrepriseContacts.email,
      phone: entrepriseContacts.phone,
      fonction: entrepriseContacts.fonction,
      notes: entrepriseContacts.notes,
      userId: entrepriseContacts.userId,
      entrepriseId: entrepriseContacts.entrepriseId,
    })
    .from(clientPrestataireRelationContacts)
    .innerJoin(
      entrepriseContacts,
      eq(entrepriseContacts.id, clientPrestataireRelationContacts.contactId),
    )
    .where(eq(clientPrestataireRelationContacts.relationId, relationId))
    .orderBy(
      desc(clientPrestataireRelationContacts.estPrincipal),
      asc(entrepriseContacts.nom),
      asc(entrepriseContacts.prenom),
    );

  return rows;
}
