import { fontaines } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFontainesModelesSchema = createSelectSchema(fontaines);
export type SelectFontainesModelesType =
  z.infer<typeof selectFontainesModelesSchema>;
