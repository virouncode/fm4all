import { hygieneDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneDistribTarifsSchema = createSelectSchema(
  hygieneDistribTarifs,
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectif: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export const selectHygieneDistribTarifsFournisseurSchema =
  createSelectSchema(hygieneDistribTarifs);

export type SelectHygieneDistribTarifsType = z.infer<
  typeof selectHygieneDistribTarifsSchema
>;

export type SelectHygieneDistribTarifsFournisseurType = z.infer<
  typeof selectHygieneDistribTarifsFournisseurSchema
>;
