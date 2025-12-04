import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { interventions } from "@/db/schema";
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
import { interventionTypeSchema, interventionStatusSchema } from "./enums";

export const selectInterventionSchema = createSelectSchema(interventions);
export type SelectInterventionType = z.infer<typeof selectInterventionSchema>;

export const insertInterventionSchema = createInsertSchema(interventions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  confirmeeClient: true, //ajouté côté serveur
  confirmeeFournisseur: true, //ajouté côté serveur
  clientConfirmedAt: true, //ajouté côté serveur
  fournisseurConfirmedAt: true, //ajouté côté serveur
  createdById: true, //ajouté côté serveur
  updatedById: true, //ajouté côté serveur
  dateDebutReelle: true,
  dateFinReelle: true,
});
export type InsertInterventionType = z.infer<typeof insertInterventionSchema>;

export const insertInterventionToDbSchema = insertInterventionSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string()
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
  confirmeeClient: z.boolean(),
  confirmeeFournisseur: z.boolean(),
  clientConfirmedAt: z.date().optional().nullable(),
  fournisseurConfirmedAt: z.date().optional().nullable(),
});
export type InsertInterventionToDbType = z.infer<
  typeof insertInterventionToDbSchema
>;

//UPDATE
export const updateInterventionSchema = createUpdateSchema(interventions)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true, //ne peut pas être mis à jour
    updatedById: true, //ajouté côté serveur
    confirmeeClient: true, //ajouté côté serveur
    confirmeeFournisseur: true, //ajouté côté serveur
    clientConfirmedAt: true, //ajouté côté serveur
    fournisseurConfirmedAt: true, //ajouté côté serveur
  })
  .extend({
    id: z.number().positive("ID de l'intervention invalide"),
  });
export type UpdateInterventionType = z.infer<typeof updateInterventionSchema>;

export const updateInterventionInDbSchema = updateInterventionSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
    confirmeeClient: z.boolean(),
    confirmeeFournisseur: z.boolean(),
    clientConfirmedAt: z.date().optional().nullable(),
    fournisseurConfirmedAt: z.date().optional().nullable(),
  })
  .omit({ id: true });
export type UpdateInterventionInDbType = z.infer<
  typeof updateInterventionInDbSchema
>;

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

export const insertInterventionFormSchema = z.object({
  titre: z
    .string()
    .min(1, "Le titre de l'intervention est obligatoire")
    .transform((v) => capitalizeFirstWord(v)),
  type: interventionTypeSchema,
  siteId: z.string().min(1, "Le site est obligatoire"), //select
  clientId: z.string().min(1, "Le client est obligatoire"), //select
  fournisseurId: z.string().min(1, "Le fournisseur est obligatoire"), //select
  dateDebutPrevue: z.string().min(1, "La date de début prévue est obligatoire"),
  dateFinPrevue: z.string().optional(),
  description: z.string().optional(),
});
export type InsertInterventionFormType = z.infer<
  typeof insertInterventionFormSchema
>;

export const updateInterventionFormSchema = insertInterventionFormSchema
  .partial()
  .extend({
    id: z.number().positive("ID de l'intervention invalide"),
  });

export type UpdateInterventionFormType = z.infer<
  typeof updateInterventionFormSchema
>;

//=========================== QUERY: SORT, FILTERS, ETC.============================//

export const SORTABLE_INTERVENTIONS_COLUMNS = {
  id: interventions.id,
  ticketId: interventions.ticketId,
  siteId: interventions.siteId,
  fournisseurId: interventions.fournisseurId,
  createdAt: interventions.createdAt,
  updatedAt: interventions.updatedAt,
  titre: interventions.titre,
  type: interventions.type,
  status: interventions.status,
  dateDebutPrevue: interventions.dateDebutPrevue,
  dateFinPrevue: interventions.dateFinPrevue,
} as const;

export const interventionsOrderBySchema = z.enum([
  "id",
  "ticketId",
  "siteId",
  "fournisseurId",
  "createdAt",
  "updatedAt",
  "titre",
  "type",
  "status",
  "dateDebutPrevue",
  "dateFinPrevue",
]);

export type InterventionsOrderByType = z.infer<
  typeof interventionsOrderBySchema
>;

//========= BACKEND : Schema attendu pour getTickets : filtres + tri + pagination ========//
const DEFAULT_ORDER_BY: InterventionsOrderByType = "dateDebutPrevue";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "desc";

//filres
export const interventionsQueryBackendSchema = z.object({
  dateDebutPrevueFrom: z.date().optional(),
  dateDebutPrevueTo: z.date().optional(),
  type: interventionTypeSchema.optional(),
  status: interventionStatusSchema.optional(),
  fournisseurId: z.number().int().optional(),
  siteId: z.number().int().optional(),
  //tri
  orderBy: interventionsOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  //pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});
export type InterventionsQueryBackendType = z.infer<
  typeof interventionsQueryBackendSchema
>;

//========= FRONTEND ========//
//filtres
export const interventionsQueryFiltersSchema = z
  .object({
    dateDebutPrevueFrom: emptyStringToUndefinedOptional,
    dateDebutPrevueTo: emptyStringToUndefinedOptional,
    type: interventionTypeSchema.or(z.literal("all")).optional(),
    status: interventionStatusSchema.or(z.literal("all")).optional(),
    fournisseurId: emptyStringToUndefinedOptional,
    siteId: emptyStringToUndefinedOptional,
  })
  .partial();

export type InterventionsQueryFiltersType = z.infer<
  typeof interventionsQueryFiltersSchema
>;

//filtres + tri + pagination
export const interventionsQueryFrontendSchema =
  interventionsQueryFiltersSchema.merge(
    createSortSchema(SORTABLE_INTERVENTIONS_COLUMNS, "dateDebutPrevue"),
  );
export type InterventionsQueryFrontendType = z.infer<
  typeof interventionsQueryFrontendSchema
>;

//Fonction qui récupère les query params de l'URL et les parse en InterventionsQueryBackendType

export function parseInterventionsQuery(raw: RawSearchParams) {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = interventionsQueryFrontendSchema.parse(normalized);
  //conversion vers types backend
  const dateDebutPrevueFrom =
    urlQuery.dateDebutPrevueFrom &&
    !Number.isNaN(Date.parse(urlQuery.dateDebutPrevueFrom))
      ? new Date(urlQuery.dateDebutPrevueFrom)
      : undefined;
  const dateDebutPrevueTo =
    urlQuery.dateDebutPrevueTo &&
    !Number.isNaN(Date.parse(urlQuery.dateDebutPrevueTo))
      ? new Date(urlQuery.dateDebutPrevueTo)
      : undefined;
  const fournisseurId =
    urlQuery.fournisseurId && !Number.isNaN(Number(urlQuery.fournisseurId))
      ? Number(urlQuery.fournisseurId)
      : undefined;
  const siteId =
    urlQuery.siteId && !Number.isNaN(Number(urlQuery.siteId))
      ? Number(urlQuery.siteId)
      : undefined;
  const status =
    urlQuery.status && urlQuery.status !== "all" ? urlQuery.status : undefined;
  const type =
    urlQuery.type && urlQuery.type !== "all" ? urlQuery.type : undefined;

  return interventionsQueryBackendSchema.parse({
    dateDebutPrevueFrom,
    dateDebutPrevueTo,
    fournisseurId,
    siteId,
    status,
    type,
    orderBy: urlQuery.orderBy,
    orderDir: urlQuery.orderDir,
  });
}
