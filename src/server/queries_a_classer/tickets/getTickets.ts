import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { db } from "@/db";
import { tickets, ticketsAttachments } from "@/db/schema";
import {
  dateToUtcStartOfDay,
  dateToUtcStartOfNextDay,
} from "@/lib/utils/formatDates";
import {
  selectTicketSchema,
  SORTABLE_TICKETS_COLUMNS,
  TicketsQueryBackendType,
} from "@/zod-schemas/ticket";
import { and, asc, desc, eq, gte, lt, sql, SQL } from "drizzle-orm";

export const getTickets = async (params: {
  clientId: number;
  query: TicketsQueryBackendType;
}) => {
  const {
    createdFrom,
    createdTo,
    categorie,
    priorite,
    status,
    type,
    fournisseurId,
    siteId,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];
  whereClauses.push(eq(tickets.clientId, params.clientId));

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate)
      whereClauses.push(gte(tickets.createdAt, createdFromDate));
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate) whereClauses.push(lt(tickets.createdAt, createdToDate));
  }

  if (categorie) whereClauses.push(eq(tickets.categorie, categorie));
  if (priorite) whereClauses.push(eq(tickets.priorite, priorite));
  if (status) whereClauses.push(eq(tickets.status, status));
  if (type) whereClauses.push(eq(tickets.type, type));
  if (fournisseurId)
    whereClauses.push(eq(tickets.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(tickets.siteId, siteId));

  const orderColumn =
    SORTABLE_TICKETS_COLUMNS[orderBy] ?? SORTABLE_TICKETS_COLUMNS.createdAt;

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
    .from(tickets)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(tickets)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1) // +1 pour savoir s'il y a une page suivante
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((ticket) => selectTicketSchema.parse(ticket));
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

// ======================= ADMIN: getAllTickets ==========================//
// Version avec clientId optionnel pour la page admin/tous-les-tickets

import { AdminTicketsQueryBackendType } from "@/zod-schemas/ticket";

export const getAllTickets = async (params: {
  query: AdminTicketsQueryBackendType;
}) => {
  const {
    clientId,
    createdFrom,
    createdTo,
    categorie,
    priorite,
    status,
    type,
    fournisseurId,
    siteId,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];

  // clientId optionnel - si undefined, on récupère tous les tickets
  if (clientId) {
    whereClauses.push(eq(tickets.clientId, clientId));
  }

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate)
      whereClauses.push(gte(tickets.createdAt, createdFromDate));
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate) whereClauses.push(lt(tickets.createdAt, createdToDate));
  }

  if (categorie) whereClauses.push(eq(tickets.categorie, categorie));
  if (priorite) whereClauses.push(eq(tickets.priorite, priorite));
  if (status) whereClauses.push(eq(tickets.status, status));
  if (type) whereClauses.push(eq(tickets.type, type));
  if (fournisseurId)
    whereClauses.push(eq(tickets.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(tickets.siteId, siteId));

  const orderColumn =
    SORTABLE_TICKETS_COLUMNS[orderBy] ?? SORTABLE_TICKETS_COLUMNS.createdAt;

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
    .from(tickets)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(tickets)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1)
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((ticket) => selectTicketSchema.parse(ticket));
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

// Fonction simple pour récupérer tous les tickets sans pagination
export const getAllTicketsSimple = async () => {
  const rows = await db.select().from(tickets).orderBy(desc(tickets.createdAt));

  return rows.map((ticket) => selectTicketSchema.parse(ticket));
};

export const getTicket = async (ticketId: number) => {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });
  if (!ticket) {
    return null;
  }
  const parsedTicket = selectTicketSchema.parse(ticket);
  //Récupérer les pj associées au ticket si besoin
  const attachments = await db.query.ticketsAttachments.findMany({
    where: eq(ticketsAttachments.ticketId, ticketId),
  });
  return { ...parsedTicket, attachments };
};

// ======================= ADMIN: getAllDevisTickets ==========================//
// Version avec clientId optionnel pour la page admin/devis/toutes-les-demandes

export const getAllDevisTickets = async (params: {
  query: AdminTicketsQueryBackendType;
}) => {
  const {
    clientId,
    createdFrom,
    createdTo,
    categorie,
    priorite,
    status,
    fournisseurId,
    siteId,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];

  // Forcer le type à "demande_devis"
  whereClauses.push(eq(tickets.type, "demande_devis"));

  // clientId optionnel - si undefined, on récupère tous les tickets devis
  if (clientId) {
    whereClauses.push(eq(tickets.clientId, clientId));
  }

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate)
      whereClauses.push(gte(tickets.createdAt, createdFromDate));
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate) whereClauses.push(lt(tickets.createdAt, createdToDate));
  }

  if (categorie) whereClauses.push(eq(tickets.categorie, categorie));
  if (priorite) whereClauses.push(eq(tickets.priorite, priorite));
  if (status) whereClauses.push(eq(tickets.status, status));
  if (fournisseurId)
    whereClauses.push(eq(tickets.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(tickets.siteId, siteId));

  const orderColumn =
    SORTABLE_TICKETS_COLUMNS[orderBy] ?? SORTABLE_TICKETS_COLUMNS.createdAt;

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
    .from(tickets)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(tickets)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1)
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((ticket) => selectTicketSchema.parse(ticket));
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

// ======================= CLIENT: getDevisTickets ==========================//

export const getDevisTickets = async (params: {
  clientId: number;
  query: TicketsQueryBackendType;
}) => {
  const {
    createdFrom,
    createdTo,
    priorite,
    status,
    fournisseurId,
    siteId,
    orderBy,
    orderDir,
    page,
    pageSize,
  } = params.query;

  const whereClauses: SQL[] = [];
  whereClauses.push(eq(tickets.clientId, params.clientId));

  if (createdFrom) {
    const createdFromDate = dateToUtcStartOfDay(createdFrom);
    if (createdFromDate)
      whereClauses.push(gte(tickets.createdAt, createdFromDate));
  }

  if (createdTo) {
    const createdToDate = dateToUtcStartOfNextDay(createdTo);
    if (createdToDate) whereClauses.push(lt(tickets.createdAt, createdToDate));
  }

  whereClauses.push(eq(tickets.type, "demande_devis"));
  if (priorite) whereClauses.push(eq(tickets.priorite, priorite));
  if (status) whereClauses.push(eq(tickets.status, status));
  if (fournisseurId)
    whereClauses.push(eq(tickets.fournisseurId, fournisseurId));
  if (siteId) whereClauses.push(eq(tickets.siteId, siteId));

  const orderColumn =
    SORTABLE_TICKETS_COLUMNS[orderBy] ?? SORTABLE_TICKETS_COLUMNS.createdAt;

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
    .from(tickets)
    .where(where);

  const total = totalRows?.value ?? 0;
  const totalPages = Math.max(Math.ceil(total / effectivePageSize), 1);

  const rows = await db
    .select()
    .from(tickets)
    .where(where)
    .orderBy(orderExpr)
    .limit(effectivePageSize + 1) // +1 pour savoir s'il y a une page suivante
    .offset(offset);

  const hasMore = rows.length > effectivePageSize;
  const slice = hasMore ? rows.slice(0, effectivePageSize) : rows;
  const items = slice.map((ticket) => selectTicketSchema.parse(ticket));
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
