import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import {
  AdminSitesQueryBackendType,
  selectSiteSchema,
  SORTABLE_ADMIN_SITES_COLUMNS,
} from "@/zod-schemas/site";
import { and, asc, desc, eq, ilike, sql, SQL } from "drizzle-orm";

export const getSites = async () => {
  try {
    const results = await db.select().from(sites).orderBy(sites.nomSite);
    const parsedResults = results.map((s) => selectSiteSchema.parse(s));
    return parsedResults;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

// ======================= ADMIN: getAllSitesWithPagination ==========================//

export const getAllSitesWithPagination = async (params: {
  query: AdminSitesQueryBackendType;
}) => {
  const {
    clientId,
    nomSite,
    adresseLigne1,
    codePostal,
    ville,
    typeBatiment,
    typeOccupation,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];

  if (clientId) {
    whereClauses.push(eq(sites.clientId, clientId));
  }
  if (nomSite) {
    whereClauses.push(eq(sites.nomSite, nomSite));
  }
  if (adresseLigne1) {
    whereClauses.push(ilike(sites.adresseLigne1, `%${adresseLigne1}%`));
  }
  if (codePostal) {
    whereClauses.push(ilike(sites.codePostal, `%${codePostal}%`));
  }
  if (ville) {
    whereClauses.push(ilike(sites.ville, `%${ville}%`));
  }
  if (typeBatiment) {
    whereClauses.push(eq(sites.typeBatiment, typeBatiment));
  }
  if (typeOccupation) {
    whereClauses.push(eq(sites.typeOccupation, typeOccupation));
  }

  const orderColumn =
    SORTABLE_ADMIN_SITES_COLUMNS[orderBy] ??
    SORTABLE_ADMIN_SITES_COLUMNS.nomSite;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const effectivePage = page ?? 1;
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (effectivePage - 1) * effectivePageSize;

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [totalRows] = await db
    .select({ value: sql<number>`cast(count(*) as int)` })
    .from(sites)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(sites)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1)
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((site) => selectSiteSchema.parse(site));
  const nextPage = hasMore ? effectivePage + 1 : null;

  return {
    items,
    page: effectivePage,
    pageSize: effectivePageSize,
    total,
    totalPages,
    hasMore,
    nextPage,
  };
};
