import { z } from "zod";

export const emptyStringToUndefined = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));
