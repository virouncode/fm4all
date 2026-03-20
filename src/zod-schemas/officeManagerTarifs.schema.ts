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
  },
).extend({
  nomPrestataire: z.string().nonempty("Nom du prestataire invalide"),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectOfficeManagerTarifsType =
  z.infer<typeof selectOfficeManagerTarifsSchema>;
