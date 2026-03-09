import { AnyPgColumn, timestamp, uuid } from "drizzle-orm/pg-core";

export const id = (name: string = "id") =>
  uuid(name).defaultRandom().primaryKey();

export const createdAt = (name: string = "created_at") =>
  timestamp(name, { withTimezone: true, mode: "date", precision: 3 })
    .notNull()
    .defaultNow();

export const updatedAt = (name: string = "updated_at") =>
  timestamp(name, { withTimezone: true, mode: "date", precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date", precision: 3 });

// Accepte soit une table (évaluée immédiatement), soit une fonction (évaluée de manière lazy)
type IdRefType =
  | AnyPgColumn
  | { id: AnyPgColumn }
  | (() => AnyPgColumn | { id: AnyPgColumn });

const resolveIdColumn = (ref: IdRefType): AnyPgColumn => {
  const resolved = typeof ref === "function" ? ref() : ref;
  return "id" in resolved ? resolved.id : (resolved as AnyPgColumn);
};

export const createdById = (ref: IdRefType, name: string = "created_by_id") =>
  uuid(name).references((): AnyPgColumn => resolveIdColumn(ref), {
    onDelete: "set null",
  });

export const updatedById = (ref: IdRefType, name: string = "updated_by_id") =>
  uuid(name).references((): AnyPgColumn => resolveIdColumn(ref), {
    onDelete: "set null",
  });
