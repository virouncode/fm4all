import { propreteDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectPropreteDistribTarifsSchema = createSelectSchema(
  propreteDistribTarifs
).extend({
  nomEntreprise: z.string().nonempty("Le nom de l'entreprise est requis"),
  slogan: z.string().nullable(),
});

export type SelectPropreteDistribTarifsType =
  typeof selectPropreteDistribTarifsSchema._type;
