import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { prospects } from "@/db/schema";
import { emptyStringToUndefinedOptional } from "@/normalize/emptyStringToUndefined";
import {
  normalizeSearchParams,
  RawSearchParams,
} from "@/normalize/normalizeSearchParams";
import { createSortSchema } from "@/zod-helpers/createSortSchema";
import { capitalizeWords, lower, upper } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { codePostalSchema } from "./codePostal.schema";
import { typeBatimentEnum, typeOccupationEnum } from "@/db/schema";

const typeBatimentSchema = z.enum(typeBatimentEnum.enumValues);
const typeOccupationSchema = z.enum(typeOccupationEnum.enumValues);
import { phoneNumberSchema } from "./phone.schema";
import { siretSchemaEmpty } from "./siret.schema";

export const selectProspectSchema = createSelectSchema(prospects);
export type SelectProspectType = z.infer<typeof selectProspectSchema>;

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProspectType = z.infer<typeof insertProspectSchema>;

export const updateProspectSchema = createUpdateSchema(prospects)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.uuid("ID du prospect invalide"),
  });
export type UpdateProspectType = z.infer<typeof updateProspectSchema>;

//======================= FORM SCHEMAS ==========================//
//On ne peut pas appliquer des transform de type mais on peut appliquer des transform de nettoyage

export const createInsertProspectFormSchema = (
  messages: Record<string, string>,
) =>
  z.object({
    nomEntreprise: z
      .string()
      .min(1, messages.nomEntreprise)
      .transform((v) => upper(v)),
    prenomContact: z
      .string()
      .min(1, messages.prenomContact)
      .transform((v) => capitalizeWords(v)),
    nomContact: z
      .string()
      .min(1, messages.nomContact)
      .transform((v) => capitalizeWords(v)),
    posteContact: z.string().min(1, messages.posteContact),
    emailContact: z
      .email(messages.emailContactInvalide)
      .min(1, messages.emailContactObligatoire)
      .transform((v) => lower(v)),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    surface: z
      .string()
      .refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
        messages.surface,
      ),
    effectif: z
      .string()
      .refine(
        (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 300,
        messages.effectif,
      ),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    codePostal: codePostalSchema(messages.codePostal),
    ville: z
      .string()
      .min(1, messages.ville)
      .transform((v) => capitalizeWords(v)),
    siret: siretSchemaEmpty(messages.siret).optional(),
    prenomSignataire: z
      .string()
      .transform((v) => capitalizeWords(v))
      .optional(),
    nomSignataire: z
      .string()
      .transform((v) => capitalizeWords(v))
      .optional(),
    posteSignataire: z.string().optional(),
    emailSignataire: z
      .email(messages.emailSignataireInvalide)
      .or(z.literal(""))
      .transform((v) => v.toLowerCase())
      .optional(),
    adresseLigne1: z
      .string()
      .transform((v) => capitalizeWords(v))
      .optional(),
    adresseLigne2: z
      .string()
      .transform((v) => capitalizeWords(v))
      .optional(),
    dateDeDemarrage: z.string().optional(),
    commentaires: z.string().optional(),
  });

export const insertProspectFormSchema = createInsertProspectFormSchema({
  nomEntreprise: "Nom de l'entreprise obligatoire",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  posteContact: "Poste du contact obligatoire",
  emailContactInvalide: "Adresse email invalide",
  emailContactObligatoire: "Adresse email obligatoire",
  phoneContact: "Numéro de téléphone invalide",
  surface: "La surface doit être un nombre entre 50 et 3000 m²",
  effectif: "L'effectif doit être un nombre entre 1 et 300 personnes",
  codePostal: "Code postal invalide (5 chiffres requis)",
  ville: "Ville obligatoire",
});

export type InsertProspectFormType = z.infer<typeof insertProspectFormSchema>;

export const createUpdateProspectFormSchema = (
  messages: Record<string, string>,
) =>
  z.object({
    nomEntreprise: z
      .string()
      .min(1, messages.nomEntreprise)
      .transform((v) => upper(v)),
    prenomContact: z
      .string()
      .min(1, messages.prenomContact)
      .transform((v) => capitalizeWords(v)),
    nomContact: z
      .string()
      .min(1, messages.nomContact)
      .transform((v) => capitalizeWords(v)),
    posteContact: z.string().min(1, messages.posteContact),
    emailContact: z
      .email(messages.emailContactInvalide)
      .min(1, messages.emailContactObligatoire)
      .transform((v) => v.toLowerCase()),
    phoneContact: phoneNumberSchema(messages.phoneContact),
    codePostal: codePostalSchema(messages.codePostal),
    ville: z
      .string()
      .min(1, messages.ville)
      .transform((v) => capitalizeWords(v)),
    siret: siretSchemaEmpty(messages.siret),
    prenomSignataire: z.string().transform((v) => capitalizeWords(v)),
    nomSignataire: z.string().transform((v) => capitalizeWords(v)),
    posteSignataire: z.string(),
    emailSignataire: z
      .email(messages.emailSignataireInvalide)
      .or(z.literal(""))
      .transform((v) => v.toLowerCase()),
    adresseLigne1: z.string().transform((v) => capitalizeWords(v)),
    adresseLigne2: z.string().transform((v) => capitalizeWords(v)),
    dateDeDemarrage: z.string(),
    commentaires: z.string(),
  });

export const updateProspectFormSchema = createUpdateProspectFormSchema({
  nomEntreprise: "Nom de l'entreprise obligatoire",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  posteContact: "Poste du contact obligatoire",
  emailContactInvalide: "Adresse email invalide",
  emailContactObligatoire: "Adresse email obligatoire",
  phoneContact: "Numéro de téléphone invalide",
  codePostal: "Code postal invalide (5 chiffres requis)",
  ville: "Ville obligatoire",
  siret: "SIRET invalide",
  emailSignataireInvalide: "Adresse email invalide",
});

export type UpdateProspectFormType = z.infer<typeof updateProspectFormSchema>;

//======================= QUERY SCHEMAS ==========================//

export const SORTABLE_PROSPECTS_COLUMNS = {
  id: prospects.id,
  nomEntreprise: prospects.nomEntreprise,
  siret: prospects.siret,
  prenomContact: prospects.prenomContact,
  nomContact: prospects.nomContact,
  emailContact: prospects.emailContact,
  phoneContact: prospects.phoneContact,
  prenomSignataire: prospects.prenomSignataire,
  nomSignataire: prospects.nomSignataire,
  emailSignataire: prospects.emailSignataire,
  codePostal: prospects.codePostal,
  ville: prospects.ville,
  dateDeDemarrage: prospects.dateDeDemarrage,
  createdAt: prospects.createdAt,
  updatedAt: prospects.updatedAt,
} as const;

export const prospectsOrderBySchema = z.enum([
  "id",
  "nomEntreprise",
  "siret",
  "prenomContact",
  "nomContact",
  "emailContact",
  "phoneContact",
  "prenomSignataire",
  "nomSignataire",
  "emailSignataire",
  "codePostal",
  "ville",
  "dateDeDemarrage",
  "createdAt",
  "updatedAt",
]);
export type ProspectsSortableColumnType = z.infer<
  typeof prospectsOrderBySchema
>;

const DEFAULT_ORDER_BY = "createdAt";
const DEFAULT_ORDER_DIR: "asc" | "desc" = "desc";

export const prospectsQueryBackendSchema = z.object({
  //filtres
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  nomEntreprise: z.string().optional(),
  siret: z.string().optional(),
  nomContact: z.string().optional(),
  emailContact: z.string().optional(),
  phoneContact: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  //tri
  orderBy: prospectsOrderBySchema.default(DEFAULT_ORDER_BY),
  orderDir: z.enum(["asc", "desc"]).default(DEFAULT_ORDER_DIR),
  //pagination
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
});
export type ProspectsQueryBackendType = z.infer<
  typeof prospectsQueryBackendSchema
>;

export const prospectsQueryFiltersSchema = z
  .object({
    createdFrom: emptyStringToUndefinedOptional,
    createdTo: emptyStringToUndefinedOptional,
    nomEntreprise: emptyStringToUndefinedOptional,
    siret: emptyStringToUndefinedOptional,
    nomContact: emptyStringToUndefinedOptional,
    emailContact: emptyStringToUndefinedOptional,
    phoneContact: emptyStringToUndefinedOptional,
    codePostal: emptyStringToUndefinedOptional,
    ville: emptyStringToUndefinedOptional,
  })
  .partial();

export type ProspectsQueryFiltersType = z.infer<
  typeof prospectsQueryFiltersSchema
>;

export const prospectsQueryFrontendSchema = prospectsQueryFiltersSchema.extend(
  createSortSchema(SORTABLE_PROSPECTS_COLUMNS, "createdAt").shape, // orderBy, orderDir
);

export type ProspectsQueryFrontendType = z.infer<
  typeof prospectsQueryFrontendSchema
>;

export function parseProspectsQuery(raw: RawSearchParams) {
  const normalized = normalizeSearchParams(raw);
  const urlQuery = prospectsQueryFrontendSchema.parse(normalized);

  const createdFrom =
    urlQuery.createdFrom && !Number.isNaN(Date.parse(urlQuery.createdFrom))
      ? new Date(urlQuery.createdFrom)
      : undefined;

  const createdTo =
    urlQuery.createdTo && !Number.isNaN(Date.parse(urlQuery.createdTo))
      ? new Date(urlQuery.createdTo)
      : undefined;

  const nomEntreprise = urlQuery.nomEntreprise ?? undefined;
  const siret = urlQuery.siret ?? undefined;
  const nomContact = urlQuery.nomContact ?? undefined;
  const emailContact = urlQuery.emailContact ?? undefined;
  const phoneContact = urlQuery.phoneContact ?? undefined;
  const codePostal = urlQuery.codePostal ?? undefined;
  const ville = urlQuery.ville ?? undefined;

  return prospectsQueryBackendSchema.parse({
    createdFrom,
    createdTo,
    nomEntreprise,
    siret,
    nomContact,
    emailContact,
    phoneContact,
    codePostal,
    ville,
    orderBy: urlQuery.orderBy,
    orderDir: urlQuery.orderDir,
  });
}
