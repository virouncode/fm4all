import { prospects } from "@/db/schema";
import { capitalizeWords } from "@/zod-helpers/normalize";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { typeBatimentSchema, typeOccupationSchema } from "./client";
import { codePostalSchema } from "./codePostal";
import { phoneNumberSchema } from "./phone";
import { siretSchemaEmpty } from "./siret";

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
    id: z.number().positive("ID du prospect invalide"),
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
      .transform((v) => capitalizeWords(v)),
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

const insertProspectFormSchema = createInsertProspectFormSchema({
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
      .transform((v) => capitalizeWords(v)),
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
