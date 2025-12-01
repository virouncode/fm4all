import { z } from "zod";

export const emptyStringToUndefinedOptional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const emptyStringToUndefined = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v));
