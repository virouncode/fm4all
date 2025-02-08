import { hygieneDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneDistribTarifsSchema = createSelectSchema(
  hygieneDistribTarifs
).extend({
  nomFournisseur: z.string().nonempty("Le nom de l'entreprise est requis"),
  slogan: z.string().nullable(),
});

export type SelectHygieneDistribTarifsType =
  typeof selectHygieneDistribTarifsSchema._type;
