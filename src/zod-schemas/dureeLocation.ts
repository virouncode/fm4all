import { z } from "zod";

export const dureeLocationHygieneSchema = z.enum([
  "pa12M",
  "pa24M",
  "pa36M",
  "oneShot",
]);

export type DureeLocationHygieneType = z.infer<
  typeof dureeLocationHygieneSchema
>;

export const dureeLocationCafeSchema = z.enum([
  "pa12M",
  "pa24M",
  "pa36M",
  "pa48M",
  "oneShot",
]);

export type DureeLocationCafeType = z.infer<typeof dureeLocationCafeSchema>;

export const dureeLocationFontaineSchema = z.enum([
  "pa12M",
  "pa24M",
  "pa36M",
  "pa48M",
  "pa60M",
  "oneShot",
]);

export type DureeLocationFontaineType = z.infer<
  typeof dureeLocationFontaineSchema
>;
