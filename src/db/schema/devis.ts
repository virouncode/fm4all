import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";

export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_client_id_idx").on(table.clientId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);

export const devis = pgTable(
  "devis",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    devisUrl: varchar("devis_url").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_client_id_idx").on(table.clientId),
    index("devis_created_at_idx").on(table.createdAt),
  ],
);
