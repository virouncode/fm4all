import { z } from "zod";

export const dureeLocationSchema = z.enum([
  "pa12M",
  "pa24M",
  "pa36M",
  "oneShot",
]);

export type DureeLocationType = z.infer<typeof dureeLocationSchema>;
