import {
  AnyPgColumn,
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";

export const user = pgTable(
  "user",
  {
    id: id(),
    parentId: uuid("parent_id").references((): AnyPgColumn => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    prenom: text("prenom").notNull(),
    nom: text("nom").notNull(),
    phone: text("phone"),
    email: text("email").unique().notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    avatarId: uuid("avatar_id").references((): AnyPgColumn => documents.id, {
      onDelete: "set null",
    }),
    onboardingCompleted: jsonb("onboarding_completed")
      .$type<Record<string, boolean>>()
      .default({})
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: uuid("created_by_id").references((): AnyPgColumn => user.id, {
      onDelete: "set null",
    }),
    updatedById: uuid("updated_by_id").references((): AnyPgColumn => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("user_phone_idx").on(table.phone)],
);
