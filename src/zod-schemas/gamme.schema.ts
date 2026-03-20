import { z } from "zod";

export const gammeSchema = z.enum(["essentiel", "confort", "excellence"]);
export const gammes = ["essentiel", "confort", "excellence"] as const;

export type GammeType = z.infer<typeof gammeSchema>;
