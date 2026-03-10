import { roleEntrepriseCodes } from "@/constants/codeTables";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import { phoneNumberSchemaEmpty } from "@/zod-schemas/phone.schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { entrepriseRoles, entreprises } from "../db/schema";

// Numéro de TVA français : FR + 2 chars [A-HJ-NP-Z0-9] (pas O ni I) + 9 chiffres
const FR_TVA_REGEX = /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/;

export const numeroTvaSchema = z
  .string()
  .regex(
    FR_TVA_REGEX,
    "Le numéro de TVA doit être au format FR + 2 caractères + 9 chiffres (ex: FR71941928640)",
  )
  .or(z.literal(""))
  .optional();

export const entrepriseSelectSchema = createSelectSchema(entreprises);
export type EntrepriseSelectType = z.infer<typeof entrepriseSelectSchema>;

export const roleEntrepriseSchema = z.enum(roleEntrepriseCodes);
export type RoleEntrepriseType = z.infer<typeof roleEntrepriseSchema>;

export const roleEntrepriseSelectSchema = createSelectSchema(entrepriseRoles);
export type RoleEntrepriseSelectType = z.infer<
  typeof roleEntrepriseSelectSchema
>;

// ==================== INSERT SCHEMAS ====================

/**
 * Step 1 — Informations entreprise
 */
export const insertEntrepriseStep1Schema = z
  .object({
    nom: z.string().min(1, "Nom de l'entreprise obligatoire"),
    siret: z
      .string()
      .min(1, "Le SIRET est obligatoire")
      .refine(isValidSIRET, "Le SIRET est invalide"),
    prenomContact: z.string().optional(),
    nomContact: z.string().optional(),
    // Accepte "" (vide) ou un email valide — normalisation "" → null faite dans l'action
    emailContact: z
      .string()
      .email("Email de contact invalide")
      .or(z.literal(""))
      .optional(),
    phoneContact: phoneNumberSchemaEmpty("Numéro de téléphone invalide"),
    numeroTva: numeroTvaSchema,
    roles: z
      .array(roleEntrepriseSchema)
      .min(1, "Au moins un rôle est obligatoire"),
    serviceIds: z.array(z.uuid()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.roles.includes("prestataire") &&
      (!data.serviceIds || data.serviceIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sélectionnez au moins un service pour ce prestataire",
        path: ["serviceIds"],
      });
    }
  });

export type InsertEntrepriseStep1Type = z.infer<
  typeof insertEntrepriseStep1Schema
>;

export const insertEntrepriseFormSchema = insertEntrepriseStep1Schema;

export type InsertEntrepriseFormType = z.infer<
  typeof insertEntrepriseFormSchema
>;

// ==================== UPDATE SCHEMAS ====================

export const updateEntrepriseInfosSchema = z.object({
  entrepriseId: z.uuid(),
  nom: z.string().min(1, "Nom de l'entreprise obligatoire"),
  siret: z
    .string()
    .min(1, "Le SIRET est obligatoire")
    .refine(isValidSIRET, "Le SIRET est invalide"),
  numeroTva: numeroTvaSchema,
});
export type UpdateEntrepriseInfosType = z.infer<
  typeof updateEntrepriseInfosSchema
>;

export const updateEntrepriseContactSchema = z.object({
  entrepriseId: z.uuid(),
  prenomContact: z.string().optional(),
  nomContact: z.string().optional(),
  emailContact: z
    .string()
    .email("Email de contact invalide")
    .or(z.literal(""))
    .optional(),
  phoneContact: phoneNumberSchemaEmpty(
    "Numéro de téléphone invalide",
  ).optional(),
});
export type UpdateEntrepriseContactType = z.infer<
  typeof updateEntrepriseContactSchema
>;

export const updateEntrepriseRolesSchema = z
  .object({
    entrepriseId: z.uuid(),
    roles: z
      .array(roleEntrepriseSchema)
      .min(1, "Au moins un rôle est obligatoire"),
    serviceIds: z.array(z.uuid()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.roles.includes("prestataire") &&
      (!data.serviceIds || data.serviceIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sélectionnez au moins un service pour ce prestataire",
        path: ["serviceIds"],
      });
    }
  });
export type UpdateEntrepriseRolesType = z.infer<
  typeof updateEntrepriseRolesSchema
>;

export const updateEntrepriseLogoSchema = z.object({
  entrepriseId: z.uuid(),
  logo: z.object({
    storageKey: z.string().min(1),
    filename: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number(),
    previewUrl: z.string().optional(),
  }),
});
export type UpdateEntrepriseLogoType = z.infer<
  typeof updateEntrepriseLogoSchema
>;

// ==================== DISPLAY TYPES ====================

/**
 * Type enrichi pour l'affichage dans la liste/grid
 * Inclut les rôles (array_agg) et le nb de sites (COUNT)
 */
export type EntrepriseWithDetails = {
  id: string;
  nom: string;
  siret: string;
  numeroTva: string | null;
  prenomContact: string | null;
  nomContact: string | null;
  emailContact: string | null;
  phoneContact: string | null;
  logoId: string | null;
  logoStorageKey: string | null;
  createdAt: Date;
  roles: RoleEntrepriseType[];
  nbSites: number;
  hasActiveAdmin: boolean;
  services: Array<{ id: string; nom: string }>;
  pendingInvitation: { email: string; sentAt: Date } | null;
};

// ==================== PROSPECT SCHEMA ====================

export type SelectProspectType = {
  id: string;
  nomEntreprise: string;
  siret: string | null;
  prenomContact: string;
  nomContact: string;
  emailContact: string;
  phoneContact: string;
  codePostal: string;
  ville: string;
  createdAt: Date;
};
