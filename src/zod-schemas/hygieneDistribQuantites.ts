import { hygieneDistribQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneDistribQuantitesSchema = createSelectSchema(
  hygieneDistribQuantites,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    nbDistribEmp: (schema) =>
      schema.min(1, "Le nombre de distributeurs emp est obligatoire"),
    nbDistribSavon: (schema) =>
      schema.min(1, "Le nombre de distributeurs savon est obligatoire"),
    nbDistribPh: (schema) =>
      schema.min(1, "Le nombre de distributeurs ph est obligatoire"),
  }
).extend({
  nbDistribDesinfectant: z
    .number()
    .min(1, "Le nombre de distributeurs désinfectant est obligatoire"),
  nbDistribParfum: z
    .number()
    .min(1, "Le nombre de distributeurs parfum est obligatoire"),
  nbDistribBalai: z
    .number()
    .min(1, "Le nombre de distributeurs balai est obligatoire"),
  nbDistribPoubelle: z
    .number()
    .min(1, "Le nombre de distributeurs poubelle est obligatoire"),
});

export type SelectHygieneDistribQuantitesType =
  typeof selectHygieneDistribQuantitesSchema._type;
