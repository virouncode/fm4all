import { officeManagerQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectOfficeManagerQuantitesSchema =
  createSelectSchema(officeManagerQuantites);

export type SelectOfficeManagerQuantitesType =
  z.infer<typeof selectOfficeManagerQuantitesSchema>;
