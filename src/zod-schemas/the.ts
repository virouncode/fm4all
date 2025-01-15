import { z } from "zod";

export const theSchema = z.object({
  theGammeSelected: z.enum(["essentiel", "confort", "excellence"]).nullable(),
  nbPersonnes: z.number(),
});

export type TheType = z.infer<typeof theSchema>;
