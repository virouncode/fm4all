import { capitalizeWords } from "@/zod-helpers/normalize";
import { phoneNumberSchemaEmpty } from "@/zod-schemas/phone.schema";
import { z } from "zod";

/**
 * Schema pour inviterContactAction
 */
export const inviterContactSchema = z.object({
  contactId: z.uuid("ID contact invalide"),
  entrepriseId: z.uuid("ID entreprise invalide"),
});

export type InviterContactType = z.infer<typeof inviterContactSchema>;

/**
 * Schema pour le formulaire RHF (page publique /auth/inscription)
 * prenom/nom/phone/fonction sont modifiables, email en lecture seule
 */
export const inscriptionContactFormSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  fonction: z.string().optional(),
});

export type InscriptionContactFormType = z.infer<
  typeof inscriptionContactFormSchema
>;

/**
 * Schema pour accepterInvitationContactAction
 * Transforms: capitalizeWords sur prenom/nom
 */
export const accepterInvitationContactSchema = z.object({
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
  fonction: z.string().optional(),
});

export type AccepterInvitationContactType = z.infer<
  typeof accepterInvitationContactSchema
>;
