import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { gammeEnum } from "./enums";

export const officeManagerQuantites = pgTable(
  "office_manager_quantites",
  {
    id: serial().primaryKey(),
    effectif: integer().notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    demiJParSemaine: integer("demi_j_par_semaine").notNull(),
    majoration: integer().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("office_manager_quantites_effectif_surface_idx").on(
      table.effectif,
      table.surface,
    ),
    index("office_manager_quantites_gamme_idx").on(table.gamme),
  ],
);

export const officeManagerTarifs = pgTable(
  "office_manager_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    demiTjm: integer("demi_tjm").notNull(),
    demiTjmPremium: integer("demi_tjm_premium").notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("office_manager_tarifs_fournisseur_idx").on(table.fournisseurId),
  ],
);
