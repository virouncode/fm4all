import { chocolatConsoProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectChocolatConsoProduitSchema = createSelectSchema(
  chocolatConsoProduits,
  {
    effectif: (schema) => schema.min(1, "L'effectif est obligatoire"),
  },
);

export type SelectChocolatConsoProduitType =
  typeof selectChocolatConsoProduitSchema._type;
