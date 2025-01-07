import { z } from "zod";

export const gammeSchema = z.enum(["essentiel", "confort", "excellence"]);

export type GammeType = z.infer<typeof gammeSchema>;
