import { portesCoupeFeuTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectPortesCoupeFeuTarifsSchema =
  createSelectSchema(portesCoupeFeuTarifs);

export type SelectPortesCoupeFeuTarifsType =
  z.infer<typeof selectPortesCoupeFeuTarifsSchema>;
