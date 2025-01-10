import { z } from "zod";

export const totalNettoyageSchema = z.object({
  nomFournisseur: z.string().nullable(),
  prixRepasse: z.number().nullable(),
  prixService: z.number().nullable(),
  prixSamedi: z.number().nullable(),
  prixDimanche: z.number().nullable(),
  prixVitrerie: z.number().nullable(),
});
export const totalHygieneSchema = z.object({
  nomFournisseur: z.string().nullable(),
  prixTrilogieAbonnement: z.number().nullable(),
  prixTrilogieAchat: z
    .object({
      prixAchat: z.number(),
      prixConsommables: z.number(),
    })
    .nullable(),
  prixDesinfectantAbonnement: z.number().nullable(),
  prixDesinfectantAchat: z
    .object({
      prixAchat: z.number(),
      prixConsommables: z.number(),
    })
    .nullable(),
  prixParfum: z.number().nullable(),
  prixBalai: z.number().nullable(),
  prixPoubelle: z.number().nullable(),
});
export const totalIncendieSchema = z.object({
  nomFournisseur: z.string().nullable(),
  prixIncendie: z.number().nullable(),
});
export const totalMaintenanceSchema = z.object({
  nomFournisseur: z.string().nullable(),
  prixMaintenance: z.number().nullable(),
});

export type TotalNettoyageType = z.infer<typeof totalNettoyageSchema>;
export type TotalHygieneType = z.infer<typeof totalHygieneSchema>;
export type TotalIncendieType = z.infer<typeof totalIncendieSchema>;
export type TotalMaintenanceType = z.infer<typeof totalMaintenanceSchema>;
