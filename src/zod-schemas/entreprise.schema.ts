import { roleEntrepriseCodes } from "@/constants/codeTables";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import { phoneNumberSchemaEmpty } from "@/zod-schemas/phone.schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { entrepriseContacts, entrepriseRoles, entreprises } from "../db/schema";

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
 * Les champs SIRENE (nom, adresse, formeJuridique, numeroTva) sont pré-remplis
 * depuis l'API SIRENE et affichés en lecture seule dans le formulaire.
 */
export const insertEntrepriseStep1Schema = z
  .object({
    // Champs SIRENE — pré-remplis et non-éditables dans le formulaire
    nom: z.string().min(1, "Nom de l'entreprise obligatoire"),
    siret: z
      .string()
      .min(1, "Le SIRET est obligatoire")
      .refine(isValidSIRET, "Le SIRET est invalide"),
    adresseLigne1: z.string().optional(),
    adresseLigne2: z.string().optional(),
    codePostal: z.string().optional(),
    ville: z.string().optional(),
    formeJuridique: z.string().optional(),
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
  // nom est immuable (source SIRENE) — non modifiable via ce schema
  siret: z
    .string()
    .min(1, "Le SIRET est obligatoire")
    .refine(isValidSIRET, "Le SIRET est invalide"),
  adresseLigne2: z.string().optional(),
  numeroTva: numeroTvaSchema,
});
export type UpdateEntrepriseInfosType = z.infer<
  typeof updateEntrepriseInfosSchema
>;

// Schema pour la mise à jour des champs SIRENE (super_admin_plateforme uniquement)
export const updateEntrepriseSireneFieldsSchema = z.object({
  entrepriseId: z.uuid(),
  nom: z.string().min(1, "Nom de l'entreprise obligatoire"),
  adresseLigne1: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: numeroTvaSchema,
});
export type UpdateEntrepriseSireneFieldsType = z.infer<
  typeof updateEntrepriseSireneFieldsSchema
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
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  formeJuridique: string | null;
  sireneSyncedAt: Date | null;
  logoId: string | null;
  logoStorageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: RoleEntrepriseType[];
  nbSites: number;
  hasActiveAdmin: boolean;
  adminEmail: string | null;
  services: Array<{ id: string; nom: string }>;
  pendingInvitation: { email: string; sentAt: Date } | null;
  // Relation client↔prestataire (présent uniquement dans les vues mes-prestataires / mes-clients)
  relationId: string | null;
};

// ==================== ENTREPRISE CONTACTS ====================

export const entrepriseContactSelectSchema = createSelectSchema(entrepriseContacts);
export type EntrepriseContactSelectType = z.infer<typeof entrepriseContactSelectSchema>;

export const insertEntrepriseContactSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  prenom: z.string().min(1, "Prénom obligatoire"),
  nom: z.string().min(1, "Nom obligatoire"),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  fonction: z.string().optional(),
  notes: z.string().optional(),
  userId: z.uuid().optional(),
});
export type InsertEntrepriseContactType = z.infer<typeof insertEntrepriseContactSchema>;

export const updateEntrepriseContactSchema = z.object({
  contactId: z.uuid("ID du contact invalide"),
  prenom: z.string().min(1, "Prénom obligatoire"),
  nom: z.string().min(1, "Nom obligatoire"),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  fonction: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateEntrepriseContactType = z.infer<typeof updateEntrepriseContactSchema>;

// ==================== RELATION CONTACTS ====================

export const insertRelationContactSchema = z.object({
  relationId: z.uuid("ID de relation invalide"),
  contactId: z.uuid("ID du contact invalide"),
  side: z.enum(["client", "prestataire"]),
  role: z.string().optional(),
  estPrincipal: z.boolean().default(false),
});
export type InsertRelationContactType = z.infer<typeof insertRelationContactSchema>;

export const updateRelationContactSchema = z.object({
  linkId: z.uuid("ID du lien invalide"),
  role: z.string().optional(),
  estPrincipal: z.boolean(),
});
export type UpdateRelationContactType = z.infer<typeof updateRelationContactSchema>;

export const insertEntrepriseContactAndLinkToRelationSchema = z.object({
  relationId: z.uuid("ID de relation invalide"),
  targetEntrepriseId: z.uuid("ID entreprise invalide"),
  side: z.enum(["client", "prestataire"]),
  role: z.string().optional(),
  estPrincipal: z.boolean().default(false),
  prenom: z.string().min(1, "Prénom obligatoire"),
  nom: z.string().min(1, "Nom obligatoire"),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  fonction: z.string().optional(),
  notes: z.string().optional(),
});
export type InsertEntrepriseContactAndLinkToRelationType = z.infer<
  typeof insertEntrepriseContactAndLinkToRelationSchema
>;

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
