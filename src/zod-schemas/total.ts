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
  totalTrilogie: z.number().nullable(),
  totalExutoires: z.number().nullable(),
  totalExutoiresParking: z.number().nullable(),
  totalAlarmes: z.number().nullable(),
  totalPortesCoupeFeuBattantes: z.number().nullable(),
  totalPortesCoupeFeuCoulissantes: z.number().nullable(),
  totalRIA: z.number().nullable(),
  totalColonnesSechesStatiques: z.number().nullable(),
  totalColonnesSechesDynamiques: z.number().nullable(),
  totalDeplacementTrilogie: z.number().nullable(),
  totalDeplacementExutoires: z.number().nullable(),
  totalDeplacementExutoiresParking: z.number().nullable(),
});
export const totalCafeSchema = z.object({
  totalEspaces: z
    .array(
      z.object({
        espaceId: z.number(),
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
  totalSansRemise: z.number().nullable(),
});

export const totalFontainesSchema = z.object({
  totalEspaces: z
    .array(
      z.object({
        espaceId: z.number(),
        total: z.number().nullable(),
        totalInstallation: z.number().nullable(),
      })
    )
    .default([]),
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

export const totalSchema = z.object({
  totalAnnuelHt: z.number().nullable(),
  totalInstallationHt: z.number().nullable(),
});

export type TotalNettoyageType = z.infer<typeof totalNettoyageSchema>;
export type TotalHygieneType = z.infer<typeof totalHygieneSchema>;
export type TotalIncendieType = z.infer<typeof totalIncendieSchema>;
export type TotalMaintenanceType = z.infer<typeof totalMaintenanceSchema>;
export type TotalCafeType = z.infer<typeof totalCafeSchema>;
export type TotalTheType = z.infer<typeof totalTheSchema>;
export type TotalSnacksFruitsType = z.infer<typeof totalSnacksFruitsSchema>;
export type TotalFontainesType = z.infer<typeof totalFontainesSchema>;
export type TotalOfficeManagerType = z.infer<typeof totalOfficeManager>;
export type TotalServicesFm4AllType = z.infer<typeof totalServicesFm4AllSchema>;
export type TotalType = z.infer<typeof totalSchema>;
