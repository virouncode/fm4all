import { chocolatConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectChocolatConsoTarifsSchema = createSelectSchema(
  chocolatConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectChocolatConsoTarifsType = z.infer<
  typeof selectChocolatConsoTarifsSchema
>;
