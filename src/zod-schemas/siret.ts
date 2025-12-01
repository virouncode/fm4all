import { formatSIRET, isValidSIRET } from "@/lib/utils/isValidSIRET";
import { z } from "zod";

export const siretSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((val) => isValidSIRET(val), {
      message,
    })
    .transform((val) => {
      // On enlève tous les espaces pour avoir 14 chiffres
      const digitsOnly = val.replace(/\s/g, "");
      // Ta fonction formatSIRET attend déjà une string de 14 chiffres
      return formatSIRET(digitsOnly); // ex: "123 456 789 00012"
    });
