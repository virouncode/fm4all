import { laitConsoTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectLaitConsoTarifsSchema = createSelectSchema(
  laitConsoTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectLaitConsoTarifsType =
  z.infer<typeof selectLaitConsoTarifsSchema>;
