import { fontaines } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectFontainesModelesSchema = createSelectSchema(fontaines);
export type SelectFontainesModelesType =
  typeof selectFontainesModelesSchema._type;
