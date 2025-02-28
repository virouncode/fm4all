import { hygieneDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneDistribTarifsSchema = createSelectSchema(
  hygieneDistribTarifs
).extend({
  nomFournisseur: z.string().nonempty("Le nom de l'entreprise est requis"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
  locationUrl: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectif: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});

export type SelectHygieneDistribTarifsType =
  typeof selectHygieneDistribTarifsSchema._type;
