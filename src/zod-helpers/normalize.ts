// src/lib/normalize.ts

// ---------------------------
// STRING NORMALIZATIONS
// ---------------------------

// Trim + collapse espaces multiples
export const normalizeString = (v: string) => v.trim().replace(/\s+/g, " ");

// First letter of each word uppercase
export const capitalizeWords = (v: string) =>
  normalizeString(v)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Only first word uppercase
export const capitalizeFirstWord = (v: string) => {
  const s = normalizeString(v).toLowerCase();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Uppercase total
export const upper = (v: string) => normalizeString(v).toUpperCase();

// Lowercase total
export const lower = (v: string) => normalizeString(v).toLowerCase();

// Unicode normalization (utile pour accents)
export const unicodeNormalize = (v: string) => v.normalize("NFC");

// ---------------------------
// OBJECT NORMALIZATION BEFORE SUBMIT
// ---------------------------

// src/lib/normalize.ts

// Le résultat : pour chaque clé
// - si elle est dans numbers → number|null
// - si elle est dans dates   → Date|null
// - sinon                     → type d'origine
export type NormalizeResult<
  T extends Record<string, any>,
  RN extends readonly (keyof T)[] = [],
  ON extends readonly (keyof T)[] = [],
  RD extends readonly (keyof T)[] = [],
  OD extends readonly (keyof T)[] = [],
  OS extends readonly (keyof T)[] = [], // Optional Strings
> = {
  [K in keyof T]: // nombres obligatoires → number
  K extends RN[number]
    ? T[K] extends string | null | undefined
      ? number
      : T[K]
    : // nombres optionnels → number | null
      K extends ON[number]
      ? T[K] extends string | null | undefined
        ? number | null
        : T[K]
      : // dates obligatoires → Date
        K extends RD[number]
        ? T[K] extends string | null | undefined
          ? Date
          : T[K]
        : // dates optionnelles → Date | null
          K extends OD[number]
          ? T[K] extends string | null | undefined
            ? Date | null
            : T[K]
          : // strings optionnelles nullable → string | null
            K extends OS[number]
            ? T[K] extends string | null | undefined
              ? string | null
              : T[K]
            : // le reste inchangé
              T[K];
};

export function normalizeForSubmit<
  T extends Record<string, any>,
  RN extends readonly (keyof T)[] = [],
  ON extends readonly (keyof T)[] = [],
  RD extends readonly (keyof T)[] = [],
  OD extends readonly (keyof T)[] = [],
  OS extends readonly (keyof T)[] = [],
>(
  values: T,
  config: {
    requiredNumbers?: RN;
    optionalNumbers?: ON;
    requiredDates?: RD;
    optionalDates?: OD;
    optionalStrings?: OS; // 👈 colonnes texte nullable en DB
    // si tu veux désactiver le comportement pour certains cas, tu peux
    nullifyEmptyOptionalStrings?: boolean; // défaut: true
  },
): NormalizeResult<T, RN, ON, RD, OD, OS> {
  const {
    requiredNumbers,
    optionalNumbers,
    requiredDates,
    optionalDates,
    optionalStrings,
    nullifyEmptyOptionalStrings = true,
  } = config;

  const requiredNumbersSet = new Set<keyof T>(
    (requiredNumbers ?? []) as readonly (keyof T)[],
  );
  const optionalNumbersSet = new Set<keyof T>(
    (optionalNumbers ?? []) as readonly (keyof T)[],
  );
  const requiredDatesSet = new Set<keyof T>(
    (requiredDates ?? []) as readonly (keyof T)[],
  );
  const optionalDatesSet = new Set<keyof T>(
    (optionalDates ?? []) as readonly (keyof T)[],
  );
  const optionalStringsSet = new Set<keyof T>(
    (optionalStrings ?? []) as readonly (keyof T)[],
  );

  const out: any = { ...values };

  for (const key in values) {
    const k = key as keyof T;
    const v = values[k];

    const isOptionalNumber = optionalNumbersSet.has(k);
    const isOptionalDate = optionalDatesSet.has(k);
    const isRequiredNumber = requiredNumbersSet.has(k);
    const isRequiredDate = requiredDatesSet.has(k);
    const isOptionalString = optionalStringsSet.has(k);

    // 1) Gestion des strings vides pour les *strings optionnelles* (nullable en DB)
    if (
      nullifyEmptyOptionalStrings &&
      isOptionalString &&
      typeof v === "string" &&
      v.trim() === ""
    ) {
      out[k] = null; // type: string | null
      continue;
    }

    // 2) Gestion des "" pour les nombres/dates optionnels
    if (v === "") {
      if (isOptionalNumber || isOptionalDate) {
        out[k] = null; // number|null ou Date|null
        continue;
      }
      // pour les champs "required", on laisse "" tel quel :
      // => si ça arrive, c'est une erreur de validation front (form schema)
      out[k] = v;
      continue;
    }

    // 3) Conversion nombres
    if (isRequiredNumber || isOptionalNumber) {
      if (v === null || v === undefined) {
        out[k] = isOptionalNumber ? null : v;
      } else {
        out[k] = Number(v as any);
      }
      continue;
    }

    // 4) Conversion dates
    if (isRequiredDate || isOptionalDate) {
      if (v === null || v === undefined) {
        out[k] = isOptionalDate ? null : v;
      } else {
        out[k] = new Date(v as any);
      }
      continue;
    }

    // 5) Par défaut : on laisse tel quel
    out[k] = v;
  }

  return out as NormalizeResult<T, RN, ON, RD, OD, OS>;
}
