import { incendieQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectIncendieQuantitesSchema =
  createSelectSchema(incendieQuantites);

export type SelectIncendieQuantitesType =
  z.infer<typeof selectIncendieQuantitesSchema>;
