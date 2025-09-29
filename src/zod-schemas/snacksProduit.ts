import { snacksProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectSnacksProduitSchema = createSelectSchema(snacksProduits, {
  effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
});

export type SelectSnacksProduitType = typeof selectSnacksProduitSchema._type;
