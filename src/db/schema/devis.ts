import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { prospects } from "./prospects";

export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: serial().primaryKey(),
    prospectId: integer("prospect_id").references(() => prospects.id),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_prospect_id_idx").on(table.prospectId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);

export const devis = pgTable(
  "devis",
  {
    id: serial().primaryKey(),
    prospectId: integer("prospect_id").references(() => prospects.id),
    devisUrl: varchar("devis_url").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_prospect_id_idx").on(table.prospectId),
    index("devis_created_at_idx").on(table.createdAt),
  ],
);
