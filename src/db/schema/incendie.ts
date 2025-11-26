import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { typeColonneEnum, typePorteEnum } from "./enums";

export const incendieQuantites = pgTable(
  "incendie_quantites",
  {
    id: serial().primaryKey(),
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
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    surface: integer().notNull(),
    prixParExtincteur: integer("prix_par_extincteur").notNull(),
    prixParBaes: integer("prix_par_baes").notNull(),
    prixParTelBaes: integer("prix_par_tel_baes").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("incendie_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const exutoiresTarifs = pgTable(
  "exutoires_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_tarifs_fournisseur_nb_exutoires_idx").on(
      table.fournisseurId,
      table.nbExutoires,
    ),
  ],
);

export const exutoiresParkingTarifs = pgTable(
  "exutoires_parking_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    nbExutoires: integer("nb_exutoires").notNull(),
    prixParExutoire: integer("prix_par_exutoire").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("exutoires_parking_tarifs_fournisseur_nb_exutoires_idx").on(
      table.fournisseurId,
      table.nbExutoires,
    ),
  ],
);

export const alarmesTarifs = pgTable(
  "alarmes_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    nbPoints: integer("nb_points").notNull(),
    prixParControle: integer("prix_par_controle").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("alarmes_tarifs_fournisseur_nb_points_idx").on(
      table.fournisseurId,
      table.nbPoints,
    ),
  ],
);

export const portesCoupeFeuTarifs = pgTable(
  "portes_coupe_feu_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    type: typePorteEnum().notNull(),
    prixParPorte: integer("prix_par_porte").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("portes_coupe_feu_tarifs_fournisseur_type_idx").on(
      table.fournisseurId,
      table.type,
    ),
  ],
);

export const riaTarifs = pgTable(
  "ria_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    prixParRIA: integer("prix_par_ria").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("ria_tarifs_fournisseur_idx").on(table.fournisseurId)],
);

export const colonnesSechesTarifs = pgTable(
  "colonnes_seches_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    type: typeColonneEnum().notNull(),
    prixParColonne: integer("prix_par_colonne").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("colonnes_seches_tarifs_fournisseur_type_idx").on(
      table.fournisseurId,
      table.type,
    ),
  ],
);
