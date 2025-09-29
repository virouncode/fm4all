import { q18Offres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectQ18OffreSchema = createSelectSchema(q18Offres, {
  prixAnnuel: (schema) => schema.min(1, "Le prix annuel est obligatoire"),
});
export type SelectQ18OffreType = typeof selectQ18OffreSchema._type;
