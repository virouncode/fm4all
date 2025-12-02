import { updateProspectSchema } from "@/zod-schemas/prospect";
import { z } from "zod";

export const finaliserDevisSchema = z.object({
  prospect: updateProspectSchema,
  devisUrl: z.url(),
  commentaires: z.string().nullable().optional(),
});

export type FinaliserDevisType = z.infer<typeof finaliserDevisSchema>;
