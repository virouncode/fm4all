import { snacksTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSnacksTarifsSchema = createSelectSchema(snacksTarifs, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  prixUnitaire: (schema) => schema.min(0, "Le prix unitaire est obligatoire"),
});

export type SelectSnacksTarifsType = typeof selectSnacksTarifsSchema._type;
