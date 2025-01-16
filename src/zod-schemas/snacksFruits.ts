import { z } from "zod";

export const snacksFruitsSchema = z.object({
  fournisseurId: z.number().nullable(),
  gammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  nbPersonnes: z.number(),
  choix: z.array(z.enum(["fruits", "snacks", "boissons"])),
});

export type SnacksFruitsType = z.infer<typeof snacksFruitsSchema>;
