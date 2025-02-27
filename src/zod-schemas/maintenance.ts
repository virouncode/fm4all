import { z } from "zod";

export const maintenanceSchema = z.object({
  infos: z.object({
    fournisseurId: z.number().nullable(),
    nomFournisseur: z.string().nullable(),
    sloganFournisseur: z.string().nullable(),
    logoUrl: z.string().nullable(),
    gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
    commentaires: z.string().nullable(),
  }),
  quantites: z.object({
    freqAnnuelle: z.number().nullable(),
    hParPassage: z.number().nullable(),
  }),
  prix: z.object({
    tauxHoraire: z.number().nullable(),
    prixQ18: z.number().nullable(),
    prixLegio: z.number().nullable(),
    prixQualiteAir: z.number().nullable(),
  }),
});

export type MaintenanceType = z.infer<typeof maintenanceSchema>;
