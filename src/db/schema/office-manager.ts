import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { gammeEnum } from "./enums";

export const officeManagerQuantites = pgTable(
  "office_manager_quantites",
  {
    id: id(),
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
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    demiTjm: integer("demi_tjm").notNull(),
    demiTjmPremium: integer("demi_tjm_premium").notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("office_manager_tarifs_entreprise_idx").on(table.entrepriseId),
  ],
);
