import { devis, devisDemandes, devisLignes } from "@/db/schema";
import { capitalizeFirstWord } from "@/zod-helpers/normalize";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  devisDemandeStatutSchema,
  devisLigneUniteSchema,
  devisPeriodeFacturationSchema,
  devisStatutSchema,
  devisTypePrixSchema,
} from "./enums";

// ============================= DEVIS ==============================//

export const selectDevisSchema = createSelectSchema(devis);
export type SelectDevisType = z.infer<typeof selectDevisSchema>;

export const insertDevisSchema = z.object({
  // Parties impliquées
  proprietaireEntrepriseId: z.uuid("Client obligatoire"),
  emetteurEntrepriseId: z.uuid("Émetteur obligatoire"),
  demandeurEntrepriseId: z.uuid("Demandeur obligatoire"),
  siteId: z.uuid("Site obligatoire"),
  // Relations optionnelles
  devisDemandeId: z.uuid().optional(),
  ticketId: z.uuid().optional(),
  // Contenu
  titre: z.string().min(1, "Titre obligatoire").max(255),
  description: z.string().optional(),
  noteInterne: z.string().optional(),
  remiseGlobaleHt: z.number().int().min(0).optional(),
  validTo: z.date().optional(),
});
export type InsertDevisType = z.infer<typeof insertDevisSchema>;

export const updateDevisSchema = insertDevisSchema
  .omit({
    proprietaireEntrepriseId: true,
    emetteurEntrepriseId: true,
    demandeurEntrepriseId: true,
  })
  .partial()
  .extend({
    id: z.uuid("ID du devis invalide"),
  });
export type UpdateDevisType = z.infer<typeof updateDevisSchema>;

// ============================= DEVIS LIGNES ==============================//

export const selectDevisLigneSchema = createSelectSchema(devisLignes);
export type SelectDevisLigneType = z.infer<typeof selectDevisLigneSchema>;

export const insertDevisLigneSchema = z.object({
  devisId: z.uuid("ID du devis obligatoire"),
  serviceId: z.uuid().optional(),
  designation: z.string().min(1, "Désignation obligatoire").max(255),
  description: z.string().optional(),
  quantite: z.string().min(1, "Quantité obligatoire"), // string pour l'input, converti côté serveur
  unite: devisLigneUniteSchema,
  prixUnitaireHt: z.number().int().min(0, "Prix invalide"), // en centimes
  tauxTva: z.number().int().min(0).optional(), // 2000 = 20%
  remiseHtMontant: z.number().int().min(0).optional(), // en centimes
  typePrix: devisTypePrixSchema,
  periodeFacturation: devisPeriodeFacturationSchema.optional(),
  ordre: z.number().int().min(0),
});
export type InsertDevisLigneType = z.infer<typeof insertDevisLigneSchema>;

export const updateDevisLigneSchema = insertDevisLigneSchema
  .omit({ devisId: true })
  .partial()
  .extend({
    id: z.uuid("ID de la ligne invalide"),
  });
export type UpdateDevisLigneType = z.infer<typeof updateDevisLigneSchema>;

export const reorderDevisLignesSchema = z.object({
  devisId: z.uuid(),
  orderedIds: z.array(z.uuid()).min(1),
});
export type ReorderDevisLignesType = z.infer<typeof reorderDevisLignesSchema>;

// ============================= TRANSITIONS ==============================//

export const emettreDevisSchema = z.object({
  devisId: z.uuid("ID du devis invalide"),
});
export type EmettreDevisType = z.infer<typeof emettreDevisSchema>;

export const signerDevisSchema = z.object({
  devisId: z.uuid("ID du devis invalide"),
});
export type SignerDevisType = z.infer<typeof signerDevisSchema>;

export const refuserDevisSchema = z.object({
  devisId: z.uuid("ID du devis invalide"),
  motifRefus: z.string().optional(),
});
export type RefuserDevisType = z.infer<typeof refuserDevisSchema>;

// ============================= SAVE COMBINED (create or update) ==============================//

const saveDevisLigneSchema = z.object({
  serviceId: z.uuid().optional(),
  designation: z.string().min(1, "Désignation obligatoire").max(255),
  description: z.string().optional(),
  quantite: z.string().min(1, "Quantité obligatoire"),
  unite: devisLigneUniteSchema,
  prixUnitaireHt: z.number().int().min(0, "Prix invalide"), // centimes
  tauxTva: z.number().int().min(0), // x100 (ex: 2000 = 20%)
  remiseHtMontant: z.number().int().min(0), // centimes
  typePrix: devisTypePrixSchema,
  periodeFacturation: devisPeriodeFacturationSchema.optional(),
  ordre: z.number().int().min(0),
});
export type SaveDevisLigneType = z.infer<typeof saveDevisLigneSchema>;

export const saveDevisWithLignesSchema = z.object({
  id: z.uuid().optional(), // omit for create, provide for update
  proprietaireEntrepriseId: z.uuid("Client obligatoire"),
  emetteurEntrepriseId: z.uuid("Émetteur obligatoire"),
  demandeurEntrepriseId: z.uuid("Demandeur obligatoire"),
  siteId: z.uuid("Site obligatoire"),
  devisDemandeId: z.uuid().optional(),
  ticketId: z.uuid().optional(),
  titre: z.string().min(1, "Titre obligatoire").max(255),
  description: z.string().optional(),
  noteInterne: z.string().optional(),
  dateEmission: z.date().optional(),
  remiseGlobaleHt: z.number().int().min(0).optional(),
  validTo: z.date().optional(),
  lignes: z.array(saveDevisLigneSchema),
});
export type SaveDevisWithLignesType = z.infer<typeof saveDevisWithLignesSchema>;

// ============================= FORM — NOUVEAU DEVIS ==============================//
// Schéma RHF (champs string pour les inputs) — distinct des schemas DB ci-dessus

export const devisNouveauLigneSchema = z
  .object({
    serviceId: z.string().optional(),
    designation: z
      .string()
      .min(1, "Désignation obligatoire")
      .max(255)
      .transform(capitalizeFirstWord),
    description: z.string(),
    quantite: z.string().min(1, "Quantité obligatoire"),
    unite: z.string().min(1, "Unité obligatoire"),
    prixUnitaireHtEur: z.string().min(1, "Prix obligatoire"),
    tauxTva: z.string(),
    hasRemise: z.boolean(),
    remiseHtMontantEur: z.string(),
    typePrix: devisTypePrixSchema,
    periodeFacturation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typePrix === "abonnement" && !data.periodeFacturation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Période obligatoire",
        path: ["periodeFacturation"],
      });
    }
  });

export const devisNouveauSchema = z.object({
  proprietaireEntrepriseId: z.string().min(1, "Client obligatoire"),
  siteId: z.string().min(1, "Site obligatoire"),
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform(capitalizeFirstWord),
  dateEmission: z.string(),
  validTo: z.string(),
  lignes: z.array(devisNouveauLigneSchema).min(1),
  remiseGlobaleHtEur: z.string(),
  description: z.string(),
  noteInterne: z.string(),
});

export type DevisNouveauFormType = z.infer<typeof devisNouveauSchema>;

// ============================= FORM — EDIT DEVIS ==============================//
// Réutilise devisNouveauLigneSchema pour les lignes (mêmes champs string pour les inputs)

export const devisEditSchema = z.object({
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform(capitalizeFirstWord),
  validTo: z.string(),
  description: z.string(),
  noteInterne: z.string(),
  remiseGlobaleHtEur: z.string(),
  lignes: z.array(devisNouveauLigneSchema).min(1, "Ajoutez au moins une ligne"),
});

export type DevisEditFormType = z.infer<typeof devisEditSchema>;

// ============================= DEVIS DEMANDES ==============================//

export const selectDevisDemandeSchema = createSelectSchema(devisDemandes);
export type SelectDevisDemandeType = z.infer<typeof selectDevisDemandeSchema>;

export const devisDemandeAttachmentSchema = z.object({
  storageKey: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().min(0),
  previewUrl: z.string().optional(),
});
export type DevisDemandeAttachmentType = z.infer<
  typeof devisDemandeAttachmentSchema
>;

export const insertDevisDemandeFormSchema = z.object({
  siteId: z.string().min(1, "Site obligatoire"),
  serviceId: z.string().min(1, "Service obligatoire"),
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform(capitalizeFirstWord),
  description: z.string().min(1, "Description obligatoire"),
  attachments: z.array(devisDemandeAttachmentSchema).optional(),
});
export type InsertDevisDemandeFormType = z.infer<
  typeof insertDevisDemandeFormSchema
>;

export const updateDevisDemandeFormSchema = insertDevisDemandeFormSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID obligatoire"),
  });
export type UpdateDevisDemandeFormType = z.infer<
  typeof updateDevisDemandeFormSchema
>;

export const updateDevisDemandeStatutSchema = z.object({
  id: z.string().min(1, "ID obligatoire"),
  statut: devisDemandeStatutSchema,
});
export type UpdateDevisDemandeStatutType = z.infer<
  typeof updateDevisDemandeStatutSchema
>;

export const deleteDevisDemandeSchema = z.object({
  id: z.string().min(1, "ID obligatoire"),
});
export type DeleteDevisDemandeType = z.infer<typeof deleteDevisDemandeSchema>;

export const devisDemandeQuerySchema = z.object({
  entrepriseId: z.string().min(1),
  statut: devisDemandeStatutSchema.optional(),
  siteId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z
    .enum(["createdAt", "titre", "statut", "updatedAt", "siteNom", "serviceNom"])
    .default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type DevisDemandeQueryType = z.infer<typeof devisDemandeQuerySchema>;

// ============================= QUERY ==============================//

export const devisQuerySchema = z.object({
  entrepriseId: z.uuid(),
  statut: devisStatutSchema.optional(),
  siteId: z.uuid().optional(),
  search: z.string().optional(),
  orderBy: z
    .enum([
      "createdAt",
      "dateEmission",
      "numero",
      "titre",
      "statut",
      "validTo",
      "siteNom",
      "emetteurEntrepriseNom",
      "proprietaireEntrepriseNom",
    ])
    .default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type DevisQueryType = z.infer<typeof devisQuerySchema>;
