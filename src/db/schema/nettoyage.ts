import { index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schema-helper";
import { documents } from "./documents";
import { entreprises } from "./entreprises";
import { gammeEnum } from "./enums";

export const nettoyageQuantites = pgTable(
  "nettoyage_quantites",
  {
    id: id(),
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
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    hygienePartenaireEntrepriseId: uuid(
      "hygiene_partenaire_entreprise_id",
    ).references(() => entreprises.id, { onDelete: "set null" }),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_tarifs_entreprise_idx").on(table.entrepriseId),
    index("nettoyage_tarifs_entreprise_surface_gamme_idx").on(
      table.entrepriseId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageRepasseTarifs = pgTable(
  "nettoyage_repasse_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    hParPassage: integer("h_par_passage").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    surface: integer().notNull(),
    gamme: gammeEnum().notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_repasse_tarifs_entreprise_idx").on(table.entrepriseId),
    index("nettoyage_repasse_tarifs_entreprise_surface_gamme_idx").on(
      table.entrepriseId,
      table.surface,
      table.gamme,
    ),
  ],
);

export const nettoyageVitrerieTarifs = pgTable(
  "nettoyage_vitrerie_tarifs",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    cadenceVitres: integer("cadence_vitres").notNull(),
    cadenceCloisons: integer("cadence_cloisons").notNull(),
    tauxHoraire: integer("taux_horaire").notNull(),
    minFacturation: integer("min_facturation").notNull(),
    fraisDeplacement: integer("frais_deplacement").notNull(),
    imageId: uuid("image_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    infos: varchar(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("nettoyage_vitrerie_tarifs_entreprise_idx").on(table.entrepriseId),
  ],
);
