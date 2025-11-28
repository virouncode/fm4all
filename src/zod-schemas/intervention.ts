import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import {
  interventions,
  interventionStatusEnum,
  interventionTypeEnum,
} from "@/db/schema";
import { emptyStringToUndefined } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const interventionTypeSchema = z.enum(interventionTypeEnum.enumValues);
export type InterventionTypeType = z.infer<typeof interventionTypeSchema>;

export const interventionStatusSchema = z.enum(
  interventionStatusEnum.enumValues,
);
export type InterventionStatusType = z.infer<typeof interventionStatusSchema>;

//SELECT
export const selectInterventionSchema = createSelectSchema(interventions, {
  titre: (schema) => schema.min(1, "Le titre est obligatoire"),
});

export type SelectInterventionType = z.infer<typeof selectInterventionSchema>;

//INSERT
export const insertInterventionSchema = z.object({
  type: interventionTypeSchema,
  fournisseurId: z.int().min(1, "Le prestataire est obligatoire"),
  clientId: z.int().min(1, "Le client est obligatoire"),
  siteId: z.int().min(1, "Le site est obligatoire"),
  titre: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().optional(),
});

export type InsertInterventionType = z.infer<typeof insertInterventionSchema>;

//UPDATE
export const updateInterventionSchema = createUpdateSchema(interventions, {
  titre: (schema) => schema.min(1, "Le titre est obligatoire"),
}).omit({
  createdById: true,
  updatedById: true, // Will be set server-side
  createdAt: true,
  updatedAt: true,
  clientId: true, // Immutable
});
export type UpdateInterventionType = z.infer<typeof updateInterventionSchema>;

export const clientUpdateInterventionFormSchema =
  updateInterventionSchema.extend({
    dateDebutPrevue: z
      .string()
      .min(1, "La date de début prévue est obligatoire"),
    dateFinPrevue: z.string().optional(),
  });
export type ClientUpdateInterventionFormType = z.infer<
  typeof clientUpdateInterventionFormSchema
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
  type: z.string().optional(),
  status: z.string().optional(),
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
export const interventionsQueryFiltersSchema = z.object({
  dateDebutPrevueFrom: emptyStringToUndefined,
  dateDebutPrevueTo: emptyStringToUndefined,
  type: interventionTypeSchema.or(z.literal("all")).optional(),
  status: interventionStatusSchema.or(z.literal("all")).optional(),
  fournisseurId: emptyStringToUndefined,
  siteId: emptyStringToUndefined,
});

export type InterventionsQueryFiltersType = z.infer<
  typeof interventionsQueryFiltersSchema
>;

//filtres + tri + pagination
export const interventionsQueryFrontendSchema = interventionsQueryFiltersSchema
  .merge(createSortSchema(SORTABLE_INTERVENTIONS_COLUMNS, "dateDebutPrevue"))
  .extend({
    //pagination
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(DEFAULT_PAGE_SIZE),
  });
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
    page: urlQuery.page,
    pageSize: urlQuery.pageSize,
  });
}
