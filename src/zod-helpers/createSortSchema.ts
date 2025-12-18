import { z } from "zod";

export function createSortSchema<
  TSortableKey extends string,
  TDefaultKey extends TSortableKey,
>(
  sortableColumns: Record<TSortableKey, unknown>,
  defaultOrderBy: TDefaultKey,
  defaultOrderDir: "asc" | "desc" = "desc",
) {
  const sortableKeys = Object.keys(sortableColumns) as TSortableKey[];
  return z.object({
    orderBy: z.preprocess(
      (v) => (Array.isArray(v) ? v[0] : v),
      // enum dynamiquement en fonction des clés
      z
        .enum(sortableKeys as [TSortableKey, ...TSortableKey[]])
        .catch(defaultOrderBy),
    ),
    orderDir: z.preprocess(
      (v) => (Array.isArray(v) ? v[0] : v),
      z.enum(["asc", "desc"]).catch(defaultOrderDir),
    ),
  });
}
