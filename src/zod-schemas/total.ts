import { z } from "zod";

export const totalNettoyageSchema = z.object({
  totalService: z.number().nullable(),
  totalRepasse: z.number().nullable(),
  totalSamedi: z.number().nullable(),
  totalDimanche: z.number().nullable(),
  totalVitrerie: z.number().nullable(),
});
export const totalHygieneSchema = z.object({
  totalTrilogie: z.number().nullable(),
  totalDesinfectant: z.number().nullable(),
  totalParfum: z.number().nullable(),
  totalBalai: z.number().nullable(),
  totalPoubelle: z.number().nullable(),
  totalInstallation: z.number().nullable(),
});
export const totalMaintenanceSchema = z.object({
  totalService: z.number().nullable(),
  totalQ18: z.number().nullable(),
  totalLegio: z.number().nullable(),
  totalQualiteAir: z.number().nullable(),
});
export const totalIncendieSchema = z.object({
  totalService: z.number().nullable(),
});
export const totalCafeSchema = z.object({
  totalMachines: z
    .array(
      z.object({
        lotId: z.number(),
        total: z.number().nullable(),
        totalInstallation: z.number().nullable(),
      })
    )
    .default([]),
});
export const totalTheSchema = z.object({
  totalService: z.number().nullable(),
});
export const totalSnacksFruitsSchema = z.object({
  totalFruits: z.number().nullable(),
  totalSnacks: z.number().nullable(),
  totalBoissons: z.number().nullable(),
  totalLivraison: z.number().nullable(),
  total: z.number().nullable(),
});

export const totalOfficeManager = z.object({
  totalService: z.number().nullable(),
});

export const totalServicesFm4AllSchema = z.object({
  totalAssurance: z.number().nullable(),
  totalPlateforme: z.number().nullable(),
  totalSupportAdmin: z.number().nullable(),
  totalSupportOp: z.number().nullable(),
  totalAccountManager: z.number().nullable(),
  totalRemiseCa: z.number().nullable(),
  totalRemiseHof: z.number().nullable(),
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
