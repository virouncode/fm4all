import { sucreConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectSucreConsoTarifsSchema = createSelectSchema(
  sucreConsoTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectSucreConsoTarifsType =
  z.infer<typeof selectSucreConsoTarifsSchema>;
