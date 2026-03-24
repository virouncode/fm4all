import { hygieneDistribQuantites } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectHygieneDistribQuantitesSchema = createSelectSchema(
  hygieneDistribQuantites,
).extend({
  nbDistribEmpPoubelle: z.number().min(1),
  nbDistribDesinfectant: z.number().min(1),
  nbDistribParfum: z.number().min(1),
  nbDistribBalai: z.number().min(1),
  nbDistribPoubelle: z.number().min(1),
});

export type SelectHygieneDistribQuantitesType =
  z.infer<typeof selectHygieneDistribQuantitesSchema>;
