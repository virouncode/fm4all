import { exutoiresTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectExutoiresTarifsSchema = createSelectSchema(exutoiresTarifs);
export type SelectExutoiresTarifsType =
  typeof selectExutoiresTarifsSchema._type;
