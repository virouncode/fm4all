import { qualiteAirTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectQualiteAirTarifsSchema = createSelectSchema(qualiteAirTarifs);

export type SelectQualiteAirTarifsType =
  z.infer<typeof selectQualiteAirTarifsSchema>;
