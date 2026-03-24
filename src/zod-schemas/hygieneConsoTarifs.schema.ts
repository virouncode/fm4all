import { hygieneConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneConsoTarifsSchema = createSelectSchema(
  hygieneConsoTarifs,
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
});

export const selectHygieneConsoTarifsFournisseurSchema =
  createSelectSchema(hygieneConsoTarifs);

export type SelectHygieneConsoTarifsType =
  z.infer<typeof selectHygieneConsoTarifsSchema>;

export type SelectHygieneConsoTarifsFournisseurType =
  z.infer<typeof selectHygieneConsoTarifsFournisseurSchema>;
