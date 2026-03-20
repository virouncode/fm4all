import { hygieneInstalDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneInstalDistribTarifsSchema = createSelectSchema(
  hygieneInstalDistribTarifs,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    prixInstallation: (schema) =>
      schema.min(0, "Le prix d'installation est obligatoire"),
  },
);

export const selectHygieneInstalDistribTarifsFournisseurSchema =
  createSelectSchema(hygieneInstalDistribTarifs, {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
    prixInstallation: (schema) =>
      schema.min(0, "Le prix d'installation est obligatoire"),
  });

export type SelectHygieneInstalDistribTarifsType =
  z.infer<typeof selectHygieneInstalDistribTarifsSchema>;
export type SelectHygieneInstalDistribTarifsFournisseurType =
  z.infer<typeof selectHygieneInstalDistribTarifsFournisseurSchema>;
