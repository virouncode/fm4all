import {
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { user } from "./auth";
import { prospects } from "./prospects";

export const clients = pgTable(
  "clients",
  {
    id: serial().primaryKey(),
    prospectId: integer("prospect_id").references(() => prospects.id, {
      onDelete: "set null",
    }),
    nomEntreprise: varchar("nom_entreprise").notNull(),
    siret: varchar(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("clients_siret_idx").on(table.siret),
    index("clients_created_at_idx").on(table.createdAt),
    uniqueIndex("clients_prospect_id_udx").on(table.prospectId),
  ],
);
