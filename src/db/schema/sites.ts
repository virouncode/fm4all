import {
  index,
  integer,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { user } from "./auth";
import { typeBatimentEnum, typeOccupationEnum } from "./enums";

export const sites = pgTable(
  "sites",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    nomSite: varchar("nom_site").notNull(),
    adresseLigne1: varchar("adresse_ligne_1").notNull(),
    adresseLigne2: varchar("adresse_ligne_2"),
    codePostal: varchar("code_postal").notNull(),
    ville: varchar().notNull(),
    surface: integer().notNull(),
    effectif: integer().notNull(),
    typeBatiment: typeBatimentEnum("type_batiment").notNull(),
    typeOccupation: typeOccupationEnum("type_occupation").notNull(),
    commentaires: varchar(),
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
    index("sites_client_id_idx").on(table.clientId),
    index("sites_code_postal_idx").on(table.codePostal),
    index("sites_ville_idx").on(table.ville),
    index("sites_created_at_idx").on(table.createdAt),
  ],
);
