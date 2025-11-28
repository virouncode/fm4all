import { cafeMachines } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectCafeMachinesSchema = createSelectSchema(cafeMachines, {
  marque: (schema) => schema.min(1, "La marque de la machine est obligatoire"),
  modele: (schema) => schema.min(1, "Le modèle de la machine est obligatoire"),
  nbBoissons: (schema) =>
    schema.min(1, "Le nombre de boissons est obligatoire"),
  nbTassesParJ: (schema) =>
    schema.min(1, "Le nombre de tasses par jour est obligatoire"),
});

export type SelectCafeMachinesType = z.infer<typeof selectCafeMachinesSchema>;
