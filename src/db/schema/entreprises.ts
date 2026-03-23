import {
  AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { documents } from "./documents";
import { roleEntrepriseEnum } from "./enums";
import { prospects } from "./prospects";
import { user } from "./user";

export const entreprises = pgTable(
  "entreprises",
  {
    id: id(),
    nom: text("nom").notNull(),
    siret: text("siret").notNull().unique(),
    prospectId: uuid("prospect_id").references(() => prospects.id, {
      onDelete: "set null",
    }),
    logoId: uuid("logo_id").references((): AnyPgColumn => documents.id, {
      onDelete: "set null",
    }),
    numeroTva: text("numero_tva"),
    adresseLigne1: text("adresse_ligne1"),
    adresseLigne2: text("adresse_ligne2"),
    codePostal: varchar("code_postal", { length: 10 }),
    ville: varchar("ville"),
    formeJuridique: varchar("forme_juridique"),
    sireneSyncedAt: timestamp("sirene_synced_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: uuid("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // siret est unique() → index implicite
    index("entreprises_prospect_id_idx").on(table.prospectId),
    index("entreprises_created_at_idx").on(table.createdAt),
  ],
);

export const entrepriseInfos = pgTable(
  "entreprise_infos",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    slogan: varchar("slogan", { length: 512 }),
    presentation: text("presentation"),
    noteGoogle: varchar("note_google", { length: 4 }),
    nbAvis: integer("nb_avis"),
    anneeCreation: integer("annee_creation"),
    nbClients: integer("nb_clients"),
    ca: varchar("ca"),
    effectif: varchar("effectif"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("entreprise_infos_entreprise_id_udx").on(table.entrepriseId),
  ],
);

export const entrepriseRoles = pgTable(
  "entreprise_roles",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    role: roleEntrepriseEnum("role").notNull(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("entreprise_roles_entreprise_id_idx").on(table.entrepriseId),
    uniqueIndex("entreprise_roles_entreprise_role_udx").on(
      table.entrepriseId,
      table.role,
    ),
  ],
);
