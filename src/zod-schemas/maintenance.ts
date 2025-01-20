import { z } from "zod";

export const maintenanceSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  }),
  quantites: z.object({
    freqAnnuelle: z.number().default(0),
    hParPassage: z.number().default(0),
  }),
  prix: z.object({
    tauxHoraire: z.number().default(0),
  }),
});

export type MaintenanceType = z.infer<typeof maintenanceSchema>;
