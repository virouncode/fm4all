import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
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
import { user } from "./auth";
import { entreprises } from "./entreprises";
import { typeBatimentEnum, typeOccupationEnum } from "./enums";

export const sites = pgTable(
  "sites",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => sites.id, {
      onDelete: "restrict",
    }),
    nom: varchar("nom").notNull(),
    adresseLigne1: varchar("adresse_ligne_1").notNull(),
    adresseLigne2: varchar("adresse_ligne_2"),
    codePostal: varchar("code_postal").notNull(),
    ville: varchar().notNull(),
    surface: integer().notNull(),
    effectif: integer().notNull(),
    typeBatiment: typeBatimentEnum("type_batiment").notNull(),
    typeOccupation: typeOccupationEnum("type_occupation").notNull(),
    commentaires: varchar(),
    actif: boolean("actif").default(true).notNull(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("sites_entreprise_id_idx").on(table.entrepriseId),
    index("sites_code_postal_idx").on(table.codePostal),
    index("sites_ville_idx").on(table.ville),
    index("sites_created_at_idx").on(table.createdAt),
    index("sites_parent_id_idx").on(table.parentId),
  ],
);

export const sitesArborescence = pgTable(
  "sites_arborescence",
  {
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),
    ancetreId: uuid("ancetre_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    descendantId: uuid("descendant_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    profondeur: smallint("profondeur").notNull(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.entrepriseId, t.ancetreId, t.descendantId] }),
    index("sites_arborescence_anc_idx").on(t.entrepriseId, t.ancetreId),
    index("sites_arborescence_desc_idx").on(t.entrepriseId, t.descendantId),
  ],
);
