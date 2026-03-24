import { nettoyageTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageTarifsSchema = createSelectSchema(
  nettoyageTarifs,
).extend({
  nomPrestataire: z.string().min(1),
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

export const selectNettoyageTarifsFournisseurSchema = createSelectSchema(
  nettoyageTarifs,
);

export type SelectNettoyageTarifsType =
  z.infer<typeof selectNettoyageTarifsSchema>;

export type SelectNettoyageTarifFournisseurType =
  z.infer<typeof selectNettoyageTarifsFournisseurSchema>;
