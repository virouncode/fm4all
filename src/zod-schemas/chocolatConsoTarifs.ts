import { chocolatConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectChocolatConsoTarifsSchema = createSelectSchema(
  chocolatConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  }
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

export type SelectChocolatConsoTarifsType =
  typeof selectChocolatConsoTarifsSchema._type;
