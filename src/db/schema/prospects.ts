import { date, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./user";
import { typeBatimentEnum, typeOccupationEnum } from "./enums";

export const prospects = pgTable(
  "prospects",
  {
    id: id(),
    nomEntreprise: varchar("nom_entreprise").notNull(),
    siret: varchar(),
    prenomContact: varchar("prenom_contact").notNull(),
    nomContact: varchar("nom_contact").notNull(),
    posteContact: varchar("poste_contact").notNull(),
    emailContact: varchar("email_contact").notNull(),
    phoneContact: varchar("phone_contact").notNull(),
    prenomSignataire: varchar("prenom_signataire"),
    nomSignataire: varchar("nom_signataire"),
    posteSignataire: varchar("poste_signataire"),
    emailSignataire: varchar("email_signataire"),
    surface: integer().notNull(),
    effectif: integer().notNull(),
    typeBatiment: typeBatimentEnum("type_batiment").notNull(),
    typeOccupation: typeOccupationEnum("type_occupation").notNull(),
    adresseLigne1: varchar("adresse_ligne_1"),
    adresseLigne2: varchar("adresse_ligne_2"),
    codePostal: varchar("code_postal").notNull(),
    ville: varchar().notNull(),
    dateDeDemarrage: date("date_de_demarrage", { mode: "string" }),
    commentaires: varchar(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("prospects_email_contact_idx").on(table.emailContact),
    index("prospects_siret_idx").on(table.siret),
    index("prospects_code_postal_idx").on(table.codePostal),
    index("prospects_ville_idx").on(table.ville),
    index("prospects_created_at_idx").on(table.createdAt),
  ],
);
