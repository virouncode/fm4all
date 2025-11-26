import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { gammeEnum } from "./enums";

export const nettoyageQuantites = pgTable(
  "nettoyage_quantites",
  {
    id: serial().primaryKey(),
    freqAnnuelle: integer("freq_annuelle").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_quantites_gamme_surface_idx").on(
      table.gamme,
      table.surface,
    ),
    index("nettoyage_quantites_freq_idx").on(table.freqAnnuelle),
  ],
);

export const nettoyageTarifs = pgTable(
  "nettoyage_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("nettoyage_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageRepasseTarifs = pgTable(
  "nettoyage_repasse_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_repasse_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("nettoyage_repasse_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageVitrerieTarifs = pgTable(
  "nettoyage_vitrerie_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    cadenceVitres: integer("cadence_vitres").notNull(),
    cadenceCloisons: integer("cadence_cloisons").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    minFacturation: integer("min_facturation").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_vitrerie_tarifs_fournisseur_idx").on(table.fournisseurId),
  ],
);
