import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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
import { factureLigneTypeEnum, factureStatutEnum } from "./enums";
import { clientServiceOccurrences, clientServices, services } from "./services";
import { sites } from "./sites";
import { tickets } from "./tickets";

/**
 * FACTURES
 * - Totaux stockés : OK (facture = pièce comptable figée)
 */
export const factures = pgTable(
  "factures",
  {
    id: id(),

    emetteurEntrepriseId: uuid("emetteur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    destinataireEntrepriseId: uuid("destinataire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    // multi-tenant / owner
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    // liens optionnels
    clientServiceId: uuid("client_service_id").references(
      () => clientServices.id,
      {
        onDelete: "set null",
      },
    ),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),

    numero: varchar("numero", { length: 64 }).notNull(),

    statut: factureStatutEnum("statut").notNull().default("brouillon"),

    periodeDebut: timestamptz("periode_debut"),
    periodeFin: timestamptz("periode_fin"),

    dateEmission: timestamptz("date_emission").notNull().defaultNow(),
    dateEcheance: timestamptz("date_echeance"),

    // montants (stockés car facture figée)
    totalHt: integer("total_ht").notNull(), // *100
    totalTva: integer("total_tva").notNull(), // *100
    totalTtc: integer("total_ttc").notNull(), // *100

    genereeParOutil: boolean("generee_par_outil").notNull().default(false),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("factures_owner_idx").on(t.proprietaireEntrepriseId),
    index("factures_emetteur_idx").on(t.emetteurEntrepriseId),
    index("factures_destinataire_idx").on(t.destinataireEntrepriseId),
    index("factures_statut_idx").on(t.statut),
    index("factures_date_emission_idx").on(t.dateEmission),
    index("factures_date_echeance_idx").on(t.dateEcheance),
    index("factures_client_service_idx").on(t.clientServiceId),
    index("factures_ticket_idx").on(t.ticketId),
    uniqueIndex("factures_numero_owner_udx").on(
      t.proprietaireEntrepriseId,
      t.emetteurEntrepriseId,
      t.numero,
    ),
  ],
);

/**
 * FACTURE_LIGNES
 * - totalHt stocké : OK (ligne figée / audit)
 */
export const factureLignes = pgTable(
  "facture_lignes",
  {
    id: id(),

    factureId: uuid("facture_id")
      .notNull()
      .references(() => factures.id, { onDelete: "cascade" }),

    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),

    designation: varchar("designation", { length: 255 }).notNull(),
    description: text("description"),

    quantite: numeric("quantite", { precision: 12, scale: 3 }).notNull(),

    prixUnitaireHt: integer("prix_unitaire_ht").notNull(), // *100
    tauxTva: integer("taux_tva").notNull(), // *100 (ex: 2000 = 20.00%)

    totalHt: integer("total_ht").notNull(), // *100

    ordre: integer("ordre").notNull(),

    type: factureLigneTypeEnum("type").notNull(), // one_shot | mensuel

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("facture_lignes_facture_idx").on(t.factureId),
    index("facture_lignes_service_idx").on(t.serviceId),
    index("facture_lignes_created_at_idx").on(t.createdAt),
    uniqueIndex("facture_lignes_ordre_udx").on(t.factureId, t.ordre),
  ],
);

/**
 * FACTURE_LIGNE_ALLOCATIONS
 * - Ventilation d’une ligne vers sites / services / occurrences / tickets
 */
export const factureLigneAllocations = pgTable(
  "facture_ligne_allocations",
  {
    id: id(),

    factureLigneId: uuid("facture_ligne_id")
      .notNull()
      .references(() => factureLignes.id, { onDelete: "cascade" }),

    siteId: uuid("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),

    clientServiceId: uuid("client_service_id").references(
      () => clientServices.id,
      {
        onDelete: "set null",
      },
    ),

    occurrenceId: uuid("occurrence_id").references(
      () => clientServiceOccurrences.id,
      {
        onDelete: "set null",
      },
    ),

    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),

    montantHt: integer("montant_ht").notNull(), // *100

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("facture_ligne_allocations_ligne_idx").on(t.factureLigneId),
    index("facture_ligne_allocations_site_idx").on(t.siteId),
    index("facture_ligne_allocations_client_service_idx").on(t.clientServiceId),
    index("facture_ligne_allocations_occurrence_idx").on(t.occurrenceId),
    index("facture_ligne_allocations_ticket_idx").on(t.ticketId),
  ],
);
