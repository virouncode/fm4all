import { qualiteAirTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectQualiteAirTarifsSchema = createSelectSchema(
  qualiteAirTarifs,
  {
    surface: (schema) =>
      schema
        .min(50, "La surface doit être comprise entre 50 et 3000 m²")
        .max(3000, "La surface doit être comprise entre 50 et 3000 m²"),
    prixAnnuel: (schema) => schema.min(0, "Le prix annuel est obligatoire"),
  }
);

export type SelectQualiteAirTarifsType =
  typeof selectQualiteAirTarifsSchema._type;
