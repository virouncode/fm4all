import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

//======================= PHONE NUMBER SCHEMAS =======================//
export const phoneNumberSchemaEmpty = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val === "") return true;
        const phone = parsePhoneNumberFromString(val, "FR");
        return phone?.isValid() ?? false;
      },
      {
        message,
      },
    )
    .transform((val) =>
      val === "" ? "" : parsePhoneNumberFromString(val, "FR")!.format("E.164"),
    );

export const phoneNumberSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => {
        const phone = parsePhoneNumberFromString(val, "FR");
        return phone?.isValid() ?? false;
      },
      {
        message,
      },
    )
    .transform((val) => parsePhoneNumberFromString(val, "FR")!.format("E.164"));
