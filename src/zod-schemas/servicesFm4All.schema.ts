import { z } from "zod";

export const servicesFm4AllSchema = z.object({
  infos: z.object({
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
    commentaires: z.string().nullable(),
    assurance: z.enum(["inclus", "non inclus", "non propose", "sur demande"]),
    plateforme: z.enum(["inclus", "non inclus", "non propose", "sur demande"]),
    supportAdmin: z.enum([
      "inclus",
      "non inclus",
      "non propose",
      "sur demande",
    ]),
    supportOp: z.enum(["inclus", "non inclus", "non propose", "sur demande"]),
    accountManager: z.enum([
      "inclus",
      "non inclus",
      "non propose",
      "sur demande",
    ]),
    audit: z.enum(["inclus", "non inclus", "non propose", "sur demande"]),
  }),
  prix: z.object({
    tauxAssurance: z.number(),
    tauxPlateforme: z.number(),
    tauxSupportAdmin: z.number(),
    tauxSupportOp: z.number(),
    tauxAccountManager: z.number(),
    remiseCaSeuil: z.number(),
    tauxRemiseCa: z.number(),
    tauxRemiseHof: z.number(),
    minFacturationPlateforme: z.number(),
    minFacturationSupportOp: z.number(),
    minFacturationAccountManager: z.number(),
  }),
});

export type ServicesFm4AllType = z.infer<typeof servicesFm4AllSchema>;

export type ServicesFm4AllOffresType =
  | "non inclus"
  | "inclus"
  | "non propose"
  | "sur demande";
