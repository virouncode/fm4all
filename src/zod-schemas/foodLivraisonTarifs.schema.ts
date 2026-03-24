import { foodLivraisonTarifs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectFoodLivraisonTarifsSchema = createSelectSchema(
  foodLivraisonTarifs,
).extend({
  nomPrestataire: z.string().min(1),
  slogan: z.string().nullable(),
  logoStorageKey: z.string().nullable(),
});

export type SelectFoodLivraisonTarifsType =
  z.infer<typeof selectFoodLivraisonTarifsSchema>;
