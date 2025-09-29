import { exutoiresProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectExutoireProduitSchema = createSelectSchema(
  exutoiresProduits,
  {
    nbExutoires: (schema) =>
      schema.min(1, "Le nombre d'exutoires est obligatoire"),
  },
);

export type SelectExutoireProduitType =
  typeof selectExutoireProduitSchema._type;
