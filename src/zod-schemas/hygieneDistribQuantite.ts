import { hygieneDistribQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneDistribQuantiteSchema = createSelectSchema(
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
);

export type SelectHygieneDistribQuantiteType =
  typeof selectHygieneDistribQuantiteSchema._type;
