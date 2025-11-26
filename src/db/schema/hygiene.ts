import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import { gammeEnum, typeHygieneEnum } from "./enums";

export const hygieneDistribQuantites = pgTable(
  "hygiene_distrib_quantites",
  {
    id: serial().primaryKey(),
    effectif: integer().notNull(),
    nbDistribEmp: integer("nb_distrib_emp").notNull(),
    nbDistribSavon: integer("nb_distrib_savon").notNull(),
    nbDistribPh: integer("nb_distrib_ph").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_distrib_quantites_effectif_idx").on(table.effectif),
  ],
);

export const hygieneDistribTarifs = pgTable(
  "hygiene_distrib_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    type: typeHygieneEnum().notNull(),
    gamme: gammeEnum().notNull(),
    oneShot: integer("one_shot"),
    pa12M: integer("pa_12m"),
    pa24M: integer("pa_24m"),
    pa36M: integer("pa_36m"),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_distrib_tarifs_fournisseur_idx").on(table.fournisseurId),
    index("hygiene_distrib_tarifs_fournisseur_type_gamme_idx").on(
      table.fournisseurId,
      table.type,
      table.gamme,
    ),
  ],
);

export const hygieneMinFacturation = pgTable(
  "hygiene_min_facturation",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    minFacturation: integer("min_facturation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_min_facturation_fournisseur_idx").on(table.fournisseurId),
  ],
);

export const hygieneInstalDistribTarifs = pgTable(
  "hygiene_instal_distrib_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixInstallation: integer("prix_installation").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_instal_distrib_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const hygieneConsoTarifs = pgTable(
  "hygiene_conso_tarifs",
  {
    id: serial().primaryKey(),
    effectif: integer(),
    fournisseurId: integer("fournisseur_id").notNull(),
    paParPersonneEmp: integer("pa_par_personne_emp").notNull(),
    paParPersonneSavon: integer("pa_par_personne_savon").notNull(),
    paParPersonnePh: integer("pa_par_personne_ph").notNull(),
    paParPersonneDesinfectant: integer(
      "pa_par_personne_desinfectant",
    ).notNull(),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);
