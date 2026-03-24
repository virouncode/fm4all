import { snacksQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectSnacksQuantitesSchema = createSelectSchema(snacksQuantites);

export type SelectSnacksQuantitesType =
  z.infer<typeof selectSnacksQuantitesSchema>;
