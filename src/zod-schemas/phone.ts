import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

//======================= PHONE NUMBER SCHEMAS =======================//
export const phoneNumberSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => {
        const phone = parsePhoneNumberFromString(val);
        return phone?.isValid() ?? false;
      },
      {
        message,
      },
    )
    .transform((val) => parsePhoneNumberFromString(val)!.format("E.164"));
