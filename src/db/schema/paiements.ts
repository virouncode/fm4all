import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
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
import { paiementMethodeEnum, paiementStatutEnum } from "./enums";
import { factures } from "./factures";

/**
 * PAIEMENTS
 * - Un paiement est un flux (payeur -> receveur)
 * - Peut être ventilé sur 1..n factures via paiements_allocations
 */
export const paiements = pgTable(
  "paiements",
  {
    id: id(),

    payeurEntrepriseId: uuid("payeur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    receveurEntrepriseId: uuid("receveur_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    montantTtc: integer("montant_ttc").notNull(), // *100

    methode: paiementMethodeEnum("methode").notNull(),
    statut: paiementStatutEnum("statut").notNull().default("en_attente"),

    datePaiement: timestamptz("date_paiement"),

    referenceExterne: text("reference_externe"),
    commentaires: text("commentaires"),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("paiements_payeur_idx").on(t.payeurEntrepriseId),
    index("paiements_receveur_idx").on(t.receveurEntrepriseId),
    index("paiements_statut_idx").on(t.statut),
    index("paiements_methode_idx").on(t.methode),
    index("paiements_date_paiement_idx").on(t.datePaiement),
    index("paiements_created_at_idx").on(t.createdAt),
  ],
);

/**
 * PAIEMENTS_ALLOCATIONS
 * - Ventilation d'un paiement sur une ou plusieurs factures
 * - Permet paiements partiels / multi-factures
 */
export const paiementsAllocations = pgTable(
  "paiements_allocations",
  {
    id: id(),

    paiementId: uuid("paiement_id")
      .notNull()
      .references(() => paiements.id, { onDelete: "cascade" }),

    factureId: uuid("facture_id")
      .notNull()
      .references(() => factures.id, { onDelete: "cascade" }),

    montantTtc: integer("montant_ttc").notNull(), // *100

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("paiements_allocations_paiement_idx").on(t.paiementId),
    index("paiements_allocations_facture_idx").on(t.factureId),
    index("paiements_allocations_created_at_idx").on(t.createdAt),

    // Évite les doublons exacts (optionnel mais pratique)
    uniqueIndex("paiements_allocations_unique_udx").on(
      t.paiementId,
      t.factureId,
      t.montantTtc,
    ),
  ],
);
