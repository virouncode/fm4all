import { sucreConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectSucreConsoTarifsSchema = createSelectSchema(
  sucreConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  }
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  slogan: z.string().nullable(),
});

export type SelectSucreConsoTarifsType =
  typeof selectSucreConsoTarifsSchema._type;
