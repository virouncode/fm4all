import { incendieProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectIncendieProduitSchema = createSelectSchema(
  incendieProduits,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  },
);
export type SelectIncendieProduitType =
  typeof selectIncendieProduitSchema._type;
