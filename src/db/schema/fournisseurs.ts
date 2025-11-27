import { date, index, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { statusEnum } from "./enums";

export const fournisseurs = pgTable(
  "fournisseurs",
  {
    id: serial().primaryKey(),
    nomFournisseur: varchar("nom_fournisseur").notNull(),
    siret: varchar().notNull(),
    prenomContact: varchar("prenom_contact").notNull(),
    nomContact: varchar("nom_contact").notNull(),
    emailContact: varchar("email_contact").unique().notNull(),
    phoneContact: varchar("phone_contact").notNull(),
    dateChiffrage: date("date_chiffrage", { mode: "string" }),
    status: statusEnum().notNull().default("active"),
    slogan: varchar(),
    presentation: varchar(),
    logoUrl: varchar("logo_url"),
    locationUrl: varchar("location_url"),
    anneeCreation: varchar("annee_creation"),
    ca: varchar(),
    effectif: varchar(),
    nbClients: varchar("nb_clients"),
    noteGoogle: varchar("note_google"),
    nbAvis: varchar("nb_avis"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fournisseurs_status_idx").on(table.status),
    index("fournisseurs_siret_idx").on(table.siret),
    index("fournisseurs_created_at_idx").on(table.createdAt),
  ],
);

export const logosFournisseurs = pgTable("logos_fournisseurs", {
  id: serial().primaryKey(),
  url: varchar().notNull(),
  type: varchar().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
