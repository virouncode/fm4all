import {
  index,
  integer,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";

export const services = pgTable("services", {
  id: serial().primaryKey(),
  nom: varchar("nom").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const servicesFournisseurs = pgTable(
  "services_fournisseurs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    serviceId: integer("service_id").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("services_fournisseurs_uniq").on(
      table.fournisseurId,
      table.serviceId,
    ),
    index("services_fournisseurs_fournisseur_idx").on(table.fournisseurId),
    index("services_fournisseurs_service_idx").on(table.serviceId),
  ],
);
