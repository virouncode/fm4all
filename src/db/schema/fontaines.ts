import {
  boolean,
  index,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { typeEau, typePose } from "./enums";

export const fontaines = pgTable("fontaines", {
  id: id(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  infos: varchar(),
  imageId: uuid("image_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const fontainesTarifs = pgTable(
  "fontaines_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
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
    fontaineId: uuid("fontaine_id").references(() => fontaines.id, {
      onDelete: "set null",
    }),
    reconditionne: boolean().default(false),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fontaines_tarifs_entreprise_type_nb_personnes_idx").on(
      table.entrepriseId,
      table.type,
      table.nbPersonnes,
    ),
    index("fontaines_tarifs_fontaine_id_idx").on(table.fontaineId),
  ],
);
