import {
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./user";

export const services = pgTable(
  "services",
  {
    id: id(),
    nom: varchar("nom").notNull(),
    description: text("description"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("services_nom_udx").on(table.nom),
    index("services_created_at_idx").on(table.createdAt),
  ],
);
