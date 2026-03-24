import { chocolatConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectChocolatConsoTarifsSchema = createSelectSchema(
  chocolatConsoTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectChocolatConsoTarifsType = z.infer<
  typeof selectChocolatConsoTarifsSchema
>;
