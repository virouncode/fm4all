import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { gammeEnum } from "./enums";

export const fruitsQuantites = pgTable(
  "fruits_quantites",
  {
    id: id(),
    gParSemaineParPersonne: integer("g_par_semaine_par_personne").notNull(),
    minKgParSemaine: integer("min_kg_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fruits_quantites_gamme_idx").on(table.gamme),
    uniqueIndex("fruits_quantites_gamme_udx").on(table.gamme),
  ],
);

export const fruitsTarifs = pgTable(
  "fruits_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixKg: integer("prix_kg"),
    gamme: gammeEnum().notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("fruits_tarifs_entreprise_gamme_effectif_idx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
    uniqueIndex("fruits_tarifs_entreprise_gamme_effectif_udx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const snacksQuantites = pgTable(
  "snacks_quantites",
  {
    id: id(),
    portionsParSemaineParPersonne: integer(
      "portions_par_semaine_par_personne",
    ).notNull(),
    minPortionsParSemaine: integer("min_portions_par_semaine").notNull(),
    gamme: gammeEnum().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("snacks_quantites_gamme_idx").on(table.gamme),
    uniqueIndex("snacks_quantites_gamme_udx").on(table.gamme),
  ],
);

export const snacksTarifs = pgTable(
  "snacks_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("snacks_tarifs_entreprise_gamme_effectif_idx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
    uniqueIndex("snacks_tarifs_entreprise_gamme_effectif_udx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const boissonsQuantites = pgTable(
  "boissons_quantites",
  {
    id: id(),
    consosParSemaineParPersonne: integer(
      "consos_par_semaine_par_personne",
    ).notNull(),
    gamme: gammeEnum().notNull(),
    minConsosParSemaine: integer("min_consos_par_semaine").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("boissons_quantites_gamme_idx").on(table.gamme),
    uniqueIndex("boissons_quantites_gamme_udx").on(table.gamme),
  ],
);

export const boissonsTarifs = pgTable(
  "boissons_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    gamme: gammeEnum().notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("boissons_tarifs_entreprise_gamme_effectif_idx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
    uniqueIndex("boissons_tarifs_entreprise_gamme_effectif_udx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const foodLivraisonTarifs = pgTable(
  "food_livraison_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
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
    index("food_livraison_tarifs_entreprise_freq_idx").on(
      table.entrepriseId,
      table.freqAnnuelle,
    ),
    uniqueIndex("food_livraison_tarifs_entreprise_freq_udx").on(
      table.entrepriseId,
      table.freqAnnuelle,
    ),
  ],
);
