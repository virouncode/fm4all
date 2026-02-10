import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { gammeEnum } from "./enums";

export const maintenanceQuantites = pgTable(
  "maintenance_quantites",
  {
    id: id(),
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
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    surface: integer().notNull(),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    gamme: gammeEnum().notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("maintenance_tarifs_entreprise_surface_gamme_idx").on(
      table.entrepriseId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const legioTarifs = pgTable(
  "legio_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("legio_tarifs_entreprise_surface_idx").on(
      table.entrepriseId,
      table.surface,
    ),
  ],
);

export const q18Tarifs = pgTable(
  "q18_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("q18_tarifs_entreprise_surface_idx").on(
      table.entrepriseId,
      table.surface,
    ),
  ],
);

export const qualiteAirTarifs = pgTable(
  "qualite_air_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    surface: integer().notNull(),
    prixAnnuel: integer("prix_annuel").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("qualite_air_tarifs_entreprise_surface_idx").on(
      table.entrepriseId,
      table.surface,
    ),
  ],
);
