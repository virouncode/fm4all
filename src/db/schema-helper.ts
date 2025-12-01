import { serial, timestamp } from "drizzle-orm/pg-core";

export const id = (name: string = "id") => serial(name).primaryKey();

export const createdAt = (name: string = "created_at") =>
  timestamp(name, { withTimezone: true, mode: "date", precision: 3 })
    .notNull()
    .defaultNow();

export const updatedAt = (name: string = "updated_at") =>
  timestamp(name, { withTimezone: true, mode: "date", precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
