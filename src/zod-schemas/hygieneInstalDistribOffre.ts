import { hygieneInstalDistribOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectHygieneInstalDistribOffreSchema = createSelectSchema(
  hygieneInstalDistribOffres,
  {
    prixInstallation: (schema) =>
      schema.min(0, "Le prix d'installation est obligatoire"),
  },
);

export type SelectHygieneInstalDistribOffreType =
  typeof selectHygieneInstalDistribOffreSchema._type;
