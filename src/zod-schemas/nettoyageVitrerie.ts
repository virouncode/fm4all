import { nettoyageVitrerieTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageVitrerieTarifsSchema = createSelectSchema(
  nettoyageVitrerieTarifs,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  }
).extend({
  nomEntreprise: z.string().nonempty("Nom de fournisseur invalide"),
  slogan: z.string().nullable(),
});

export type SelectNettoyageVitrerieTarifsType =
  typeof selectNettoyageVitrerieTarifsSchema._type;
