import { cafeQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectCafeQuantitesSchema = createSelectSchema(cafeQuantites, {
  effectif: (schema) => schema.min(1, "L'effectif obligatoire"),
  nbCafesParAn: (schema) =>
    schema.min(1, "Le nombre des cafés par an est obligatoire"),
  nbMachines: (schema) =>
    schema.min(1, "Le nombre de machines est obligatoire"),
});

export type SelectCafeQuantitesType = typeof selectCafeQuantitesSchema._type;
