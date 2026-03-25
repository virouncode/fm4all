import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

function parsePhone(val: string) {
  return val.startsWith("+")
    ? parsePhoneNumberFromString(val)
    : parsePhoneNumberFromString(val, "FR");
}

//======================= PHONE NUMBER SCHEMAS =======================//
export const phoneNumberSchemaEmpty = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val === "") return true;
        return parsePhone(val)?.isValid() ?? false;
      },
      { message },
    )
    .transform((val) =>
      val === "" ? "" : parsePhone(val)!.format("E.164"),
    );

export const phoneNumberSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (val) => parsePhone(val)?.isValid() ?? false,
      { message },
    )
    .transform((val) => parsePhone(val)!.format("E.164"));
