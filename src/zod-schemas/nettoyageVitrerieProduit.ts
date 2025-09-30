import { nettoyageVitrerieProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectNettoyageVitrerieProduitSchema = createSelectSchema(
  nettoyageVitrerieProduits,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
  },
);

export type SelectNettoyageVitrerieProduitType =
  typeof selectNettoyageVitrerieProduitSchema._type;
