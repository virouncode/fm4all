import { exutoiresParkingProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectExutoireParkingProduitSchema = createSelectSchema(
  exutoiresParkingProduits,
  {
    nbExutoires: (schema) =>
      schema.min(1, "Le nombre d'exutoires est obligatoire"),
  },
);

export type SelectExutoireParkingProduitType =
  typeof selectExutoireParkingProduitSchema._type;
