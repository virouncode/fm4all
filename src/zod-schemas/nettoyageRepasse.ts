import { nettoyageRepasseTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectRepasseTarifsSchema = createSelectSchema(
  nettoyageRepasseTarifs,
  {
    hParPassage: (schema) =>
      schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  }
);

export type SelectRepasseTarifsType = typeof selectRepasseTarifsSchema._type;
