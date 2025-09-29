import { alarmesOffres } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectAlarmeOffreSchema = createSelectSchema(alarmesOffres, {
  prixTotal: (schema) => schema.min(1, "Le prix total est obligatoire"),
});
export type SelectAlarmeOffreType = typeof selectAlarmeOffreSchema._type;
