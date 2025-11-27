import { index, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { clients } from "./clients";
import { fournisseurs } from "./fournisseurs";

export const clientFournisseurs = pgTable(
  "client_fournisseurs",
  {
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),

    fournisseurId: integer("fournisseur_id")
      .notNull()
      .references(() => fournisseurs.id, { onDelete: "cascade" }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.clientId, table.fournisseurId] }),
    index("client_fournisseurs_client_idx").on(table.clientId),
    index("client_fournisseurs_fournisseur_idx").on(table.fournisseurId),
  ],
);
