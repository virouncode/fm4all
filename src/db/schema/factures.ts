import {
  boolean,
  date,
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
import {
  factureLigneTypeSourceEnum,
  factureModeCommercialSnapshotEnum,
  factureStatutEnum,
} from "./enums";
import { clientServiceOccurrences, clientServicePrixAppliques, clientServices, services } from "./services";
import { sites } from "./sites";
import { tickets } from "./tickets";

// ─────────────────────────────────────────────────────────────────────────────
// SÉQUENCE NUMÉRO FACTURE
// Format : F-{year}-{seq padStart 6}  ex: F-2026-000001
// ─────────────────────────────────────────────────────────────────────────────

export const factureNumeroSeq = pgSequence("facture_numero_seq", {
  startWith: 1,
  increment: 1,
  cache: 1,
});

// ─────────────────────────────────────────────────────────────────────────────
// FACTURES
// - Totaux stockés : OK (facture = pièce comptable figée à l'émission)
// - numero nullable en brouillon, attribué uniquement à l'émission
// - PDF via documentsLinks.factureId + documents.categorie = "facture"
// ─────────────────────────────────────────────────────────────────────────────

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

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, { onDelete: "cascade" }),

    // Liens contextuels optionnels (analytics, conversion devis→facture, etc.)
    clientServiceId: uuid("client_service_id").references(
      () => clientServices.id,
      { onDelete: "set null" },
    ),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "set null",
    }),
    siteId: uuid("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),

    // Attribué uniquement à l'émission via factureNumeroSeq
    numero: varchar("numero", { length: 20 }),

    statut: factureStatutEnum("statut").notNull().default("brouillon"),

    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    noteInterne: text("note_interne"),
    notesClient: text("notes_client"),

    // Renseigné à l'émission uniquement
    dateEmission: timestamptz("date_emission"),
    dateEcheance: timestamptz("date_echeance"),

    // Période couverte (optionnel, contexte abonnement/mensuel)
    periodeDebut: date("periode_debut"),
    periodeFin: date("periode_fin"),

    remiseGlobaleHt: integer("remise_globale_ht").notNull().default(0), // *100

    // Figés à l'émission (0 en brouillon, calculés à l'émission)
    montantHt: integer("montant_ht").notNull().default(0), // *100
    montantTva: integer("montant_tva").notNull().default(0), // *100
    montantTtc: integer("montant_ttc").notNull().default(0), // *100

    // Snapshot du contexte commercial au moment de la création.
    // Permet de distinguer FM4ALL prestataire direct vs FM4ALL en mode intermédiaire.
    // "direct" = prestation vendue directement par l'émetteur
    // "intermediaire" = FM4ALL facture dans un rôle de plateforme/intermédiaire
    modeCommercialSnapshot: factureModeCommercialSnapshotEnum(
      "mode_commercial_snapshot",
    )
      .notNull()
      .default("direct"),

    // Indique si la facture a été générée automatiquement par l'outil
    genereeParOutil: boolean("generee_par_outil").notNull().default(false),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("factures_emetteur_idx").on(t.emetteurEntrepriseId),
    index("factures_destinataire_idx").on(t.destinataireEntrepriseId),
    index("factures_proprietaire_idx").on(t.proprietaireEntrepriseId),
    index("factures_site_idx").on(t.siteId),
    index("factures_statut_idx").on(t.statut),
    index("factures_date_emission_idx").on(t.dateEmission),
    index("factures_date_echeance_idx").on(t.dateEcheance),
    index("factures_client_service_idx").on(t.clientServiceId),
    index("factures_ticket_idx").on(t.ticketId),
    index("factures_created_at_idx").on(t.createdAt),
    // Numéro unique par émetteur (les brouillons ont numero = null → pas de conflit)
    uniqueIndex("factures_numero_emetteur_udx").on(
      t.emetteurEntrepriseId,
      t.numero,
    ),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// FACTURE_LIGNES
// Structure volontairement proche de devisLignes pour faciliter la conversion.
// Montants stockés (figés à l'émission) — null en brouillon.
// ─────────────────────────────────────────────────────────────────────────────

export const factureLignes = pgTable(
  "facture_lignes",
  {
    id: id(),

    factureId: uuid("facture_id")
      .notNull()
      .references(() => factures.id, { onDelete: "cascade" }),

    // Lien service optionnel (analytics / CA par service)
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),

    designation: varchar("designation", { length: 255 }).notNull(),
    description: text("description"),

    quantite: numeric("quantite", { precision: 12, scale: 3 }).notNull(),
    unite: varchar("unite", { length: 100 }).notNull(),

    prixUnitaireHt: integer("prix_unitaire_ht").notNull(), // *100
    tauxTva: integer("taux_tva").notNull(), // *100 (ex: 2000 = 20.00%)
    remiseHtMontant: integer("remise_ht_montant").notNull().default(0), // *100

    ordre: integer("ordre").notNull(),

    // Origine de la ligne : manuel (libre) ou prix_applique (issu de pré-facturation)
    typeSource: factureLigneTypeSourceEnum("type_source")
      .notNull()
      .default("manuel"),

    // Figés à l'émission (null en brouillon)
    montantHt: integer("montant_ht"), // *100
    montantTva: integer("montant_tva"), // *100
    montantTtc: integer("montant_ttc"), // *100

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

// ─────────────────────────────────────────────────────────────────────────────
// FACTURE_LIGNES_PRIX_APPLIQUES
// Lien entre une ligne de facture et un clientServicePrixApplique.
// Utilisé uniquement si typeSource = "prix_applique".
// La contrainte unique sur clientServicePrixAppliqueId garantit
// qu'un prix appliqué ne peut être facturé qu'une seule fois (anti-double).
// Non utilisé en V1 (facturation libre), préparé pour la V2 (À facturer).
// ─────────────────────────────────────────────────────────────────────────────

export const factureLignesPrixAppliques = pgTable(
  "facture_lignes_prix_appliques",
  {
    id: id(),

    factureLigneId: uuid("facture_ligne_id")
      .notNull()
      .references(() => factureLignes.id, { onDelete: "cascade" }),

    clientServicePrixAppliqueId: uuid("client_service_prix_applique_id")
      .notNull()
      .references(() => clientServicePrixAppliques.id, { onDelete: "cascade" }),

    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("flpa_facture_ligne_idx").on(t.factureLigneId),
    index("flpa_prix_applique_idx").on(t.clientServicePrixAppliqueId),
    uniqueIndex("flpa_unique_udx").on(
      t.factureLigneId,
      t.clientServicePrixAppliqueId,
    ),
    // Anti-double-facturation : un prix appliqué ne peut être dans qu'une seule ligne
    uniqueIndex("flpa_prix_applique_unique_udx").on(
      t.clientServicePrixAppliqueId,
    ),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// FACTURE_LIGNE_ALLOCATIONS
// Ventilation analytique d'une ligne vers sites / services / occurrences / tickets.
// Distinct de factureLignesPrixAppliques (anti-double-facturation).
// ─────────────────────────────────────────────────────────────────────────────

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
      { onDelete: "set null" },
    ),

    occurrenceId: uuid("occurrence_id").references(
      () => clientServiceOccurrences.id,
      { onDelete: "set null" },
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
    index("facture_ligne_allocations_created_at_idx").on(t.createdAt),
  ],
);
