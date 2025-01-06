import { propreteInstalDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectPropreteInstalDistribTaifsSchema = createSelectSchema(
  propreteInstalDistribTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    prixInstallation: (schema) =>
      schema.min(0, "Le prix d'installation est obligatoire"),
  }
);

export type SelectPropreteInstalDistribTarifsType =
  typeof selectPropreteInstalDistribTaifsSchema._type;
