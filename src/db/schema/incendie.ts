import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { typeColonneEnum, typePorteEnum } from "./enums";

export const incendieQuantites = pgTable(
  "incendie_quantites",
  {
    id: id(),
    surface: integer().notNull(),
    nbExtincteurs: integer("nb_extincteurs").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("incendie_quantites_surface_idx").on(table.surface)],
);

export const incendieTarifs = pgTable(
  "incendie_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    surface: integer().notNull(),
    prixParExtincteur: integer("prix_par_extincteur").notNull(),
    prixParBaes: integer("prix_par_baes").notNull(),
    prixParTelBaes: integer("prix_par_tel_baes").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("incendie_tarifs_entreprise_surface_idx").on(
      table.entrepriseId,
      table.surface,
    ),
  ],
);

export const exutoiresTarifs = pgTable(
  "exutoires_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_tarifs_entreprise_nb_exutoires_idx").on(
      table.entrepriseId,
      table.nbExutoires,
    ),
  ],
);

export const exutoiresParkingTarifs = pgTable(
  "exutoires_parking_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_parking_tarifs_entreprise_nb_exutoires_idx").on(
      table.entrepriseId,
      table.nbExutoires,
    ),
  ],
);

export const alarmesTarifs = pgTable(
  "alarmes_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    nbPoints: integer("nb_points").notNull(),
    prixParControle: integer("prix_par_controle").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("alarmes_tarifs_entreprise_nb_points_idx").on(
      table.entrepriseId,
      table.nbPoints,
    ),
  ],
);

export const portesCoupeFeuTarifs = pgTable(
  "portes_coupe_feu_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    type: typePorteEnum().notNull(),
    prixParPorte: integer("prix_par_porte").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("portes_coupe_feu_tarifs_entreprise_type_idx").on(
      table.entrepriseId,
      table.type,
    ),
  ],
);

export const riaTarifs = pgTable(
  "ria_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    prixParRIA: integer("prix_par_ria").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ria_tarifs_entreprise_idx").on(table.entrepriseId)],
);

export const colonnesSechesTarifs = pgTable(
  "colonnes_seches_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    type: typeColonneEnum().notNull(),
    prixParColonne: integer("prix_par_colonne").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("colonnes_seches_tarifs_entr_type_idx").on(
      table.entrepriseId,
      table.type,
    ),
  ],
);
