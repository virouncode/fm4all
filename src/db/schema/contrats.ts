import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  createdById,
  id,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./auth";
import { devis } from "./devis";
import { entreprises } from "./entreprises";
import {
  contratDealModeEnum,
  contratStatutEnum,
  contratTypeEnum,
} from "./enums";
import { clientServices } from "./services";
import { sites } from "./sites";

export const contrats = pgTable(
  "contrats",
  {
    id: id(),

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    type: contratTypeEnum("type").notNull(),
    dealMode: contratDealModeEnum("deal_mode").notNull(),

    partieAEntrepriseId: uuid("partie_a_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    partieBEntrepriseId: uuid("partie_b_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    titre: varchar("titre", { length: 255 }).notNull(),
    referenceExterne: varchar("reference_externe", { length: 255 }),
    notes: text("notes"),

    siteId: uuid("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),

    statut: contratStatutEnum("statut").notNull().default("actif"),

    dateDebut: timestamp("date_debut", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateFin: timestamp("date_fin", {
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),

    isContratCadre: boolean("is_contrat_cadre").notNull().default(false),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("contrats_owner_idx").on(t.proprietaireEntrepriseId),
    index("contrats_partie_a_idx").on(t.partieAEntrepriseId),
    index("contrats_partie_b_idx").on(t.partieBEntrepriseId),
    index("contrats_site_idx").on(t.siteId),
    index("contrats_statut_idx").on(t.statut),
    index("contrats_dates_idx").on(t.dateDebut, t.dateFin),
  ],
);

export const contratDevis = pgTable(
  "contrat_devis",
  {
    contratId: uuid("contrat_id")
      .notNull()
      .references(() => contrats.id, { onDelete: "cascade" }),

    devisId: uuid("devis_id")
      .notNull()
      .references(() => devis.id, { onDelete: "cascade" }),

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    createdById: createdById(() => user),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.contratId, t.devisId] }),
    index("contrat_devis_owner_idx").on(t.proprietaireEntrepriseId),
    index("contrat_devis_contrat_idx").on(t.contratId),
    index("contrat_devis_devis_idx").on(t.devisId),
  ],
);

export const contratClientServices = pgTable(
  "contrat_client_services",
  {
    contratId: uuid("contrat_id")
      .notNull()
      .references(() => contrats.id, { onDelete: "cascade" }),

    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.contratId, t.clientServiceId] }),
    index("contrat_client_services_owner_idx").on(t.proprietaireEntrepriseId),
    index("contrat_client_services_contrat_idx").on(t.contratId),
    index("contrat_client_services_client_service_idx").on(t.clientServiceId),
  ],
);
