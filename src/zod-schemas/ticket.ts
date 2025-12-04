import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { tickets, ticketsAttachments } from "@/db/schema";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";

import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import { capitalizeFirstWord } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import {
  ticketCategorieSchema,
  ticketPrioriteSchema,
  ticketStatusSchema,
} from "./enums";

export const selectTicketSchema = createSelectSchema(tickets);
export type SelectTicketType = z.infer<typeof selectTicketSchema>;

export const selectTicketAttachmentSchema =
  createSelectSchema(ticketsAttachments);
export type SelectTicketAttachmentType = z.infer<
  typeof selectTicketAttachmentSchema
>;

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true, //ajouté côté serveur
  updatedById: true, //ajouté côté serveur
  clientId: true, //ajouté côté serveur
});
export type InsertTicketType = z.infer<typeof insertTicketSchema>;

export const insertTicketToDbSchema = insertTicketSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string()
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
  clientId: z.number().positive(),
});
export type InsertTicketToDbType = z.infer<typeof insertTicketToDbSchema>;

export const insertTicketAttachmentSchema = createInsertSchema(
  ticketsAttachments,
).omit({
  id: true,
  createdAt: true,
  createdById: true, //ajouté côté serveur
});
export type InsertTicketAttachmentType = z.infer<
  typeof insertTicketAttachmentSchema
>;

export const insertTicketAttachmentToDbSchema =
  insertTicketAttachmentSchema.extend({
    createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  });
export type InsertTicketAttachmentToDbType = z.infer<
  typeof insertTicketAttachmentToDbSchema
>;

export const insertTicketAttachmentsForActionSchema =
  insertTicketAttachmentSchema
    .omit({
      ticketId: true,
    })
    .array()
    .optional();

export type InsertTicketAttachmentsForActionType = z.infer<
  typeof insertTicketAttachmentsForActionSchema
>;

export const insertTicketInputSchema = insertTicketSchema.extend({
  attachments: insertTicketAttachmentsForActionSchema,
});
export type InsertTicketInputType = z.infer<typeof insertTicketInputSchema>;

export const updateTicketSchema = createUpdateSchema(tickets)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true, //ne peut pas être mis à jour
    updatedById: true, //ajouté côté serveur
    clientId: true, //ne peut pas être mis à jour
  })
  .extend({
    id: z.number().positive("ID du ticket invalide"),
  });
export type UpdateTicketType = z.infer<typeof updateTicketSchema>;

export const updateTicketInDbSchema = updateTicketSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, //on ne met pas à jour l'id dans le parse
  });
export type UpdateTicketInDbType = z.infer<typeof updateTicketInDbSchema>;

export const updateTicketInputSchema = updateTicketSchema.extend({
  attachments: insertTicketAttachmentsForActionSchema,
});

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage
//formulaire frontend
export const insertTicketFormSchema = z.object({
  titre: z
    .string()
    .min(1, "Titre du ticket obligatoire")
    .transform((v) => capitalizeFirstWord(v)),
  categorie: ticketCategorieSchema,
  priorite: ticketPrioriteSchema,
  status: ticketStatusSchema,
  siteId: z.string().refine((val) => val !== "0", "Site obligatoire"), //select
  fournisseurId: z
    .string()
    .refine((val) => val !== "0", "Prestataire obligatoire"), //select
  description: z.string(),
  attachments: insertTicketAttachmentSchema
    .omit({
      ticketId: true,
      uploadedById: true,
    })
    .array()
    .optional(),
});

export type InsertTicketFormType = z.infer<typeof insertTicketFormSchema>;

export const updateTicketFormSchema = insertTicketFormSchema.partial().extend({
  id: z.number().positive("ID du ticket invalide"),
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
  fournisseurId: z.number().int().positive().optional(),
  siteId: z.number().int().positive().optional(),
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
export const ticketsQueryFiltersSchema = z
  .object({
    createdFrom: emptyStringToUndefinedOptional,
    createdTo: emptyStringToUndefinedOptional,
    categorie: ticketCategorieSchema.or(z.literal("all")).optional(),
    priorite: ticketPrioriteSchema.or(z.literal("all")).optional(),
    status: ticketStatusSchema.or(z.literal("all")).optional(),
    fournisseurId: emptyStringToUndefinedOptional
      .or(z.literal("all"))
      .optional(),
    siteId: emptyStringToUndefinedOptional.or(z.literal("all")).optional(),
  })
  .partial();
export type TicketsQueryFiltersType = z.infer<typeof ticketsQueryFiltersSchema>;

//filtres + tri + pagination
export const ticketsQueryFrontendSchema = ticketsQueryFiltersSchema.merge(
  createSortSchema(SORTABLE_TICKETS_COLUMNS, "createdAt"), // orderBy, orderDir
);

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
    urlQuery.fournisseurId &&
    !Number.isNaN(Number(urlQuery.fournisseurId)) &&
    urlQuery.fournisseurId !== "all"
      ? Number(urlQuery.fournisseurId)
      : undefined;

  const siteId =
    urlQuery.siteId &&
    !Number.isNaN(Number(urlQuery.siteId)) &&
    urlQuery.siteId !== "all"
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
  });
}

export type AttachmentFieldValue = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};
