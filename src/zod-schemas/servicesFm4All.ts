import { z } from "zod";

export const servicesFm4AllSchema = z.object({
  infos: z.object({
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  }),
  prix: z.object({
    tauxAssurance: z.number().nullable(),
    tauxPlateforme: z.number().nullable(),
    tauxSupportAdmin: z.number().nullable(),
    tauxSupportOp: z.number().nullable(),
    tauxAccountManager: z.number().nullable(),
    remiseCaSeuil: z.number().nullable(),
    tauxRemiseCa: z.number().nullable(),
    tauxRemiseHof: z.number().nullable(),
  }),
});

export type ServicesFm4AllType = z.infer<typeof servicesFm4AllSchema>;
