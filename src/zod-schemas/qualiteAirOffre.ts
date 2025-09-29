import { qualiteAirOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectQualiteAirOffreSchema = createSelectSchema(
  qualiteAirOffres,
  {
    prixAnnuel: (schema) => schema.min(1, "Le prix annuel est obligatoire"),
  },
);

export type SelectQualiteAirOffreType =
  typeof selectQualiteAirOffreSchema._type;
