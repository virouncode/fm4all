import { nettoyageVitrerieTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectVitrerieTarifsSchema = createSelectSchema(
  nettoyageVitrerieTarifs,
  {
    cadenceVitres: (schema) =>
      schema.min(1, "La cadence vitres est obligatoire"),
    cadenceCloisons: (schema) =>
      schema.min(1, "La cadence cloisons est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  }
).extend({
  nomFournisseur: z.string().nonempty("Nom de fournisseur invalide"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

export type SelectVitrerieTarifsType = typeof selectVitrerieTarifsSchema._type;
