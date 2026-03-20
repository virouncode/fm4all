import { sucreConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectSucreConsoTarifsSchema = createSelectSchema(
  sucreConsoTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire obligatoire"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectSucreConsoTarifsType =
  z.infer<typeof selectSucreConsoTarifsSchema>;
