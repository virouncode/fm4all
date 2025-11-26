import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import {
  ticketPrioriteEnum,
  ticketStatusEnum,
  typeBatimentEnum,
  typeOccupationEnum,
} from "./enums";

export const clientFournisseurs = pgTable(
  "client_fournisseurs",
  {
    clientId: integer("client_id").notNull(),
    fournisseurId: integer("fournisseur_id").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.clientId, table.fournisseurId] }),
    index("client_fournisseurs_client_idx").on(table.clientId),
    index("client_fournisseurs_fournisseur_idx").on(table.fournisseurId),
  ],
);

export const sites = pgTable(
  "sites",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    nomSite: varchar("nom_site").notNull(),
    adresseLigne1: varchar("adresse_ligne_1"),
    adresseLigne2: varchar("adresse_ligne_2"),
    codePostal: varchar("code_postal").notNull(),
    ville: varchar().notNull(),
    surface: integer(),
    effectif: integer(),
    typeBatiment: typeBatimentEnum("type_batiment"),
    typeOccupation: typeOccupationEnum("type_occupation"),
    commentaires: varchar(),
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

export const tickets = pgTable(
  "tickets",
  {
    id: serial().primaryKey(),
    clientId: integer("client_id").notNull(),
    siteId: integer("site_id"),
    fournisseurId: integer("fournisseur_id"),
    createdByUserId: text("created_by_user_id").notNull(),
    titre: varchar().notNull(),
    description: varchar(),
    // Tu peux laisser ça en varchar si tu veux éviter un enum tout de suite
    categorie: varchar(),
    priorite: ticketPrioriteEnum("priorite").notNull().default("normale"),
    status: ticketStatusEnum("status").notNull().default("nouveau"),
    dateCloture: date("date_cloture", { mode: "string" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tickets_client_id_idx").on(table.clientId),
    index("tickets_site_id_idx").on(table.siteId),
    index("tickets_fournisseur_id_idx").on(table.fournisseurId),
    index("tickets_created_by_user_id_idx").on(table.createdByUserId),
    index("tickets_status_idx").on(table.status),
    index("tickets_priorite_idx").on(table.priorite),
  ],
);
