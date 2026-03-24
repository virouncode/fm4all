import { fruitsQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFruitsQuantitesSchema = createSelectSchema(fruitsQuantites);

export type SelectFruitsQuantitesType =
  z.infer<typeof selectFruitsQuantitesSchema>;
