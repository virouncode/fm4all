import "server-only";

import { db } from "@/db";
import { prospects } from "@/db/schema/prospects";
import { ilike, or, sql, count, asc, desc } from "drizzle-orm";
import type { SelectProspectType } from "@/zod-schemas/entreprise.schema";

type GetProspectsPaginatedParams = {
  search?: string;
  orderBy?: "nomEntreprise" | "createdAt";
  orderDir?: "asc" | "desc";
  page: number;
  pageSize: number;
};

/**
 * Récupère les prospects paginés avec filtre et tri
 * Réservé à la posture plateforme
 */
export async function getProspectsPaginated({
  search,
  orderBy = "nomEntreprise",
  orderDir = "asc",
  page,
  pageSize,
}: GetProspectsPaginatedParams): Promise<SelectProspectType[]> {
  const offset = (page - 1) * pageSize;

  const searchFilter = search
    ? or(
        ilike(prospects.nomEntreprise, `%${search}%`),
        ilike(prospects.emailContact, `%${search}%`),
        ilike(sql`CONCAT(${prospects.prenomContact}, ' ', ${prospects.nomContact})`, `%${search}%`),
        ilike(prospects.ville, `%${search}%`),
      )
    : undefined;

  const orderColumn =
    orderBy === "nomEntreprise" ? prospects.nomEntreprise : prospects.createdAt;
  const orderFn = orderDir === "asc" ? asc(orderColumn) : desc(orderColumn);

  const results = await db
    .select({
      id: prospects.id,
      nomEntreprise: prospects.nomEntreprise,
      siret: prospects.siret,
      prenomContact: prospects.prenomContact,
      nomContact: prospects.nomContact,
      emailContact: prospects.emailContact,
      phoneContact: prospects.phoneContact,
      codePostal: prospects.codePostal,
      ville: prospects.ville,
      createdAt: prospects.createdAt,
    })
    .from(prospects)
    .where(searchFilter)
    .orderBy(orderFn)
    .limit(pageSize)
    .offset(offset);

  return results;
}

/**
 * Compte le total de prospects pour la pagination
 */
export async function countProspects({
  search,
}: {
  search?: string;
}): Promise<number> {
  const searchFilter = search
    ? or(
        ilike(prospects.nomEntreprise, `%${search}%`),
        ilike(prospects.emailContact, `%${search}%`),
        ilike(sql`CONCAT(${prospects.prenomContact}, ' ', ${prospects.nomContact})`, `%${search}%`),
        ilike(prospects.ville, `%${search}%`),
      )
    : undefined;

  const result = await db
    .select({ total: count() })
    .from(prospects)
    .where(searchFilter);

  return result[0]?.total ?? 0;
}
