import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import {
  ticketCategorieEnum,
  ticketPrioriteEnum,
  tickets,
  ticketsAttachments,
  ticketStatusEnum,
} from "@/db/schema";
import { emptyStringToUndefined } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const ticketCategorieSchema = z.enum(ticketCategorieEnum.enumValues);
export type TicketCategorieType = z.infer<typeof ticketCategorieSchema>;

export const ticketPrioriteSchema = z.enum(ticketPrioriteEnum.enumValues);
export type TicketPrioriteType = z.infer<typeof ticketPrioriteSchema>;

export const ticketStatusSchema = z.enum(ticketStatusEnum.enumValues);
export type TicketStatusType = z.infer<typeof ticketStatusSchema>;

//SELECT
export const selectTicketSchema = createSelectSchema(tickets, {
  titre: (schema) => schema.min(1, "Titre du ticket obligatoire"),
});
export type SelectTicketType = z.infer<typeof selectTicketSchema>;

export const selectTicketAttachmentSchema = createSelectSchema(
  ticketsAttachments,
  {
    ticketId: (schema) => schema.min(1, "Ticket obligatoire"),
    url: (schema) => schema.min(1, "URL de fichier obligatoire"),
    filename: (schema) => schema.min(1, "Nom de fichier obligatoire"),
    mimeType: (schema) => schema.min(1, "Type MIME obligatoire"),
    size: (schema) => schema.min(1, "Taille de fichier obligatoire"),
  },
);
export type SelectTicketAttachmentType = z.infer<
  typeof selectTicketAttachmentSchema
>;

//INSERT
//validation côté backend
export const insertTicketSchema = createInsertSchema(tickets, {
  clientId: (schema) => schema.min(1, "Client obligatoire"),
  siteId: (schema) => schema.min(1, "Site obligatoire"),
  titre: (schema) => schema.min(1, "Titre du ticket obligatoire"),
});
export type InsertTicketType = z.infer<typeof insertTicketSchema>;

export const insertTicketAttachmentSchema = createInsertSchema(
  ticketsAttachments,
  {
    ticketId: (schema) => schema.min(1, "Ticket obligatoire"),
    url: (schema) => schema.min(1, "URL de fichier obligatoire"),
    filename: (schema) => schema.min(1, "Nom de fichier obligatoire"),
    mimeType: (schema) => schema.min(1, "Type MIME obligatoire"),
  },
);
export type InsertTicketAttachmentType = z.infer<
  typeof insertTicketAttachmentSchema
>;
//formulaire frontend
export const insertTicketFormSchema = insertTicketSchema
  .omit({
    clientId: true,
    dateCloture: true,
  })
  .extend({
    attachments: insertTicketAttachmentSchema
      .omit({
        ticketId: true,
        uploadedById: true,
      })
      .array()
      .optional(),
  });

export type InsertTicketFormType = z.infer<typeof insertTicketFormSchema>;

//UPDATE
//validation côté backend
export const updateTicketSchema = createUpdateSchema(tickets);
export type UpdateTicketType = z.infer<typeof updateTicketSchema>;

//formulaire frontend
export const updateTicketFormSchema = updateTicketSchema
  .omit({
    dateCloture: true,
  })
  .extend({
    attachments: insertTicketAttachmentSchema
      .omit({
        ticketId: true,
        uploadedById: true,
      })
      .array()
      .optional(),
  });
export type UpdateTicketFormType = z.infer<typeof updateTicketFormSchema>;

//=========================== QUERY: SORT, FILTERS, ETC.============================//
//Pour un select je n'ai pas besoin de récupérer les attachments

export const SORTABLE_TICKETS_COLUMNS = {
  id: tickets.id,
  siteId: tickets.siteId,
  fournisseurId: tickets.fournisseurId,
  createdAt: tickets.createdAt,
  updatedAt: tickets.updatedAt,
  titre: tickets.titre,
  categorie: tickets.categorie,
  priorite: tickets.priorite,
  status: tickets.status,
  dateCloture: tickets.dateCloture,
} as const;

export const ticketsOrderBySchema = z.enum([
  "id",
  "siteId",
  "fournisseurId",
  "createdAt",
  "updatedAt",
  "titre",
  "categorie",
  "priorite",
  "status",
  "dateCloture",
]);
export type TicketsSortableColumnType = z.infer<typeof ticketsOrderBySchema>;

//========= BACKEND : Schema attendu pour getTickets : filtres + tri + pagination ========//
const DEFAULT_ORDER_BY: TicketsSortableColumnType = "createdAt";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "desc";

export const ticketsQueryBackendSchema = z.object({
  //filtres
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  categorie: ticketCategorieSchema.optional(),
  priorite: ticketPrioriteSchema.optional(),
  status: ticketStatusSchema.optional(),
  fournisseurId: z.number().int().optional(),
  siteId: z.number().int().optional(),
  //tri
  orderBy: ticketsOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  //pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});
export type TicketsQueryBackendType = z.infer<typeof ticketsQueryBackendSchema>;

//========= FRONTEND ========//
//filtres
export const ticketsQueryFiltersSchema = z.object({
  createdFrom: emptyStringToUndefined,
  createdTo: emptyStringToUndefined,
  categorie: ticketCategorieSchema.or(z.literal("all")).optional(),
  priorite: ticketPrioriteSchema.or(z.literal("all")).optional(),
  status: ticketStatusSchema.or(z.literal("all")).optional(),
  fournisseurId: emptyStringToUndefined,
  siteId: emptyStringToUndefined,
});
export type TicketsQueryFiltersType = z.infer<typeof ticketsQueryFiltersSchema>;

//filtres + tri + pagination
export const ticketsQueryFrontendSchema = ticketsQueryFiltersSchema
  .merge(
    createSortSchema(SORTABLE_TICKETS_COLUMNS, "createdAt"), // orderBy, orderDir
  )
  .extend({
    //pagination
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(DEFAULT_PAGE_SIZE),
  });

export type TicketsQueryFrontendType = z.infer<
  typeof ticketsQueryFrontendSchema
>;

//Fonction qui récupère les query params de l'URL et les parse en TicketsQueryBackendType
export function parseTicketsQuery(
  raw: RawSearchParams,
): TicketsQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = ticketsQueryFrontendSchema.parse(normalized);

  //conversion vers types backend
  const createdFrom =
    urlQuery.createdFrom && !Number.isNaN(Date.parse(urlQuery.createdFrom))
      ? new Date(urlQuery.createdFrom)
      : undefined;

  const createdTo =
    urlQuery.createdTo && !Number.isNaN(Date.parse(urlQuery.createdTo))
      ? new Date(urlQuery.createdTo)
      : undefined;

  const fournisseurId =
    urlQuery.fournisseurId && !Number.isNaN(Number(urlQuery.fournisseurId))
      ? Number(urlQuery.fournisseurId)
      : undefined;

  const siteId =
    urlQuery.siteId && !Number.isNaN(Number(urlQuery.siteId))
      ? Number(urlQuery.siteId)
      : undefined;

  const categorie =
    urlQuery.categorie && urlQuery.categorie !== "all"
      ? urlQuery.categorie
      : undefined;

  const priorite =
    urlQuery.priorite && urlQuery.priorite !== "all"
      ? urlQuery.priorite
      : undefined;

  const status =
    urlQuery.status && urlQuery.status !== "all" ? urlQuery.status : undefined;

  const orderBy =
    urlQuery.orderBy &&
    Object.keys(SORTABLE_TICKETS_COLUMNS).includes(urlQuery.orderBy)
      ? (urlQuery.orderBy as TicketsSortableColumnType)
      : DEFAULT_ORDER_BY;

  const orderDir =
    urlQuery.orderDir === "asc" || urlQuery.orderDir === "desc"
      ? urlQuery.orderDir
      : DEFAULT_ORDER_DIR;

  // Etape 3 : on repasse par le schema backend pour être sûr
  return ticketsQueryBackendSchema.parse({
    createdFrom,
    createdTo,
    categorie,
    priorite,
    status,
    fournisseurId,
    siteId,
    orderBy,
    orderDir,
    page: urlQuery.page,
    pageSize: urlQuery.pageSize,
  });
}

export type AttachmentFieldValue = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};
