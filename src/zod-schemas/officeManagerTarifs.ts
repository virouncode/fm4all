import { officeManagerTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectOfficeManagerTarifsSchema = createSelectSchema(
  officeManagerTarifs,
  {
    demiTjm: (schema) =>
      schema.min(1, "Le tarif demi-journalier doit être supérieur à 1"),
    demiTjmPremium: (schema) =>
      schema.min(1, "Le tarif demi-journalier premium doit être supérieur à 1"),
  }
).extend({
  nomFournisseur: z.string().nonempty("Nom de fournisseur invalide"),
  slogan: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

export type SelectOfficeManagerTarifsType =
  typeof selectOfficeManagerTarifsSchema._type;
