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
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifPrestataire: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
  imageStorageKey: z.string().nullable(),
});

export type SelectMaintenanceTarifsType = z.infer<
  typeof selectMaintenanceTarifsSchema
>;
