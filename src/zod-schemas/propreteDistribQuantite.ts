import { propreteDistribQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectPropreteDistribQuantiteSchema = createSelectSchema(
  propreteDistribQuantites,
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
  nbDistribDesinfectant: z.number(),
  nbDistributeurParfum: z.number(),
  nbDistribBalai: z.number(),
  nbDistribPoubelle: z.number(),
});

export type SelectPropreteDistribQuantiteType =
  typeof selectPropreteDistribQuantiteSchema._type;
