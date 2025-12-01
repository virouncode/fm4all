import { legioTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectLegioTarifsSchema = createSelectSchema(legioTarifs, {
  surface: (schema) =>
    schema
      .min(50, "La surface doit être comprise entre 50 et 3000 m²")
      .max(3000, "La surface doit être comprise entre 50 et 3000 m²"),
  prixAnnuel: (schema) => schema.min(0, "Le prix annuel est obligatoire"),
});

export type SelectLegioTarifsType = z.infer<typeof selectLegioTarifsSchema>;
