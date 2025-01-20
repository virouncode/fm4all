import { maintenanceTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectMaintenanceTarifsSchema = createSelectSchema(
  maintenanceTarifs,
  {
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
    hParPassage: (schema) =>
      schema.min(1, "Le nombre d'heures par passage est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
  }
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectMaintenanceTarifsType = z.infer<
  typeof selectMaintenanceTarifsSchema
>;
