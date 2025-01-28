import { colonnesSechesTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectColonnesSechesTarifsSchema =
  createSelectSchema(colonnesSechesTarifs);

export type SelectColonnesSechesTarifsType =
  typeof selectColonnesSechesTarifsSchema._type;
