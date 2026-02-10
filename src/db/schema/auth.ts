import {
  AnyPgColumn,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";

export const user = pgTable(
  "user",
  {
    id: id(),
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

export const session = pgTable(
  "session",
  {
    id: id(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // token est unique() → index implicite
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "account",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_udx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expires_at_idx").on(table.expiresAt),
  ],
);
