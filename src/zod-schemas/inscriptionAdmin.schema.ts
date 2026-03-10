import { capitalizeWords, lower } from "@/zod-helpers/normalize";
import { phoneNumberSchemaEmpty } from "@/zod-schemas/phone.schema";
import { z } from "zod";

/**
 * Schema pour le formulaire RHF (client) — sans transforms sur prenom/nom
 * car RHF attend des strings pures en entrée.
 * Pas d'avatar : l'upload S3 requiert une session authentifiée, ce qui n'est
 * pas le cas sur cette page publique. L'utilisateur peut ajouter sa photo
 * depuis ses paramètres après connexion.
 */
export const inscriptionAdminFormSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
});

export type InscriptionAdminFormType = z.infer<
  typeof inscriptionAdminFormSchema
>;

/**
 * Schema pour inviterEntrepriseAdminAction
 * Email normalisé en lowercase pour cohérence avec Better Auth
 */
export const inviterEntrepriseAdminSchema = z.object({
  entrepriseId: z.uuid("ID entreprise invalide"),
  email: z
    .string()
    .email("Email invalide")
    .transform((v) => lower(v)),
});

export type InviterEntrepriseAdminType = z.infer<
  typeof inviterEntrepriseAdminSchema
>;

/**
 * Schema pour accepterInvitationAdminAction
 * Transforms: lowercase email implicite (stocké depuis invitation), capitalizeWords prenom/nom
 */
export const accepterInvitationAdminSchema = z.object({
  token: z.string().min(1, "Token invalide"),
  prenom: z
    .string()
    .min(1, "Le prénom est requis")
    .transform((v) => capitalizeWords(v)),
  nom: z
    .string()
    .min(1, "Le nom est requis")
    .transform((v) => capitalizeWords(v)),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
});

export type AccepterInvitationAdminType = z.infer<
  typeof accepterInvitationAdminSchema
>;
