import { devis, devisTemporaires } from "@/db/schema";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
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
import { devisStatusSchema, devisTypePrixSchema } from "./enums";
import { insertProspectSchema } from "./prospect";

export const selectDevisTemporaireSchema = createSelectSchema(devisTemporaires);
export type SelectDevisTemporaireType = z.infer<
  typeof selectDevisTemporaireSchema
>;

export const createInsertDevisTemporaireSchema = (messages: {
  texte: string;
}) => {
  return createInsertSchema(devisTemporaires, {
    texte: (schema) => schema.min(1, messages.texte),
  });
};
export const insertDevisTemporaireSchema = createInsertDevisTemporaireSchema({
  texte: "Texte obligatoire",
});

export type InsertDevisTemporaireType = z.infer<
  typeof insertDevisTemporaireSchema
>;

export const selectDevisSchema = createSelectSchema(devis);
export type SelectDevisType = z.infer<typeof selectDevisSchema>;

export const insertDevisSchema = createInsertSchema(devis, {
  margeCoefficient: z.coerce.string(), // numeric en DB retourne string, mais on accepte number aussi
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true, //ajouté côté serveur
  updatedById: true, //ajouté côté serveur
  clientId: true, //ajouté côté serveur
});
export type InsertDevisType = z.infer<typeof insertDevisSchema>;

export const insertDevisToDbSchema = insertDevisSchema.extend({
  clientId: z.number().positive(),
});

export const updateDevisSchema = createUpdateSchema(devis)
  .omit({
    createdAt: true,
    updatedAt: true,
    createdById: true, //ne peut pas être mis à jour
    updatedById: true, //ajouté côté serveur
    clientId: true, //ne peut pas être mis à jour
  })
  .extend({
    id: z.number().positive("ID du devis invalide"),
  });
export type UpdateDevisType = z.infer<typeof updateDevisSchema>;

export const updateDevisInDbSchema = updateDevisSchema
  .extend({
    updatedById: z
      .string()
      .min(1, "ID de l'utilisateur modificateur obligatoire"),
  })
  .omit({
    id: true, //on ne met pas à jour l'id dans le parse
  });
export type UpdateDevisInDbType = z.infer<typeof updateDevisInDbSchema>;

export const saveProgressSchema = z.object({
  prospect: insertProspectSchema,
  texte: insertDevisTemporaireSchema.shape.texte,
});
export type SaveProgressType = z.infer<typeof saveProgressSchema>;

//============================= QUERY ==============================//

export const SORTABLE_DEVIS_COLUMNS = {
  id: devis.id,
  fournisseurId: devis.fournisseurId,
  siteId: devis.siteId,
  titre: devis.titre,
  typePrix: devis.typePrix,
  totalOneShotHt: devis.totalOneShotHt,
  totalMensuelHt: devis.totalMensuelHt,
  totalInstallationHt: devis.totalInstallationHt,
  dateValidite: devis.dateValidite,
  status: devis.status,
  signedAt: devis.signedAt,
  createdAt: devis.createdAt,
  updatedAt: devis.updatedAt,
} as const;

export const devisOrderBySchema = z.enum([
  "id",
  "fournisseurId",
  "siteId",
  "titre",
  "typePrix",
  "totalOneShotHt",
  "totalMensuelHt",
  "totalInstallationHt",
  "dateValidite",
  "status",
  "signedAt",
  "createdAt",
  "updatedAt",
]);

export type DevisSortableColumnType = z.infer<typeof devisOrderBySchema>;

const DEFAULT_ORDER_BY: DevisSortableColumnType = "createdAt";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "desc";

export const devisQueryBackendSchema = z.object({
  //filtres
  titre: z.string().optional(),
  status: devisStatusSchema.optional(),
  fournisseurId: z.number().int().positive().optional(),
  siteId: z.number().int().positive().optional(),
  typePrix: devisTypePrixSchema.optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  //tri
  orderBy: devisOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
});
export type DevisQueryBackendType = z.infer<typeof devisQueryBackendSchema>;

export const devisQueryFiltersSchema = z
  .object({
    titre: emptyStringToUndefinedOptional,
    status: devisStatusSchema.or(z.literal("all")).optional(),
    fournisseurId: emptyStringToUndefinedOptional
      .or(z.literal("all"))
      .optional(),
    siteId: emptyStringToUndefinedOptional.or(z.literal("all")).optional(),
    typePrix: devisTypePrixSchema.or(z.literal("all")).optional(),
    createdFrom: emptyStringToUndefinedOptional,
    createdTo: emptyStringToUndefinedOptional,
    validFrom: emptyStringToUndefinedOptional,
    validTo: emptyStringToUndefinedOptional,
  })
  .partial();
export type DevisQueryFiltersType = z.infer<typeof devisQueryFiltersSchema>;

export const devisQueryFrontendSchema = devisQueryFiltersSchema.merge(
  createSortSchema(SORTABLE_DEVIS_COLUMNS, "createdAt"),
);
export type DevisQueryFrontendType = z.infer<typeof devisQueryFrontendSchema>;

//============================= ADMIN QUERY ==============================//

export const adminDevisQueryBackendSchema = devisQueryBackendSchema.extend({
  clientId: z.number().int().positive().optional(),
});
export type AdminDevisQueryBackendType = z.infer<
  typeof adminDevisQueryBackendSchema
>;

export const adminDevisQueryFiltersSchema = devisQueryFiltersSchema.extend({
  clientId: emptyStringToUndefinedOptional.or(z.literal("all")).optional(),
});
export type AdminDevisQueryFiltersType = z.infer<
  typeof adminDevisQueryFiltersSchema
>;

export const adminDevisQueryFrontendSchema = adminDevisQueryFiltersSchema.merge(
  createSortSchema(SORTABLE_DEVIS_COLUMNS, "createdAt"),
);
export type AdminDevisQueryFrontendType = z.infer<
  typeof adminDevisQueryFrontendSchema
>;

export function parseAdminDevisQuery(
  raw: RawSearchParams,
): AdminDevisQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = adminDevisQueryFrontendSchema.parse(normalized);

  const createdFrom =
    urlQuery.createdFrom && !Number.isNaN(Date.parse(urlQuery.createdFrom))
      ? new Date(urlQuery.createdFrom)
      : undefined;

  const createdTo =
    urlQuery.createdTo && !Number.isNaN(Date.parse(urlQuery.createdTo))
      ? new Date(urlQuery.createdTo)
      : undefined;

  const validFrom =
    urlQuery.validFrom && !Number.isNaN(Date.parse(urlQuery.validFrom))
      ? new Date(urlQuery.validFrom)
      : undefined;

  const validTo =
    urlQuery.validTo && !Number.isNaN(Date.parse(urlQuery.validTo))
      ? new Date(urlQuery.validTo)
      : undefined;

  const titre =
    urlQuery.titre && urlQuery.titre.trim().length > 0
      ? urlQuery.titre.trim()
      : undefined;

  const status =
    urlQuery.status && urlQuery.status !== "all" ? urlQuery.status : undefined;

  const typePrix =
    urlQuery.typePrix && urlQuery.typePrix !== "all"
      ? urlQuery.typePrix
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

  const clientId =
    urlQuery.clientId &&
    !Number.isNaN(Number(urlQuery.clientId)) &&
    urlQuery.clientId !== "all"
      ? Number(urlQuery.clientId)
      : undefined;

  const orderBy =
    urlQuery.orderBy &&
    Object.keys(SORTABLE_DEVIS_COLUMNS).includes(urlQuery.orderBy)
      ? (urlQuery.orderBy as DevisSortableColumnType)
      : DEFAULT_ORDER_BY;

  const orderDir =
    urlQuery.orderDir === "asc" || urlQuery.orderDir === "desc"
      ? urlQuery.orderDir
      : DEFAULT_ORDER_DIR;

  return adminDevisQueryBackendSchema.parse({
    clientId,
    titre,
    status,
    fournisseurId,
    siteId,
    typePrix,
    createdFrom,
    createdTo,
    validFrom,
    validTo,
    orderBy,
    orderDir,
  });
}

export function parseDevisQuery(raw: RawSearchParams): DevisQueryBackendType {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = devisQueryFrontendSchema.parse(normalized);
  //conversion vers types backend
  const createdFrom =
    urlQuery.createdFrom && !Number.isNaN(Date.parse(urlQuery.createdFrom))
      ? new Date(urlQuery.createdFrom)
      : undefined;

  const createdTo =
    urlQuery.createdTo && !Number.isNaN(Date.parse(urlQuery.createdTo))
      ? new Date(urlQuery.createdTo)
      : undefined;

  const validFrom =
    urlQuery.validFrom && !Number.isNaN(Date.parse(urlQuery.validFrom))
      ? new Date(urlQuery.validFrom)
      : undefined;

  const validTo =
    urlQuery.validTo && !Number.isNaN(Date.parse(urlQuery.validTo))
      ? new Date(urlQuery.validTo)
      : undefined;

  const titre =
    urlQuery.titre && urlQuery.titre.trim().length > 0
      ? urlQuery.titre.trim()
      : undefined;

  const status =
    urlQuery.status && urlQuery.status !== "all" ? urlQuery.status : undefined;

  const typePrix =
    urlQuery.typePrix && urlQuery.typePrix !== "all"
      ? urlQuery.typePrix
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

  const orderBy =
    urlQuery.orderBy &&
    Object.keys(SORTABLE_DEVIS_COLUMNS).includes(urlQuery.orderBy)
      ? (urlQuery.orderBy as DevisSortableColumnType)
      : DEFAULT_ORDER_BY;

  const orderDir =
    urlQuery.orderDir === "asc" || urlQuery.orderDir === "desc"
      ? urlQuery.orderDir
      : DEFAULT_ORDER_DIR;

  return devisQueryBackendSchema.parse({
    titre,
    status,
    fournisseurId,
    siteId,
    typePrix,
    createdFrom,
    createdTo,
    validFrom,
    validTo,
    orderBy,
    orderDir,
  });
}
