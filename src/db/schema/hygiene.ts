import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { gammeEnum, typeHygieneEnum } from "./enums";

export const hygieneDistribQuantites = pgTable(
  "hygiene_distrib_quantites",
  {
    id: id(),
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
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    type: typeHygieneEnum().notNull(),
    gamme: gammeEnum().notNull(),
    oneShot: integer("one_shot"),
    pa12M: integer("pa_12m"),
    pa24M: integer("pa_24m"),
    pa36M: integer("pa_36m"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_distrib_tarifs_entreprise_idx").on(table.entrepriseId),
    index("hygiene_distrib_tarifs_entreprise_type_gamme_idx").on(
      table.entrepriseId,
      table.type,
      table.gamme,
    ),
  ],
);

export const hygieneMinFacturation = pgTable(
  "hygiene_min_facturation",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    minFacturation: integer("min_facturation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_min_facturation_entreprise_idx").on(table.entrepriseId),
  ],
);

export const hygieneInstalDistribTarifs = pgTable(
  "hygiene_instal_distrib_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixInstallation: integer("prix_installation").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_instal_distrib_tarifs_entreprise_effectif_idx").on(
      table.entrepriseId,
      table.effectif,
    ),
  ],
);

export const hygieneConsoTarifs = pgTable(
  "hygiene_conso_tarifs",
  {
    id: id(),
    effectif: integer(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    paParPersonneEmp: integer("pa_par_personne_emp").notNull(),
    paParPersonneSavon: integer("pa_par_personne_savon").notNull(),
    paParPersonnePh: integer("pa_par_personne_ph").notNull(),
    paParPersonneDesinfectant: integer(
      "pa_par_personne_desinfectant",
    ).notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("hygiene_conso_tarifs_entreprise_effectif_idx").on(
      table.entrepriseId,
      table.effectif,
    ),
  ],
);
