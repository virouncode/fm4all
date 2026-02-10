import { z } from "zod";

export const codePostalSchema = (message: string) =>
  z
    .string()
    .trim()
    .transform((val) => val.replace(/\s|-/g, "")) // normalisation
    .refine((val) => /^[0-9]{5}$/.test(val), {
      message,
    });
