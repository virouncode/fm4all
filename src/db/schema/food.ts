import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { gammeEnum } from "./enums";

export const fruitsQuantites = pgTable(
  "fruits_quantites",
  {
    id: serial().primaryKey(),
    gParSemaineParPersonne: integer("g_par_semaine_par_personne").notNull(),
    minKgParSemaine: integer("min_kg_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("fruits_quantites_gamme_idx").on(table.gamme)],
);

export const fruitsTarifs = pgTable(
  "fruits_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixKg: integer("prix_kg"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fruits_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const snacksQuantites = pgTable(
  "snacks_quantites",
  {
    id: serial().primaryKey(),
    portionsParSemaineParPersonne: integer(
      "portions_par_semaine_par_personne",
    ).notNull(),
    minPortionsParSemaine: integer("min_portions_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("snacks_quantites_gamme_idx").on(table.gamme)],
);

export const snacksTarifs = pgTable(
  "snacks_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("snacks_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const boissonsQuantites = pgTable(
  "boissons_quantites",
  {
    id: serial().primaryKey(),
    consosParSemaineParPersonne: integer(
      "consos_par_semaine_par_personne",
    ).notNull(),
    gamme: gammeEnum().notNull(),
    minConsosParSemaine: integer("min_consos_par_semaine").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("boissons_quantites_gamme_idx").on(table.gamme)],
);

export const boissonsTarifs = pgTable(
  "boissons_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("boissons_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const foodLivraisonTarifs = pgTable(
  "food_livraison_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    freqAnnuelle: integer("freq_annuelle").notNull(),
    panierMin: integer("panier_min"),
    prixUnitaire: integer("prix_unitaire").notNull(),
    prixUnitaireSiCafe: integer("prix_unitaire_si_cafe").notNull(),
    seuilFranco: integer("seuil_franco"),
    remiseSiCafe: integer("remise_si_cafe"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("food_livraison_tarifs_fournisseur_freq_idx").on(
      table.fournisseurId,
      table.freqAnnuelle,
    ),
  ],
);
