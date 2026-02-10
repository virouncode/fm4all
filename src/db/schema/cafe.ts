import {
  boolean,
  index,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import {
  gammeEnum,
  possibiliteEnum,
  typeChocolatEnum,
  typeLaitEnum,
  typeMachineEnum,
} from "./enums";

export const cafeMachines = pgTable("cafe_machines", {
  id: id(),
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
  imageId: uuid("image_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cafeMachinesTarifs = pgTable(
  "cafe_machines_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
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
    cafeMachineId: uuid("cafe_machine_id").references(() => cafeMachines.id, {
      onDelete: "set null",
    }),
    reconditionne: boolean().default(false),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_machines_tarifs_entreprise_type_nb_personnes_idx").on(
      table.entrepriseId,
      table.type,
      table.nbPersonnes,
    ),
    index("cafe_machines_tarifs_cafe_machine_id_idx").on(table.cafeMachineId),
  ],
);

export const cafeConsoTarifs = pgTable(
  "cafe_conso_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("cafe_conso_tarifs_entreprise_gamme_effectif_idx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const theConsoTarifs = pgTable(
  "the_conso_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    gamme: gammeEnum().notNull(),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("the_conso_tarifs_entreprise_gamme_effectif_idx").on(
      table.entrepriseId,
      table.gamme,
      table.effectif,
    ),
  ],
);

export const laitConsoTarifs = pgTable(
  "lait_conso_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixUnitaireDosette: integer("prix_unitaire_dosette"),
    prixUnitaireFrais: integer("prix_unitaire_frais"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("lait_conso_tarifs_entreprise_effectif_idx").on(
      table.entrepriseId,
      table.effectif,
    ),
  ],
);

export const chocolatConsoTarifs = pgTable(
  "chocolat_conso_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixUnitaireSachet: integer("prix_unitaire_sachet"),
    prixUnitairePoudre: integer("prix_unitaire_poudre"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("chocolat_conso_tarifs_entreprise_effectif_idx").on(
      table.entrepriseId,
      table.effectif,
    ),
  ],
);

export const sucreConsoTarifs = pgTable(
  "sucre_conso_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    effectif: integer().notNull(),
    prixUnitaire: integer("prix_unitaire"),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("sucre_conso_tarifs_entreprise_effectif_idx").on(
      table.entrepriseId,
      table.effectif,
    ),
  ],
);
