import { fontainesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFontainesTarifsSchema = createSelectSchema(
  fontainesTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  sloganPrestataire: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifPrestataire: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
  imageStorageKey: z.string().nullable(),
});
export type SelectFontainesTarifsType =
  z.infer<typeof selectFontainesTarifsSchema>;
