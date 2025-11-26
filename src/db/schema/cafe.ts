import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schema-helper";
import {
  gammeEnum,
  possibiliteEnum,
  typeChocolatEnum,
  typeLaitEnum,
  typeMachineEnum,
} from "./enums";

export const cafeMachines = pgTable("cafe_machines", {
  id: serial().primaryKey(),
  marque: varchar().notNull(),
  modele: varchar().notNull(),
  nbBoissons: integer("nb_boissons").notNull(),
  nbTassesParJ: integer("nb_tasses_par_j").notNull(),
  arriveeReseau: possibiliteEnum("arrivee_reseau").notNull(),
  evacuationReseau: possibiliteEnum("evacuation_reseau").notNull(),
  evacuationMarc: possibiliteEnum("evacuation_marc").notNull(),
  lactee: boolean().notNull(),
  gourmande: boolean().notNull(),
  infos: varchar(),
  imageUrl: varchar("image_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cafeMachinesTarifs = pgTable(
  "cafe_machines_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    type: typeMachineEnum().notNull(),
    nbPersonnes: integer("nb_personnes").notNull(),
    nbMachines: integer("nb_machines"),
    typeLait: typeLaitEnum("type_lait"),
    typeChocolat: typeChocolatEnum("type_chocolat"),
    oneShot: integer("one_shot"),
    pa12M: integer("pa_12m"),
    rac12M: integer("rac_12m"),
    pa24M: integer("pa_24m"),
    rac24M: integer("rac_24m"),
    pa36M: integer("pa_36m"),
    pa48M: integer("pa_48m"),
    paMaintenance: integer("pa_maintenance"),
    nbPassages: integer("nb_passages"),
    fraisInstallation: integer("frais_installation"),
    cafeMachineId: integer("cafe_machine_id"),
    reconditionne: boolean().default(false),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_machines_tarifs_fournisseur_type_nb_personnes_idx").on(
      table.fournisseurId,
      table.type,
      table.nbPersonnes,
    ),
    index("cafe_machines_tarifs_cafe_machine_id_idx").on(table.cafeMachineId),
  ],
);

export const cafeConsoTarifs = pgTable(
  "cafe_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_conso_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const theConsoTarifs = pgTable(
  "the_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageUrl: varchar("image_url"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("the_conso_tarifs_fournisseur_gamme_effectif_idx").on(
      table.fournisseurId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const laitConsoTarifs = pgTable(
  "lait_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixUnitaireDosette: integer("prix_unitaire_dosette"),
    prixUnitaireFrais: integer("prix_unitaire_frais"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("lait_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const chocolatConsoTarifs = pgTable(
  "chocolat_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixUnitaireSachet: integer("prix_unitaire_sachet"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("chocolat_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);

export const sucreConsoTarifs = pgTable(
  "sucre_conso_tarifs",
  {
    id: serial().primaryKey(),
    fournisseurId: integer("fournisseur_id").notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("sucre_conso_tarifs_fournisseur_effectif_idx").on(
      table.fournisseurId,
      table.effectif,
    ),
  ],
);
