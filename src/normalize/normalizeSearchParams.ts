export type RawSearchParams = {
  [key: string]: string | string[] | undefined;
};

export function normalizeSearchParams(
  raw: RawSearchParams,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const key in raw) {
    result[key] = Array.isArray(raw[key]) ? raw[key][0] : raw[key];
  }

  return result;
}
