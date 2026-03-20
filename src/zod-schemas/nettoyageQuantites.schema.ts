import { nettoyageQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectNettoyageQuantitesSchema = createSelectSchema(
  nettoyageQuantites,
  {
    freqAnnuelle: (schema) =>
      schema.min(1, "La fréquence annuelle est obligatoire"),
    surface: (schema) => schema.min(1, "La surface est obligatoire"),
  },
);

export type SelectNettoyageQuantitesType =
  z.infer<typeof selectNettoyageQuantitesSchema>;
