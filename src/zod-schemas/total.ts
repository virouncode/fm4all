import { z } from "zod";

export const totalNettoyageSchema = z.object({
  totalService: z.number().default(0),
  totalRepasse: z.number().default(0),
  totalSamedi: z.number().default(0),
  totalDimanche: z.number().default(0),
  totalVitrerie: z.number().default(0),
});
export const totalHygieneSchema = z.object({
  totalTrilogie: z.number().default(0),
  totalDesinfectant: z.number().default(0),
  totalParfum: z.number().default(0),
  totalBalai: z.number().default(0),
  totalPoubelle: z.number().default(0),
  totalInstallation: z.number().default(0),
});
export const totalMaintenanceSchema = z.object({
  totalService: z.number().default(0),
  totalQ18: z.number().default(0),
  totalLegio: z.number().default(0),
  totalQualiteAir: z.number().default(0),
});
export const totalIncendieSchema = z.object({
  totalService: z.number().default(0),
});
export const totalCafeSchema = z.object({
  totalMachines: z
    .array(
      z.object({
        lotId: z.number(),
        total: z.number().default(0),
        totalInstallation: z.number().default(0),
      })
    )
    .default([]),
});
export const totalTheSchema = z.object({
  totalService: z.number().default(0),
});
export const totalSnacksFruitsSchema = z.object({
  totalFruits: z.number().default(0),
  totalSnacks: z.number().default(0),
  totalBoissons: z.number().default(0),
  totalLivraison: z.number().default(0),
  total: z.number().default(0),
});

export const totalOfficeManager = z.object({
  totalService: z.number().default(0),
});

export const totalServicesFm4AllSchema = z.object({
  totalAssurance: z.number().default(0),
  totalPlateforme: z.number().default(0),
  totalSupportAdmin: z.number().default(0),
  totalSupportOp: z.number().default(0),
  totalAccountManager: z.number().default(0),
  totalRemiseCa: z.number().default(0),
  totalRemiseHof: z.number().default(0),
});

export type TotalNettoyageType = z.infer<typeof totalNettoyageSchema>;
export type TotalHygieneType = z.infer<typeof totalHygieneSchema>;
export type TotalIncendieType = z.infer<typeof totalIncendieSchema>;
export type TotalMaintenanceType = z.infer<typeof totalMaintenanceSchema>;
export type TotalCafeType = z.infer<typeof totalCafeSchema>;
export type TotalTheType = z.infer<typeof totalTheSchema>;
export type TotalSnacksFruitsType = z.infer<typeof totalSnacksFruitsSchema>;
export type TotalOfficeManagerType = z.infer<typeof totalOfficeManager>;
export type TotalServicesFm4AllType = z.infer<typeof totalServicesFm4AllSchema>;
