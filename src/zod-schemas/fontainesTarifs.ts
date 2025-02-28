import { fontainesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFontainesTarifsSchema = createSelectSchema(
  fontainesTarifs
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  sloganFournisseur: z.string().nullable(),
  logoUrl: z.string().nullable(),
  locationUrl: z.string().nullable(),
  anneeCreation: z.number().nullable(),
  ca: z.string().nullable(),
  effectifFournisseur: z.string().nullable(),
  nbClients: z.number().nullable(),
  noteGoogle: z.string().nullable(),
  nbAvis: z.number().nullable(),
});
export type SelectFontainesTarifsType =
  typeof selectFontainesTarifsSchema._type;
