import { riaProduits } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectRiaProduitSchema = createSelectSchema(riaProduits);

export type SelectRiaProduitType = typeof selectRiaProduitSchema._type;
