import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { typeEau, typePose } from "./enums";

export const fontaines = pgTable("fontaines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const fontainesTarifs = pgTable(
  "fontaines_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    type: typeEau().notNull(),
    typePose: typePose("type_pose").notNull(),
    nbPersonnes: integer("nb_personnes").notNull(),
    oneShot: integer("one_shot"),
    pa12M: integer("pa_12m"),
    rac12M: integer("rac_12m"),
    pa24M: integer("pa_24m"),
    rac24M: integer("rac_24m"),
    pa36M: integer("pa_36m"),
    pa48M: integer("pa_48m"),
    pa60M: integer("pa_60m"),
    paMaintenance: integer("pa_maintenance"),
    fraisInstallation: integer("frais_installation"),
    paConsoFiltres: integer("pa_conso_filtres"),
    paConsoCO2: integer("pa_conso_co2"),
    paConsoEauChaude: integer("pa_conso_eau_chaude"),
    fontaineId: integer("fontaine_id"),
    reconditionne: boolean().default(false),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fontaines_tarifs_fournisseur_type_nb_personnes_idx").on(
      table.fournisseurId,
      table.type,
      table.nbPersonnes,
    ),
    index("fontaines_tarifs_fontaine_id_idx").on(table.fontaineId),
  ],
);
