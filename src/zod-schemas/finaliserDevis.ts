import { updateProspectSchema } from "@/zod-schemas/prospect";
import { z } from "zod";
import { devisStatusEnum, devisTypePrixEnum } from "../db/schema";

export const devisTypePrixSchema = z.enum(devisTypePrixEnum.enumValues);
export type DevisTypePrixType = z.infer<typeof devisTypePrixSchema>;
export const devisStatusSchema = z.enum(devisStatusEnum.enumValues);
export type DevisStatusType = z.infer<typeof devisStatusSchema>;

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
