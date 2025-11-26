import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { gammeEnum } from "./enums";

export const maintenanceQuantites = pgTable(
  "maintenance_quantites",
  {
    id: serial().primaryKey(),
    surface: integer().notNull(),
    freqAnnuelle: integer("freq_annuelle").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("maintenance_quantites_surface_gamme_idx").on(
      table.surface,
      table.gamme,
    ),
    index("maintenance_quantites_freq_idx").on(table.freqAnnuelle),
  ],
);

export const maintenanceTarifs = pgTable(
  "maintenance_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    surface: integer().notNull(),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    gamme: gammeEnum().notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("maintenance_tarifs_fournisseur_surface_gamme_idx").on(
      table.fournisseurId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const legioTarifs = pgTable(
  "legio_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("legio_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const q18Tarifs = pgTable(
  "q18_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("q18_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);

export const qualiteAirTarifs = pgTable(
  "qualite_air_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("qualite_air_tarifs_fournisseur_surface_idx").on(
      table.fournisseurId,
      table.surface,
    ),
  ],
);
