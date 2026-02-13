import { formatSIRET, isValidSIRET } from "@/lib/utils/isValidSIRET";
import { z } from "zod";

export const siretSchemaEmpty = (message: string) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || isValidSIRET(val), { message })
    .transform((val) => {
      if (val === "") return ""; // important !
      const digitsOnly = val.replace(/\s/g, "");
      return formatSIRET(digitsOnly);
    });

export const siretSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((val) => isValidSIRET(val), { message })
    .transform((val) => {
      const digitsOnly = val.replace(/\s/g, "");
      return formatSIRET(digitsOnly);
    });
