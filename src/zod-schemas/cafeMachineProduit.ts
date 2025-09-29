import { cafeMachinesProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectCafeMachineProduitSchema = createSelectSchema(
  cafeMachinesProduits,
  {
    nbPersonnes: (schema) =>
      schema.min(1, "Le nombre de personnes est obligatoire"),
  },
);

export type SelectCafeMachineProduitType =
  typeof selectCafeMachineProduitSchema._type;
