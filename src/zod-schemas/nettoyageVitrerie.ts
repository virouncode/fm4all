import { nettoyageVitrerieTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectVitrerieTarifsSchema = createSelectSchema(
  nettoyageVitrerieTarifs,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  }
);

export type SelectVitrerieTarifsType = typeof selectVitrerieTarifsSchema._type;
