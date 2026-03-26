import { updateProspectSchema } from "@/zod-schemas/prospect.schema";
import { z } from "zod";

const finaliserDevisMontantsSchema = z.object({
  totalMensuelHt: z.number().int().nonnegative(), //*10000
  totalInstallationHt: z.number().int().nonnegative(), //*10000
  margeCoefficient: z.number(),
});
export const finaliserDevisSchema = z.object({
  prospect: updateProspectSchema,
  devisS3Key: z
    .string()
    .regex(
      /^public\/devis_temporaires\/\d{4}\/\d{2}\/[0-9a-f-]{36}_[\w.\-]{1,80}\.pdf$/,
      "Clé S3 du devis invalide",
    ),
  commentaires: z.string().nullable(),
  devisMontants: finaliserDevisMontantsSchema,
  pdfFilename: z.string().min(1),
  pdfSizeBytes: z.number().int().positive(),
  texte: z.string(),
});

export type FinaliserDevisType = z.infer<typeof finaliserDevisSchema>;
