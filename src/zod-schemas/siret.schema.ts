import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import { z } from "zod";

export const siretSchemaEmpty = (message: string) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || isValidSIRET(val), { message })
    .transform((val) => {
      if (val === "") return ""; // important !
      return val.replace(/\s/g, "");
    });

export const siretSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((val) => isValidSIRET(val), { message })
    .transform((val) => val.replace(/\s/g, ""));
