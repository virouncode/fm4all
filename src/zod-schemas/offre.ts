import { number, string, z } from "zod";

export type ServiceCategorieType =
  | "Nettoyage"
  | "NettoyageRepasse"
  | "NettoyageSamedi"
  | "NettoyageDimanche"
  | "NettoyageVitrerie"
  | "HygieneDistribEmp"
  | "HygieneDistribSavon"
  | "HygieneDistribPh"
  | "HygieneInstalDistrib"
  | "HygieneDistribDesinfectant"
  | "HygieneDistribParfum"
  | "HygieneDistribBalai"
  | "HygieneDistribPoubelle"
  | "HygieneDistribPhf"
  | "HygieneConsoTrilogie"
  | "HygieneConso";

export const SERVICES_CATEGORIES = [
  "Nettoyage",
  "NettoyageRepasse",
  "NettoyageSamedi",
  "NettoyageDimanche",
  "NettoyageVitrerie",
  "HygieneDistribEmp",
  "HygieneDistribSavon",
  "HygieneDistribPh",
  "HygieneInstalDistrib",
  "HygieneDistribDesinfectant",
  "HygieneDistribParfum",
  "HygieneDistribBalai",
  "HygieneDistribPoubelle",
  "HygieneDistribPhf",
  "HygieneConsoTrilogie",
  "HygieneConso",
] as const;

export const insertOffreSchema = z.object({
  offreId: string(),
  quantite: number().min(0),
  categorieId: z.enum(SERVICES_CATEGORIES),
});

export type InsertOffreSchemaType = z.infer<typeof insertOffreSchema>;
