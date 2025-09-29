import { fontainesProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFontaineProduitSchema = createSelectSchema(
  fontainesProduits,
  {
    nbPersonnes: (schema) =>
      schema.min(1, "Le nombre de personnes est obligatoire"),
  },
);

export type SelectFontaineProduitType =
  typeof selectFontaineProduitSchema._type;
