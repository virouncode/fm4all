import { nettoyageQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageQuantitesSchema =
  createSelectSchema(nettoyageQuantites);

export type SelectNettoyageQuantitesType =
  z.infer<typeof selectNettoyageQuantitesSchema>;
