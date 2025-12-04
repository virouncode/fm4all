import { updateProspectSchema } from "@/zod-schemas/prospect";
import { z } from "zod";

const finaliserDevisMontantsSchema = z.object({
  totalMensuelHt: z.number().int().nonnegative().default(0), //*10000
  totalInstallationHt: z.number().int().nonnegative().default(0), //*10000
  margeCoefficient: z.number(),
});
export const finaliserDevisSchema = z.object({
  prospect: updateProspectSchema,
  devisUrl: z.url(),
  commentaires: z.string().nullable(),
  devisMontants: finaliserDevisMontantsSchema,
});

export type FinaliserDevisType = z.infer<typeof finaliserDevisSchema>;
