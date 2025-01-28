import { portesCoupeFeuTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

export const selectPortesCoupeFeuTarifsSchema =
  createSelectSchema(portesCoupeFeuTarifs);

export type SelectPortesCoupeFeuTarifsType =
  typeof selectPortesCoupeFeuTarifsSchema._type;
