import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
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
import { entreprises, serviceEntreprises } from "./entreprises";
import {
  clientServiceStatutEnum,
  executionPeriodeFacturationEnum,
  executionTypePrixEnum,
  famillePlanificationEnum,
  modeAncragePeriodeEnum,
  modeCommercialEnum,
  modePilotageEnum,
  occurrenceStatutEnum,
  occurrenceTacheStatutEnum,
  perimetreModeEnum,
  periodeQuotaEnum,
  siteAttributionScopeEnum,
  typeExceptionRecurrenceEnum,
  typeSourceOccurrenceEnum,
} from "./enums";
import { sites } from "./sites";

export const services = pgTable(
  "services",
  {
    id: id(),
    nom: varchar("nom").notNull(),
    description: text("description"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("services_nom_udx").on(table.nom),
    index("services_created_at_idx").on(table.createdAt),
  ],
);

/**
 * Contrat de prestation : lien entre un client, un site racine et un type de service.
 *
 * Les colonnes de fréquence (frequence, frequenceParPeriode, intervalleJours,
 * joursPreference, heureDebutPreference, dureeEstimeeMinutes, modePlanning)
 * ont été supprimées dans la refonte 2026-03-14.
 * Elles sont remplacées par :
 *   - clientServiceReglesRecurrence    (famille recurrence_auto)
 *   - clientServiceQuotasPlanification (famille quota_manuel)
 */
export const clientServices = pgTable(
  "client_services",
  {
    id: id(),
    entrepriseId: uuid("entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    /**
     * Famille de planification — dérivée automatiquement à la création :
     *   hebdomadaire / mensuelle / tous_les_x_jours → recurrence_auto
     *   trimestrielle / semestrielle / annuelle      → quota_manuel
     *   one_shot                                     → ponctuel
     * Ne jamais exposer comme champ de saisie directe.
     */
    famillePlanification: famillePlanificationEnum("famille_planification")
      .notNull()
      .default("recurrence_auto"),
    dateDebut: timestamptz("date_debut"),
    dateFin: timestamptz("date_fin"),
    statut: clientServiceStatutEnum("statut").notNull().default("brouillon"),
    modeCommercial: modeCommercialEnum("mode_commercial")
      .notNull()
      .default("direct"),
    notes: text("notes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("client_services_entreprise_idx").on(t.entrepriseId),
    index("client_services_site_idx").on(t.siteId),
    index("client_services_service_idx").on(t.serviceId),
    index("client_services_statut_idx").on(t.statut),
    index("client_services_famille_idx").on(t.famillePlanification),
    index("client_services_dates_idx").on(t.dateDebut, t.dateFin),
  ],
);

// ---------------------------------------------------------------------------
// RÈGLES DE RÉCURRENCE (famille recurrence_auto)
// ---------------------------------------------------------------------------

/**
 * Sous-série RRULE d'une prestation récurrente automatique.
 *
 * Une prestation peut avoir N règles (ex: "Lundi 08h", "Mercredi 14h", "Vendredi 09h").
 *
 * IMPORTANT — Convention stockage :
 *   dtstartLocal   = timestamp WITHOUT timezone = première occurrence locale de la sous-série.
 *                    Calculée automatiquement depuis clientServices.dateDebut + premier jour compatible.
 *                    Ne jamais exposer comme champ de saisie de premier niveau.
 *   fuseauHoraire  = identifiant IANA (ex: "Europe/Paris"), obligatoire, validé côté app.
 *                    Permet l'expansion RRULE avec gestion DST correcte via rrule.js + luxon.
 *   regleRrule     = RRULE pure SANS DTSTART (ex: "FREQ=WEEKLY;BYDAY=MO").
 *                    Ne jamais inclure DTSTART dans cette string — dtstartLocal et fuseauHoraire
 *                    servent à reconstruire : DTSTART;TZID=<fuseauHoraire>:<dtstartLocal>
 *
 * Les occurrences matérialisées (clientServiceOccurrences) sont en timestamptz (instant UTC).
 */
export const clientServiceReglesRecurrence = pgTable(
  "client_service_regles_recurrence",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    libelle: varchar("libelle", { length: 255 }),
    // timestamp WITHOUT timezone = heure locale murale, pas d'instant UTC
    dtstartLocal: timestamp("dtstart_local", {
      withTimezone: false,
      mode: "date",
      precision: 0,
    }).notNull(),
    fuseauHoraire: varchar("fuseau_horaire", { length: 64 })
      .notNull()
      .default("Europe/Paris"),
    // RRULE pure sans DTSTART — ex: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
    regleRrule: text("regle_rrule").notNull(),
    dureePrevueMinutes: smallint("duree_prevue_minutes"),
    /**
     * Checklist spécifique à cette règle (override sur la checklist de l'exécution).
     * Priorité : regle.tacheListeTemplateId > execution.tacheListeTemplateId
     * Cas d'usage : nettoyage lundi (vitres + sol) vs vendredi (sol seulement)
     */
    tacheListeTemplateId: uuid("tache_liste_template_id").references(
      () => tacheListesTemplates.id,
      { onDelete: "set null" },
    ),
    actif: boolean("actif").notNull().default(true),
    ordre: smallint("ordre").notNull().default(0),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("csrr_client_service_idx").on(t.clientServiceId),
    index("csrr_actif_idx").on(t.actif),
  ],
);

// ---------------------------------------------------------------------------
// QUOTAS À PLANIFIER (famille quota_manuel)
// ---------------------------------------------------------------------------

/**
 * Politique de quota pour une prestation à planification manuelle.
 * Une seule ligne par prestation (UNIQUE sur clientServiceId).
 *
 * Logique :
 *   nbOccurrencesParPeriode = 2, periodeQuota = "annee"
 *   → l'utilisateur doit placer 2 occurrences dans la période
 *   → UI : "Il vous reste X passages à planifier avant le [fin de période]"
 *
 * modeAncragePeriode :
 *   "contrat" (défaut) → période départ = clientServices.dateDebut
 *   "civil"            → période suit le calendrier civil (1er jan, 1er jul, etc.)
 */
export const clientServiceQuotasPlanification = pgTable(
  "client_service_quotas_planification",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" })
      .unique(),
    nbOccurrencesParPeriode: smallint("nb_occurrences_par_periode").notNull(),
    periodeQuota: periodeQuotaEnum("periode_quota").notNull(),
    modeAncragePeriode: modeAncragePeriodeEnum("mode_ancrage_periode")
      .notNull()
      .default("contrat"),
    // Calculée depuis clientServices.dateDebut (mode contrat) ou début période civile (mode civil)
    dateAncragePeriode: date("date_ancrage_periode").notNull(),
    notes: text("notes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("csqp_client_service_idx").on(t.clientServiceId)],
);

// ---------------------------------------------------------------------------
// EXCEPTIONS DE RÉCURRENCE
// ---------------------------------------------------------------------------

/**
 * Exceptions sur une série récurrente : occurrences supprimées, déplacées ou modifiées.
 *
 * Stockée en table dédiée (pas en EXDATE dans la RRULE string) pour la requêtabilité et l'audit.
 * EXDATE peut être produit comme format de sortie vers FullCalendar/iCal si besoin.
 *
 * dateOriginale = instant UTC de l'occurrence théorique d'origine (clé métier stable).
 *
 * Niveaux de modification exposés selon permissions / modePilotage :
 *   Agent     → "cette occurrence" seulement
 *   Manager   → "celle-ci et les suivantes"
 *   Admin     → "toute la série"
 */
export const clientServiceExceptionsRecurrence = pgTable(
  "client_service_exceptions_recurrence",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    regleRecurrenceId: uuid("regle_recurrence_id").references(
      () => clientServiceReglesRecurrence.id,
      { onDelete: "set null" },
    ),
    siteId: uuid("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    // Instant UTC de l'occurrence théorique d'origine — jamais modifié
    dateOriginale: timestamptz("date_originale").notNull(),
    typeException: typeExceptionRecurrenceEnum("type_exception").notNull(),
    // Renseignée si type = "deplacee" ou "modifiee"
    nouvelleDateDebut: timestamptz("nouvelle_date_debut"),
    nouvelleHeureFin: timestamptz("nouvelle_heure_fin"),
    motif: text("motif"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("cser_client_service_idx").on(t.clientServiceId),
    index("cser_regle_recurrence_idx").on(t.regleRecurrenceId),
    index("cser_date_originale_idx").on(t.dateOriginale),
  ],
);

// ---------------------------------------------------------------------------
// OCCURRENCES (instances matérialisées)
// ---------------------------------------------------------------------------

/**
 * Instance matérialisée d'une occurrence.
 *
 * Matérialisée seulement quand elle devient opérationnelle :
 *   - Cron J+7 (occurrences proches)
 *   - Action utilisateur sur un event virtuel FullCalendar
 *   - Cron de réconciliation nightly (passé non encore matérialisé → audit/analytics)
 *
 * Identité métier pour les occurrences issues d'une règle RRULE :
 *   Contrainte unique partielle : (clientServiceId, regleRecurrenceId, siteId, dateDebutOriginale)
 *   WHERE type_source = 'regle_recurrence'
 *
 * dateDebutOriginale = date théorique d'origine, figée à la matérialisation, JAMAIS modifiée.
 *   Si l'occurrence est déplacée : dateDebutOriginale = lundi 23, dateDebutPrevue = mardi 24.
 *
 * executionId : figé au passage statut → "en_cours" (plus à la génération).
 *   Résolvable dynamiquement tant que l'occurrence est "planifiee".
 *
 * Tâches (occurrenceTaches) : snapshotées à J-1 ou au passage → "en_cours".
 *   Plus à la génération de l'occurrence (ancienne logique supprimée).
 */
export const clientServiceOccurrences = pgTable(
  "client_service_occurrences",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    // Origine de l'occurrence
    typeSource: typeSourceOccurrenceEnum("type_source")
      .notNull()
      .default("ponctuel"),
    regleRecurrenceId: uuid("regle_recurrence_id").references(
      () => clientServiceReglesRecurrence.id,
      { onDelete: "set null" },
    ),
    // Date théorique d'origine — figée à la matérialisation, jamais modifiée
    dateDebutOriginale: timestamptz("date_debut_originale"),
    // Dates planifiées (peuvent évoluer si occurrence déplacée)
    dateDebutPrevue: timestamptz("date_debut_prevue"),
    dateFinPrevue: timestamptz("date_fin_prevue"),
    // Dates réelles (renseignées à l'exécution)
    dateDebutReelle: timestamptz("date_debut_reelle"),
    dateFinReelle: timestamptz("date_fin_reelle"),
    // Exécution gagnante — figée au passage → "en_cours", pas à la génération
    executionId: uuid("execution_id").references(
      () => clientServiceExecutions.id,
      { onDelete: "set null" },
    ),
    statut: occurrenceStatutEnum("statut").notNull().default("planifiee"),
    /**
     * Override de checklist pour cette occurrence spécifique.
     * Priorité : occurrence.tacheListeTemplateId > regle.tacheListeTemplateId > execution.tacheListeTemplateId
     * Cas d'usage : intervention ponctuelle avec une liste de tâches différente du planning habituel.
     * NULL = héritage (résolu au snapshot J-1 / passage → en_cours).
     */
    tacheListeTemplateId: uuid("tache_liste_template_id").references(
      () => tacheListesTemplates.id,
      { onDelete: "set null" },
    ),
    assigneeUserId: uuid("assignee_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    demandeeParUserId: uuid("demandee_par_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("cso_client_service_idx").on(t.clientServiceId),
    index("cso_site_idx").on(t.siteId),
    index("cso_statut_idx").on(t.statut),
    index("cso_execution_idx").on(t.executionId),
    index("cso_assignee_idx").on(t.assigneeUserId),
    index("cso_type_source_idx").on(t.typeSource),
    index("cso_regle_recurrence_idx").on(t.regleRecurrenceId),
    index("cso_dates_prevues_idx").on(t.dateDebutPrevue, t.dateFinPrevue),
    // Contrainte unique partielle — une seule occurrence matérialisée par (règle, site, date originale)
    uniqueIndex("cso_regle_recurrence_udx")
      .on(
        t.clientServiceId,
        t.regleRecurrenceId,
        t.siteId,
        t.dateDebutOriginale,
      )
      .where(sql`type_source = 'regle_recurrence'`),
  ],
);

// ---------------------------------------------------------------------------
// EXÉCUTIONS (prestataire assigné)
// ---------------------------------------------------------------------------

export const clientServiceExecutions = pgTable(
  "client_service_executions",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    serviceEntrepriseId: uuid("service_entreprise_id").references(
      () => serviceEntreprises.id,
      { onDelete: "set null" },
    ),
    dateDebutValidite: timestamptz("date_debut_validite").notNull(),
    dateFinValidite: timestamptz("date_fin_validite"),
    priorite: smallint("priorite").notNull(),
    actif: boolean("actif").notNull().default(true),
    modePilotage: modePilotageEnum("mode_pilotage").notNull().default("client"),
    tacheListeTemplateId: uuid("tache_liste_template_id").references(
      () => tacheListesTemplates.id,
      { onDelete: "set null" },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("cse_client_service_idx").on(t.clientServiceId),
    index("cse_site_idx").on(t.siteId),
    index("cse_actif_idx").on(t.actif),
  ],
);

export const clientServiceExecutionPrix = pgTable(
  "client_service_execution_prix",
  {
    id: id(),
    executionId: uuid("execution_id")
      .notNull()
      .references(() => clientServiceExecutions.id, { onDelete: "cascade" }),
    typePrix: executionTypePrixEnum("type_prix").notNull(),
    montantHt: integer("montant_ht").notNull(),
    coutPrestataireHt: integer("cout_prestataire_ht"),
    margePourcent: integer("marge_pourcent"),
    periodeFacturation: executionPeriodeFacturationEnum("periode_facturation"),
    nbOccurrencesIncluses: integer("nb_occurrences_incluses"),
    actif: boolean("actif").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("csep_execution_idx").on(t.executionId),
    index("csep_type_idx").on(t.typePrix),
    index("csep_actif_idx").on(t.actif),
    uniqueIndex("csep_actif_udx")
      .on(t.executionId, t.typePrix, t.periodeFacturation)
      .where(sql`actif = true`),
  ],
);

export const clientServicePerimetre = pgTable(
  "client_service_perimetre",
  {
    id: id(),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    mode: perimetreModeEnum("mode").notNull(),
    scope: siteAttributionScopeEnum("scope").notNull().default("subtree"),
    ordreAffichage: smallint("ordre_affichage").notNull().default(0),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("csp_client_service_idx").on(t.clientServiceId),
    index("csp_site_idx").on(t.siteId),
    index("csp_mode_idx").on(t.mode),
    uniqueIndex("csp_udx").on(t.clientServiceId, t.siteId, t.mode, t.scope),
  ],
);

// ---------------------------------------------------------------------------
// CHECKLISTS (templates de tâches)
// ---------------------------------------------------------------------------

/**
 * Pack de tâches nommé (checklist header).
 * proprietaireEntrepriseId = null → pack système FM4ALL (accessible à tous)
 * proprietaireEntrepriseId = uuid → pack entreprise (client ou prestataire)
 */
export const tacheListesTemplates = pgTable(
  "tache_listes_templates",
  {
    id: id(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id").references(
      () => entreprises.id,
      { onDelete: "set null" },
    ),
    nom: varchar("nom", { length: 255 }).notNull(),
    actif: boolean("actif").notNull().default(true),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("tlt_service_idx").on(t.serviceId),
    index("tlt_proprietaire_idx").on(t.proprietaireEntrepriseId),
    index("tlt_actif_idx").on(t.actif),
  ],
);

export const tacheListeItems = pgTable(
  "tache_liste_items",
  {
    id: id(),
    listeTemplateId: uuid("liste_template_id")
      .notNull()
      .references(() => tacheListesTemplates.id, { onDelete: "cascade" }),
    ordre: smallint("ordre").notNull(),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    actif: boolean("actif").notNull().default(true),
    dureeEstimeeMinutes: smallint("duree_estimee_minutes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("tli_liste_template_idx").on(t.listeTemplateId),
    index("tli_actif_idx").on(t.actif),
    uniqueIndex("tli_order_udx").on(t.listeTemplateId, t.ordre),
  ],
);

// ---------------------------------------------------------------------------
// TÂCHES D'OCCURRENCE
// ---------------------------------------------------------------------------

/**
 * Snapshot immuable des items d'une checklist pour une occurrence donnée.
 *
 * Matérialisées seulement à J-1 (cron) ou au passage statut → "en_cours".
 * Plus à la génération de l'occurrence (ancienne logique snapshotOccurrenceTaches supprimée
 * de ensureOccurrencesWindow).
 *
 * Tâches ad-hoc : listeItemId = null.
 */
export const occurrenceTaches = pgTable(
  "occurrence_taches",
  {
    id: id(),
    occurrenceId: uuid("occurrence_id")
      .notNull()
      .references(() => clientServiceOccurrences.id, { onDelete: "cascade" }),
    listeItemId: uuid("liste_item_id").references(() => tacheListeItems.id, {
      onDelete: "set null",
    }),
    ordre: smallint("ordre").notNull(),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    statut: occurrenceTacheStatutEnum("statut").notNull().default("a_faire"),
    assigneeUserId: uuid("assignee_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    completeeParUserId: uuid("completee_par_user_id").references(
      () => user.id,
      { onDelete: "set null" },
    ),
    tempsPasseSecondes: integer("temps_passe_secondes"),
    notes: text("notes"),
    startedAt: timestamptz("started_at"),
    doneAt: timestamptz("done_at"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("ot_occurrence_idx").on(t.occurrenceId),
    index("ot_statut_idx").on(t.statut),
    index("ot_liste_item_idx").on(t.listeItemId),
    uniqueIndex("ot_order_udx").on(t.occurrenceId, t.ordre),
  ],
);

// ---------------------------------------------------------------------------
// FACTURATION — LEDGER IMMUABLE
// ---------------------------------------------------------------------------

/**
 * Table de traçabilité : enregistre chaque application d'un tarif à un événement.
 * Snapshot immuable — ne jamais modifier une ligne existante.
 *
 * Règles de déclenchement :
 *   ABONNEMENT      → 1 ligne par période (periodeStart/periodeEnd renseignés, occurrenceId null)
 *   PAR_OCCURRENCE  → 1 ligne par occurrence réalisée (occurrenceId renseigné)
 *   FRAIS_LIVRAISON → 1 ligne par occurrence réalisée (occurrenceId renseigné)
 *   INSTALLATION    → 1 ligne unique à la 1ère occurrence réalisée (occurrenceId renseigné)
 */
export const clientServicePrixAppliques = pgTable(
  "client_service_prix_appliques",
  {
    id: id(),
    executionPrixId: uuid("execution_prix_id")
      .notNull()
      .references(() => clientServiceExecutionPrix.id, { onDelete: "cascade" }),
    clientServiceId: uuid("client_service_id")
      .notNull()
      .references(() => clientServices.id, { onDelete: "cascade" }),
    executionId: uuid("execution_id")
      .notNull()
      .references(() => clientServiceExecutions.id, { onDelete: "cascade" }),
    occurrenceId: uuid("occurrence_id").references(
      () => clientServiceOccurrences.id,
      { onDelete: "cascade" },
    ),
    typePrix: executionTypePrixEnum("type_prix").notNull(),
    montantHtSnapshot: integer("montant_ht_snapshot").notNull(),
    coutPrestataireHtSnapshot: integer("cout_prestataire_ht_snapshot"),
    margePourcentSnapshot: integer("marge_pourcent_snapshot"),
    periodeStart: date("periode_start"),
    periodeEnd: date("periode_end"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("cspa_execution_prix_idx").on(t.executionPrixId),
    index("cspa_client_service_idx").on(t.clientServiceId),
    index("cspa_occurrence_idx").on(t.occurrenceId),
    uniqueIndex("cspa_par_occurrence_udx").on(
      t.executionPrixId,
      t.occurrenceId,
    ),
    uniqueIndex("cspa_par_periode_udx").on(t.executionPrixId, t.periodeStart),
  ],
);
