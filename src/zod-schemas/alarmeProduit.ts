import { alarmesProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectAlarmeProduitSchema = createSelectSchema(alarmesProduits, {
  nbPoints: (schema) =>
    schema.min(1, "Le nombre de points de contrôle est obligatoire"),
});

export type SelectAlarmeProduitType = typeof selectAlarmeProduitSchema._type;
