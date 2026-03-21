import { nettoyageRepasseTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectRepasseTarifsSchema = createSelectSchema(
  nettoyageRepasseTarifs,
  {
    hParPassage: (schema) =>
      schema.min(1, "Le nombre d'heures moyen par passage est obligatoire"),
    tauxHoraire: (schema) => schema.min(1, "Le taux horaire est obligatoire"),
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire invalide"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifPrestataire: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export type SelectRepasseTarifsType = z.infer<typeof selectRepasseTarifsSchema>;
