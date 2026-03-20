import { z } from "zod";

export const maintenanceSchema = z.object({
  infos: z.object({
    entrepriseId: z.string().uuid().nullable(),
    nomPrestataire: z.string().nullable(),
    sloganPrestataire: z.string().nullable(),
    logoStorageKey: z.string().nullable(),
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
