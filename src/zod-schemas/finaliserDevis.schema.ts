import { updateProspectSchema } from "@/zod-schemas/prospect.schema";
import { z } from "zod";

const finaliserDevisMontantsSchema = z.object({
  totalMensuelHt: z.number().int().nonnegative().default(0), //*10000
  totalInstallationHt: z.number().int().nonnegative().default(0), //*10000
  margeCoefficient: z.number(),
});
export const finaliserDevisSchema = z.object({
  prospect: updateProspectSchema,
  devisS3Key: z.string().min(1, "La clé S3 du devis est requise"),
  commentaires: z.string().nullable(),
  devisMontants: finaliserDevisMontantsSchema,
});

export type FinaliserDevisType = z.infer<typeof finaliserDevisSchema>;
