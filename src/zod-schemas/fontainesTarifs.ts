import { fontainesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFontainesTarifsSchema = createSelectSchema(
  fontainesTarifs
).extend({
  nomFournisseur: z.string().nonempty("Le nom du fournisseur est obligatoire"),
  sloganFournisseur: z.string().nullable(),
  logoUrl: z.string().nullable(),
});
export type SelectFontainesTarifsType =
  typeof selectFontainesTarifsSchema._type;
