import {
  index,
  integer,
  numeric,
  pgSequence,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const devisNumeroSeq = pgSequence("devis_numero_seq", {
  startWith: 1,
  increment: 1,
  cache: 1,
});
import {
  createdAt,
  createdById,
  id,
  timestamptz,
  updatedAt,
  updatedById,
} from "../schema-helper";
import { user } from "./auth";
import { entreprises } from "./entreprises";
import { devisPeriodeFacturationEnum, devisStatutEnum, devisTypePrixEnum } from "./enums";
import { prospects } from "./prospects";
import { services } from "./services";
import { sites } from "./sites";
import { tickets } from "./tickets";

export const devisTemporaires = pgTable(
  "devis_temporaires",
  {
    id: id(),
    prospectId: uuid("prospect_id").references(() => prospects.id),
    texte: varchar().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_temporaires_prospect_id_idx").on(table.prospectId),
    index("devis_temporaires_created_at_idx").on(table.createdAt),
  ],
);

export const devisDemandes = pgTable(
  "devis_demandes",
  {
    id: id(),
    demandeurEntrepriseId: uuid("demandeur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, {
        onDelete: "cascade",
      }),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (table) => [
    index("devis_demandes_demandeur_entreprise_id_idx").on(
      table.demandeurEntrepriseId,
    ),
    index("devis_demandes_site_id_idx").on(table.siteId),
    index("devis_demandes_ticket_id_idx").on(table.ticketId),
    index("devis_demandes_service_id_idx").on(table.serviceId),
    index("devis_demandes_created_at_idx").on(table.createdAt),
  ],
);

export const devis = pgTable(
  "devis",
  {
    id: id(),
    devisDemandeId: uuid("devis_demande_id").references(
      () => devisDemandes.id,
      {
        onDelete: "cascade",
      },
    ),
    demandeurEntrepriseId: uuid("demandeur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    emetteurEntrepriseId: uuid("emetteur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, {
        onDelete: "cascade",
      }),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),
    numero: varchar("numero", { length: 20 }).unique(),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    noteInterne: text("note_interne"),
    statut: devisStatutEnum("statut").notNull().default("brouillon"),
    remiseGlobaleHt: integer("remise_globale_ht").notNull().default(0),
    dateEmission: timestamptz("date_emission"),
    validTo: timestamptz("valid_to"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("devis_site_id_idx").on(table.siteId),
    index("devis_ticket_id_idx").on(table.ticketId),
    index("devis_statut_idx").on(table.statut),
    index("devis_created_at_idx").on(table.createdAt),
  ],
);

export const devisLignes = pgTable(
  "devis_lignes",
  {
    id: id(),
    devisId: uuid("devis_id")
      .references(() => devis.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    designation: varchar("designation", { length: 255 }).notNull(),
    description: text("description"),
    quantite: numeric("quantite", { precision: 12, scale: 3 }).notNull(),
    unite: varchar("unite", { length: 100 }).notNull(),
    prixUnitaireHt: integer("prix_unitaire_ht").notNull(), // *100
    tauxTva: integer("taux_tva").notNull(), // *100
    ordre: integer("ordre").notNull(), //position de la ligne dans le devis
    remiseHtMontant: integer("remise_ht").notNull().default(0), // *100
    typePrix: devisTypePrixEnum("type_prix").notNull(),
    periodeFacturation: devisPeriodeFacturationEnum("periode_facturation"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (table) => [
    index("devis_lignes_devis_id_idx").on(table.devisId),
    index("devis_lignes_created_at_idx").on(table.createdAt),
    uniqueIndex("devis_lignes_ordre_udx").on(table.devisId, table.ordre),
  ],
);
