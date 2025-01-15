import { foodLivraisonTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFoodLivraisonTarifsSchema = createSelectSchema(
  foodLivraisonTarifs,
  {
    freqAnnuelle: (schema) =>
      schema.min(1, "La fréquence annuelle est obligatoire"),
    prixUnitaire: (schema) => schema.min(0, "Le prix unitaire est obligatoire"),
  }
);

export type SelectFoodLivraisonTarifsType =
  typeof selectFoodLivraisonTarifsSchema._type;
