import { incendieTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectIncendieTarifsSchema = createSelectSchema(incendieTarifs, {
  surface: (schema) => schema.min(1, "La surface est obligatoire"),
  prixParExtincteur: (schema) =>
    schema.min(1, "Le prix par extincteur est obligatoire"),
  prixParBaes: (schema) => schema.min(1, "Le prix par baes est obligatoire"),
  prixParTelBaes: (schema) =>
    schema.min(1, "Le prix par télécommande baes est obligatoire"),
  fraisDeplacement: (schema) =>
    schema.min(1, "Les frais de déplacement sont obligatoire"),
}).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

export type SelectIncendieTarifsType = typeof selectIncendieTarifsSchema._type;
