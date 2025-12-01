import { colonnesSechesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectColonnesSechesTarifsSchema =
  createSelectSchema(colonnesSechesTarifs);

export type SelectColonnesSechesTarifsType =
  z.infer<typeof selectColonnesSechesTarifsSchema>;
