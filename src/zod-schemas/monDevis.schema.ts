import { z } from "zod";

export const monDevisSchema = z.object({
  currentMonDevisId: z.number(),
});

export type MonDevisType = z.infer<typeof monDevisSchema>;
