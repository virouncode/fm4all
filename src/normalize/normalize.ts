import { capitalize } from "@/lib/utils/capitalize";

export const emptyToNull = (value: string | null | undefined) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const normalizeEmail = (value: string | null | undefined) => {
  const v = emptyToNull(value);
  return v ? v.toLowerCase() : null;
};

export const normalizeCapitalized = (value: string | null | undefined) => {
  const v = emptyToNull(value);
  return v ? capitalize(v) : null;
};

export const normalizeUpper = (value: string | null | undefined) => {
  const v = emptyToNull(value);
  return v ? v.toUpperCase() : null;
};

export const toIntOrNull = (value: string | null | undefined) => {
  const v = emptyToNull(value);
  if (!v) return null;
  const parsed = Number.parseInt(v, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
