import { propreteDistribTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectPropreteDistribTarifsSchema = createSelectSchema(
  propreteDistribTarifs
);

export type SelectPropreteDistribTarifsType =
  typeof selectPropreteDistribTarifsSchema._type;
