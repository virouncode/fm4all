import { clients } from "@/db/schema";
import { upper } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { siretSchemaEmpty } from "./siret.schema.ts";
import { insertSiteFormSchema, insertSiteSchema } from "./site";
import { insertUserFormSchema, insertUserSchema } from "./user";

export const clientRowSchema = createSelectSchema(clients);
export type ClientRowType = z.infer<typeof clientRowSchema>;

export const clientSelectSchema = clientRowSchema;
export type ClientSelectType = z.infer<typeof clientSelectSchema>;

export const selectClientSchema = createSelectSchema(clients);
export type SelectClientType = z.infer<typeof selectClientSchema>;

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClientType = z.infer<typeof insertClientSchema>;

export const insertClientToDbSchema = insertClientSchema.extend({
  createdById: z.string().min(1, "ID de l'utilisateur créateur obligatoire"),
  updatedById: z
    .string() //c'est normal que ce soit un string ici car dans la table users id est un string
    .min(1, "ID de l'utilisateur modificateur obligatoire"),
});
export type InsertClientToDbType = z.infer<typeof insertClientToDbSchema>;

export const updateClientSchema = createUpdateSchema(clients)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.number().positive("ID du client invalide"),
  });
export type UpdateClientType = z.infer<typeof updateClientSchema>;

export const updateClientInDbSchema = updateClientSchema
  .extend({
    updatedById: z
      .string() //c'est normal que ce soit un string ici car dans la table users id est un string
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, //on ne met pas à jour l'id dans le parse
  });

export type UpdateClientInDbType = z.infer<typeof updateClientInDbSchema>;

export const onboardClientSchema = z.object({
  client: insertClientSchema,
  sitePrincipal: insertSiteSchema,
  userAdmin: insertUserSchema,
});

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

//Créer un client + un site principal + un user administrateur pour ce client

export const onboardClientFormSchema = z.object({
  client: z.object({
    nomEntreprise: z
      .string()
      .min(1, "Le nom de l'entreprise est obligatoire")
      .transform((v) => upper(v)),
    siret: siretSchemaEmpty("SIRET invalide"),
    prospectId: z.number().optional().nullable(),
  }),
  sitePrincipal: insertSiteFormSchema,
  userAdmin: insertUserFormSchema,
});

export type OnboardClientFormType = z.infer<typeof onboardClientFormSchema>;

//======================= UPDATE CLIENT FORM SCHEMA ==========================//

export const updateClientFormSchema = z.object({
  id: z.number().positive("ID du client invalide"),
  nomEntreprise: z
    .string()
    .min(1, "Le nom de l'entreprise est obligatoire")
    .transform((v) => upper(v)),
  siret: siretSchemaEmpty("SIRET invalide"),
});

export type UpdateClientFormType = z.infer<typeof updateClientFormSchema>;

//=========================== ADMIN: QUERY SCHEMAS ============================//

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";

// Colonnes triables
export const SORTABLE_CLIENTS_COLUMNS = {
  id: clients.id,
  prospectId: clients.prospectId,
  nomEntreprise: clients.nomEntreprise,
  siret: clients.siret,
  createdAt: clients.createdAt,
  updatedAt: clients.updatedAt,
} as const;

export const clientsOrderBySchema = z.enum([
  "id",
  "prospectId",
  "nomEntreprise",
  "siret",
  "createdAt",
  "updatedAt",
]);

export type ClientsOrderByType = z.infer<typeof clientsOrderBySchema>;

// Backend schema
const DEFAULT_ORDER_BY: ClientsOrderByType = "nomEntreprise";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "asc";

export const clientsQueryBackendSchema = z.object({
  // Filtres
  nomEntreprise: z.string().optional(),
  siret: z.string().optional(),
  // Tri
  orderBy: clientsOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  // Pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});
export type ClientsQueryBackendType = z.infer<typeof clientsQueryBackendSchema>;

// Frontend filters
export const clientsQueryFiltersSchema = z
  .object({
    nomEntreprise: emptyStringToUndefinedOptional,
    siret: emptyStringToUndefinedOptional,
  })
  .partial();

export type ClientsQueryFiltersType = z.infer<typeof clientsQueryFiltersSchema>;

// Frontend schema complet (filtres + tri)
export const clientsQueryFrontendSchema = clientsQueryFiltersSchema.merge(
  createSortSchema(SORTABLE_CLIENTS_COLUMNS, "nomEntreprise"),
);
export type ClientsQueryFrontendType = z.infer<
  typeof clientsQueryFrontendSchema
>;

// Parse function
export function parseClientsQuery(raw: RawSearchParams) {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = clientsQueryFrontendSchema.parse(normalized);

  const nomEntreprise =
    urlQuery.nomEntreprise &&
    urlQuery.nomEntreprise !== "all" &&
    urlQuery.nomEntreprise !== ""
      ? urlQuery.nomEntreprise
      : undefined;

  const siret =
    urlQuery.siret && urlQuery.siret !== "" ? urlQuery.siret : undefined;

  return clientsQueryBackendSchema.parse({
    nomEntreprise,
    siret,
    orderBy: urlQuery.orderBy,
    orderDir: urlQuery.orderDir,
  });
}
