import { foodLivraisonTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFoodLivraisonTarifsSchema = createSelectSchema(
  foodLivraisonTarifs,
  {
    freqAnnuelle: (schema) =>
      schema.min(1, "La fréquence annuelle est obligatoire"),
    prixUnitaire: (schema) => schema.min(0, "Le prix unitaire est obligatoire"),
    prixUnitaireSiCafe: (schema) =>
      schema.min(0, "Le prix unitaire si café est obligatoire"),
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectFoodLivraisonTarifsType =
  z.infer<typeof selectFoodLivraisonTarifsSchema>;
