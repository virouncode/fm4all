import { db } from "@/db";
import { devis } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import {
  dateToUtcStartOfDay,
  dateToUtcStartOfNextDay,
} from "@/lib/utils/formatDates";
import {
  AdminDevisQueryBackendType,
  selectDevisSchema,
  SelectDevisType,
  SORTABLE_DEVIS_COLUMNS,
} from "@/zod-schemas/devisComparateur";
import { and, asc, desc, eq, gte, ilike, lt, SQL } from "drizzle-orm";

export const getAllDevis = async (params: {
  query: AdminDevisQueryBackendType;
}): Promise<SelectDevisType[]> => {
  const {
    clientId,
    fournisseurId,
    siteId,
    titre,
    typePrix,
    status,
    createdFrom,
    createdTo,
    validFrom,
    validTo,
    orderBy,
    orderDir,
  } = params.query;

  const whereClauses: SQL[] = [];

  if (clientId) whereClauses.push(eq(devis.clientId, clientId));
  if (titre) whereClauses.push(ilike(devis.titre, `%${titre}%`));
  if (status) whereClauses.push(eq(devis.status, status));
  if (fournisseurId) whereClauses.push(eq(devis.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(devis.siteId, siteId));
  if (typePrix) whereClauses.push(eq(devis.typePrix, typePrix));

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate) {
      whereClauses.push(gte(devis.createdAt, createdFromDate));
    }
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate) {
      whereClauses.push(lt(devis.createdAt, createdToDate));
    }
  }

  if (validFrom) {
    const validFromDate = dateToUtcStartOfDay(validFrom);
    if (validFromDate) {
      whereClauses.push(gte(devis.dateValidite, validFromDate));
    }
  }

  if (validTo) {
    const validToDate = dateToUtcStartOfNextDay(validTo);
    if (validToDate) {
      whereClauses.push(lt(devis.dateValidite, validToDate));
    }
  }

  const orderColumn =
    SORTABLE_DEVIS_COLUMNS[orderBy] ?? SORTABLE_DEVIS_COLUMNS.createdAt;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  try {
    const results = await db
      .select()
      .from(devis)
      .where(where)
      .orderBy(orderExpr);
    const parsedResult = results.map((s) => selectDevisSchema.parse(s));
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return [];
  }
};

export const getDevisById = async (
  devisId: number,
): Promise<SelectDevisType | null> => {
  try {
    const result = await db
      .select()
      .from(devis)
      .where(eq(devis.id, devisId))
      .limit(1);
    if (result.length === 0) {
      return null;
    }
    const parsedResult = selectDevisSchema.parse(result[0]);
    return parsedResult;
  } catch (err) {
    errorHelper(err);
    return null;
  }
};
