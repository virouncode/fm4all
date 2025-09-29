import { officeManagerProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectOfficeManagerProduitSchema = createSelectSchema(
  officeManagerProduits,
);

export type SelectOfficeManagerProduitType =
  typeof selectOfficeManagerProduitSchema._type;
