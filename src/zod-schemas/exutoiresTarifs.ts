import { exutoiresTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectExutoiresTarifsSchema = createSelectSchema(exutoiresTarifs);
export type SelectExutoiresTarifsType = z.infer<
  typeof selectExutoiresTarifsSchema
>;
