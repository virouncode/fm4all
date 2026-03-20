import { theConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectTheConsoTarifsSchema = createSelectSchema(theConsoTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
}).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifFournisseur: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export type SelectTheConsoTarifsType = z.infer<typeof selectTheConsoTarifsSchema>;
