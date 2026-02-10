import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { db } from "@/db";
import { interventions } from "@/db/schema";
import {
  dateToUtcStartOfDay,
  dateToUtcStartOfNextDay,
} from "@/lib/utils/formatDates";
import {
  InterventionsQueryBackendType,
  selectInterventionSchema,
  SORTABLE_INTERVENTIONS_COLUMNS,
} from "@/zod-schemas/intervention";
import { and, asc, desc, eq, gte, lt, sql, SQL } from "drizzle-orm";

export const getInterventions = async (params: {
  clientId: number;
  query: InterventionsQueryBackendType;
}) => {
  const {
    dateDebutPrevueFrom,
    dateDebutPrevueTo,
    fournisseurId,
    siteId,
    status,
    type,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;
  const whereClauses: SQL[] = [];
  whereClauses.push(eq(interventions.clientId, params.clientId));

  if (dateDebutPrevueFrom) {
    const dateDebutPrevueFromDate = dateToUtcStartOfDay(dateDebutPrevueFrom);
    if (dateDebutPrevueFromDate)
      whereClauses.push(
        gte(interventions.dateDebutPrevue, dateDebutPrevueFromDate),
      );
  }
  if (dateDebutPrevueTo) {
    const dateDebutPrevueToDate = dateToUtcStartOfNextDay(dateDebutPrevueTo);
    if (dateDebutPrevueToDate)
      whereClauses.push(
        lt(interventions.dateDebutPrevue, dateDebutPrevueToDate),
      );
  }
  if (fournisseurId)
    whereClauses.push(eq(interventions.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(interventions.siteId, siteId));
  if (status) whereClauses.push(eq(interventions.status, status));
  if (type) whereClauses.push(eq(interventions.type, type));

  const orderColumn =
    SORTABLE_INTERVENTIONS_COLUMNS[orderBy] ??
    SORTABLE_INTERVENTIONS_COLUMNS.dateDebutPrevue;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const effectivePage = page ?? 1;
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (effectivePage - 1) * effectivePageSize;

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [totalRows] = await db
    .select({ value: sql<number>`cast(count(*) as int)` })
    .from(interventions)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(interventions)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1) // +1 pour savoir s'il y a une page suivante
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((ticket) => selectInterventionSchema.parse(ticket));
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

export const getIntervention = async (interventionId: number) => {
  const intervention = await db.query.interventions.findFirst({
    where: eq(interventions.id, interventionId),
  });
  if (!intervention) {
    return null;
  }
  const parsedIntervention = selectInterventionSchema.parse(intervention);
  return parsedIntervention;
};

// ======================= ADMIN: getAllInterventions ==========================//
// Version avec clientId optionnel pour la page admin/toutes-les-interventions

import { AdminInterventionsQueryBackendType } from "@/zod-schemas/intervention";

export const getAllInterventions = async (params: {
  query: AdminInterventionsQueryBackendType;
}) => {
  const {
    clientId,
    dateDebutPrevueFrom,
    dateDebutPrevueTo,
    fournisseurId,
    siteId,
    status,
    type,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];

  // clientId optionnel - si undefined, on récupère toutes les interventions
  if (clientId) {
    whereClauses.push(eq(interventions.clientId, clientId));
  }

  if (dateDebutPrevueFrom) {
    const dateDebutPrevueFromDate = dateToUtcStartOfDay(dateDebutPrevueFrom);
    if (dateDebutPrevueFromDate)
      whereClauses.push(
        gte(interventions.dateDebutPrevue, dateDebutPrevueFromDate),
      );
  }
  if (dateDebutPrevueTo) {
    const dateDebutPrevueToDate = dateToUtcStartOfNextDay(dateDebutPrevueTo);
    if (dateDebutPrevueToDate)
      whereClauses.push(
        lt(interventions.dateDebutPrevue, dateDebutPrevueToDate),
      );
  }
  if (fournisseurId)
    whereClauses.push(eq(interventions.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(interventions.siteId, siteId));
  if (status) whereClauses.push(eq(interventions.status, status));
  if (type) whereClauses.push(eq(interventions.type, type));

  const orderColumn =
    SORTABLE_INTERVENTIONS_COLUMNS[orderBy] ??
    SORTABLE_INTERVENTIONS_COLUMNS.dateDebutPrevue;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const effectivePage = page ?? 1;
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (effectivePage - 1) * effectivePageSize;

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [totalRows] = await db
    .select({ value: sql<number>`cast(count(*) as int)` })
    .from(interventions)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(interventions)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1)
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((intervention) =>
    selectInterventionSchema.parse(intervention),
  );
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
