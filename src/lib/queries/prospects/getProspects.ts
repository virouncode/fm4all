import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { db } from "@/db";
import { prospects } from "@/db/schema";
import {
  dateToUtcStartOfDay,
  dateToUtcStartOfNextDay,
} from "@/lib/utils/formatDates";
import {
  ProspectsQueryBackendType,
  selectProspectSchema,
  SORTABLE_PROSPECTS_COLUMNS,
} from "@/zod-schemas/prospect";
import { and, asc, desc, gte, ilike, lt, SQL, sql } from "drizzle-orm";

export const getProspects = async (params: {
  query: ProspectsQueryBackendType;
}) => {
  const {
    createdFrom,
    createdTo,
    nomEntreprise,
    siret,
    nomContact,
    emailContact,
    phoneContact,
    codePostal,
    ville,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate)
      whereClauses.push(gte(prospects.createdAt, createdFromDate));
  }
  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate)
      whereClauses.push(lt(prospects.createdAt, createdToDate));
  }

  if (nomEntreprise)
    whereClauses.push(ilike(prospects.nomEntreprise, `%${nomEntreprise}%`));
  if (siret) whereClauses.push(ilike(prospects.siret, `%${siret}%`));
  if (nomContact)
    whereClauses.push(ilike(prospects.nomContact, `%${nomContact}%`));
  if (emailContact)
    whereClauses.push(ilike(prospects.emailContact, `%${emailContact}%`));
  if (phoneContact)
    whereClauses.push(ilike(prospects.phoneContact, `%${phoneContact}%`));
  if (codePostal)
    whereClauses.push(ilike(prospects.codePostal, `%${codePostal}%`));
  if (ville) whereClauses.push(ilike(prospects.ville, `%${ville}%`));

  const orderColumn =
    SORTABLE_PROSPECTS_COLUMNS[orderBy] ?? SORTABLE_PROSPECTS_COLUMNS.createdAt;

  const orderDirection = orderDir === "asc" ? asc : desc;
  const orderExpr = orderDirection(orderColumn);

  const effectivePage = page ?? 1;
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = (effectivePage - 1) * effectivePageSize;

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [totalRows] = await db
    .select({
      value: sql<number>`cast(count(*) as int)`,
    })
    .from(prospects)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(prospects)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1) // +1 pour savoir s'il y a une page suivante
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((prospect) => selectProspectSchema.parse(prospect));
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
