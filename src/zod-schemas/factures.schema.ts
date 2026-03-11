import { factureLignes, factures } from "@/db/schema";
import { capitalizeFirstWord } from "@/zod-helpers/normalize";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  factureLigneTypeSourceSchema,
  factureLigneUniteSchema,
  factureModeCommercialSnapshotSchema,
  factureStatutSchema,
} from "./enums";

// ============================= FACTURES ==============================//

export const selectFactureSchema = createSelectSchema(factures);
export type SelectFactureType = z.infer<typeof selectFactureSchema>;

export const insertFactureSchema = z.object({
  // Parties impliquées
  emetteurEntrepriseId: z.uuid("Émetteur obligatoire"),
  destinataireEntrepriseId: z.uuid("Destinataire obligatoire"),
  proprietaireEntrepriseId: z.uuid("Propriétaire obligatoire"),
  // Relations optionnelles
  clientServiceId: z.uuid().optional(),
  ticketId: z.uuid().optional(),
  siteId: z.uuid().optional(),
  // Contenu
  titre: z.string().min(1, "Titre obligatoire").max(255),
  description: z.string().optional(),
  noteInterne: z.string().optional(),
  notesClient: z.string().optional(),
  // Dates optionnelles
  dateEcheance: z.date().optional(),
  periodeDebut: z.string().optional(), // date ISO YYYY-MM-DD
  periodeFin: z.string().optional(), // date ISO YYYY-MM-DD
  remiseGlobaleHt: z.number().int().min(0).optional(),
  genereeParOutil: z.boolean().optional(),
  modeCommercialSnapshot: factureModeCommercialSnapshotSchema.optional(),
});
export type InsertFactureType = z.infer<typeof insertFactureSchema>;

export const updateFactureSchema = insertFactureSchema
  .omit({
    emetteurEntrepriseId: true,
    destinataireEntrepriseId: true,
    proprietaireEntrepriseId: true,
  })
  .partial()
  .extend({
    id: z.uuid("ID de la facture invalide"),
  });
export type UpdateFactureType = z.infer<typeof updateFactureSchema>;

// ============================= FACTURE LIGNES ==============================//

export const selectFactureLigneSchema = createSelectSchema(factureLignes);
export type SelectFactureLigneType = z.infer<typeof selectFactureLigneSchema>;

export const insertFactureLigneSchema = z.object({
  factureId: z.uuid("ID de la facture obligatoire"),
  serviceId: z.uuid().optional(),
  designation: z.string().min(1, "Désignation obligatoire").max(255),
  description: z.string().optional(),
  quantite: z.string().min(1, "Quantité obligatoire"), // string pour l'input, converti côté serveur
  unite: factureLigneUniteSchema,
  prixUnitaireHt: z.number().int().min(0, "Prix invalide"), // en centimes
  tauxTva: z.number().int().min(0), // 2000 = 20%
  remiseHtMontant: z.number().int().min(0).optional(), // en centimes
  typeSource: factureLigneTypeSourceSchema.optional(), // défaut : "manuel"
  ordre: z.number().int().min(0),
});
export type InsertFactureLigneType = z.infer<typeof insertFactureLigneSchema>;

export const updateFactureLigneSchema = insertFactureLigneSchema
  .omit({ factureId: true })
  .partial()
  .extend({
    id: z.uuid("ID de la ligne invalide"),
  });
export type UpdateFactureLigneType = z.infer<typeof updateFactureLigneSchema>;

export const reorderFactureLignesSchema = z.object({
  factureId: z.uuid(),
  orderedIds: z.array(z.uuid()).min(1),
});
export type ReorderFactureLignesType = z.infer<
  typeof reorderFactureLignesSchema
>;

// ============================= TRANSITIONS ==============================//

export const emettreFactureSchema = z.object({
  factureId: z.uuid("ID de la facture invalide"),
});
export type EmettreFactureType = z.infer<typeof emettreFactureSchema>;

export const annulerFactureSchema = z.object({
  factureId: z.uuid("ID de la facture invalide"),
  motifAnnulation: z.string().optional(),
});
export type AnnulerFactureType = z.infer<typeof annulerFactureSchema>;

// ============================= SAVE COMBINED (create or update) ==============================//

const saveFactureLigneSchema = z.object({
  serviceId: z.uuid().optional(),
  designation: z.string().min(1, "Désignation obligatoire").max(255),
  description: z.string().optional(),
  quantite: z.string().min(1, "Quantité obligatoire"),
  unite: factureLigneUniteSchema,
  prixUnitaireHt: z.number().int().min(0, "Prix invalide"), // centimes
  tauxTva: z.number().int().min(0), // x100 (ex: 2000 = 20%)
  remiseHtMontant: z.number().int().min(0), // centimes
  typeSource: factureLigneTypeSourceSchema.optional(),
  ordre: z.number().int().min(0),
});
export type SaveFactureLigneType = z.infer<typeof saveFactureLigneSchema>;

export const saveFactureWithLignesSchema = z.object({
  id: z.uuid().optional(), // omit for create, provide for update
  emetteurEntrepriseId: z.uuid("Émetteur obligatoire"),
  destinataireEntrepriseId: z.uuid("Destinataire obligatoire"),
  proprietaireEntrepriseId: z.uuid("Propriétaire obligatoire"),
  clientServiceId: z.uuid().optional(),
  ticketId: z.uuid().optional(),
  siteId: z.uuid().optional(),
  titre: z.string().min(1, "Titre obligatoire").max(255),
  description: z.string().optional(),
  noteInterne: z.string().optional(),
  notesClient: z.string().optional(),
  dateEcheance: z.date().optional(),
  periodeDebut: z.string().optional(),
  periodeFin: z.string().optional(),
  remiseGlobaleHt: z.number().int().min(0).optional(),
  modeCommercialSnapshot: factureModeCommercialSnapshotSchema.optional(),
  lignes: z.array(saveFactureLigneSchema),
});
export type SaveFactureWithLignesType = z.infer<
  typeof saveFactureWithLignesSchema
>;

// ============================= FORM — NOUVELLE FACTURE ==============================//
// Schéma RHF (champs string pour les inputs) — distinct des schemas DB ci-dessus

export const factureNouvelleLigneSchema = z.object({
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
});
export type FactureNouvelleLigneType = z.infer<
  typeof factureNouvelleLigneSchema
>;

export const factureNouvelleSchema = z.object({
  emetteurEntrepriseId: z.string().min(1, "Émetteur obligatoire"),
  destinataireEntrepriseId: z.string().min(1, "Destinataire obligatoire"),
  proprietaireEntrepriseId: z.string().min(1, "Propriétaire obligatoire"),
  siteId: z.string().optional(),
  modeCommercialSnapshot: z.string().optional(),
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform(capitalizeFirstWord),
  description: z.string(),
  noteInterne: z.string(),
  notesClient: z.string(),
  dateEcheance: z.string(),
  periodeDebut: z.string(),
  periodeFin: z.string(),
  remiseGlobaleHtEur: z.string(),
  lignes: z.array(factureNouvelleLigneSchema).min(1, "Ajoutez au moins une ligne"),
});
export type FactureNouvelleFormType = z.infer<typeof factureNouvelleSchema>;

// ============================= FORM — EDIT FACTURE ==============================//

export const factureEditSchema = z.object({
  titre: z
    .string()
    .min(1, "Titre obligatoire")
    .max(255)
    .transform(capitalizeFirstWord),
  description: z.string(),
  noteInterne: z.string(),
  notesClient: z.string(),
  dateEcheance: z.string(),
  periodeDebut: z.string(),
  periodeFin: z.string(),
  remiseGlobaleHtEur: z.string(),
  lignes: z.array(factureNouvelleLigneSchema).min(1, "Ajoutez au moins une ligne"),
});
export type FactureEditFormType = z.infer<typeof factureEditSchema>;

// ============================= QUERY ==============================//

export const factureQuerySchema = z.object({
  entrepriseId: z.uuid(),
  tabType: z.enum(["emises", "recues"]).default("emises"),
  statut: factureStatutSchema.optional(),
  modeCommercialSnapshot: factureModeCommercialSnapshotSchema.optional(),
  siteId: z.uuid().optional(),
  clientId: z.string().optional(),
  emetteurId: z.string().optional(),
  serviceId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "dateEmission",
      "numero",
      "titre",
      "statut",
      "dateEcheance",
      "montantTtc",
      "siteNom",
      "emetteurEntrepriseNom",
      "destinataireEntrepriseNom",
    ])
    .default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type FactureQueryType = z.infer<typeof factureQuerySchema>;
