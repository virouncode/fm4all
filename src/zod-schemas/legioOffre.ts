import { legioOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectLegioOffreSchema = createSelectSchema(legioOffres, {
  prixAnnuel: (schema) => schema.min(1, "Le prix annuel est obligatoire"),
});
export type SelectLegioOffreType = typeof selectLegioOffreSchema._type;
