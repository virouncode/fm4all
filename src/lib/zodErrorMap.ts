import { z } from "zod";

/**
 * Type for the translation function from useScopedI18n
 * This matches the actual type returned by useScopedI18n
 */
type TranslationFunction = {
  (key: string): string;
  (key: string, params: Record<string, unknown>): string;
};

/**
 * Creates a custom error map for Zod that uses internationalized error messages
 * @param t - Translation function from useScopedI18n
 * @returns A Zod error map function
 */
export const createPartialClientErrorMap = (
  t: TranslationFunction
): z.ZodErrorMap => {
  return (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
      if (issue.expected === "string") {
        if (issue.path.includes("nomEntreprise")) {
          return { message: t("companyNameRequired") };
        }
        if (issue.path.includes("prenomContact")) {
          return { message: t("firstNameRequired") };
        }
        if (issue.path.includes("nomContact")) {
          return { message: t("lastNameRequired") };
        }
        if (issue.path.includes("posteContact")) {
          return { message: t("positionRequired") };
        }
        if (issue.path.includes("surface")) {
          return { message: t("surfaceRequired") };
        }
        if (issue.path.includes("effectif")) {
          return { message: t("staffRequired") };
        }
        if (issue.path.includes("ville")) {
          return { message: t("cityRequired") };
        }
      }
    }

    if (issue.code === z.ZodIssueCode.invalid_string) {
      if (issue.validation === "email") {
        return { message: t("invalidEmail") };
      }
      if (issue.validation === "regex") {
        if (issue.path.includes("siret")) {
          return { message: t("invalidSiret") };
        }
        if (issue.path.includes("phoneContact")) {
          return { message: t("invalidPhone") };
        }
        if (issue.path.includes("codePostal")) {
          return { message: t("invalidPostalCode") };
        }
      }
    }

    if (issue.code === z.ZodIssueCode.too_small) {
      if (issue.type === "number") {
        if (issue.path.includes("surface")) {
          return { message: t("surfaceRequired") };
        }
        if (issue.path.includes("effectif")) {
          return { message: t("staffRequired") };
        }
      }
    }

    if (issue.code === z.ZodIssueCode.too_big) {
      if (issue.type === "number") {
        if (issue.path.includes("surface")) {
          return { message: t("surfaceMax") };
        }
        if (issue.path.includes("effectif")) {
          return { message: t("staffMax") };
        }
      }
    }

    if (issue.code === z.ZodIssueCode.invalid_enum_value) {
      if (issue.path.includes("typeBatiment")) {
        return { message: t("invalidBuildingType") };
      }
      if (issue.path.includes("typeOccupation")) {
        return { message: t("invalidOccupationType") };
      }
    }

    if (issue.code === z.ZodIssueCode.custom) {
      if (issue.path.includes("surface")) {
        return { message: t("surfaceRange") };
      }
      if (issue.path.includes("effectif")) {
        return { message: t("staffRange") };
      }
      if (issue.path.includes("codePostal")) {
        return { message: t("invalidPostalCode") };
      }
    }

    // Fall back to default error message
    return { message: ctx.defaultError };
  };
};
