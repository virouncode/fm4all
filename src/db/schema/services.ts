import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
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
  clientServiceModePlanningEnum,
  clientServiceStatutEnum,
  executionPeriodeFacturationEnum,
  executionTypePrixEnum,
  frequenceEnum,
  modeCommercialEnum,
  modePilotageEnum,
  occurrenceStatutEnum,
  occurrenceTacheStatutEnum,
  perimetreModeEnum,
  siteAttributionScopeEnum,
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
    frequence: frequenceEnum("frequence").notNull(),
    frequenceParPeriode: integer("frequence_par_periode"),
    intervalleJours: integer("intervalle_jours"), //si tous les X jours
    dateDebut: timestamp("date_debut", {
      //début du contrat de service, à partir duquel les occurrences seront générées
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    dateFin: timestamp("date_fin", {
      //fin du contrat de service, après lequel les occurrences ne seront plus générées
      withTimezone: true,
      mode: "date",
      precision: 3,
    }),
    joursPreference: jsonb("jours_preference").$type<number[]>(),
    // jours ISO 8601 : 1=lundi … 7=dimanche ; utilisé quand frequenceParPeriode > 1
    heureDebutPreference: varchar("heure_debut_preference", { length: 5 }),
    // format "HH:mm" (ex: "08:00") — heure de début par défaut des occurrences
    dureeEstimeeMinutes: smallint("duree_estimee_minutes"),
    // durée d'une intervention en minutes — sert à calculer dateFinPrevue
    statut: clientServiceStatutEnum("statut").notNull().default("brouillon"),
    modePlanning: clientServiceModePlanningEnum("mode_planning")
      .notNull()
      .default("planifie"),
    modeCommercial: modeCommercialEnum("mode_commercial")
      .notNull()
      .default("direct"),
    notes: text("notes"),
    tacheListeTemplateId: uuid("tache_liste_template_id").references(
      () => tacheListesTemplates.id,
      { onDelete: "set null" },
    ),
    // checklist par défaut pour les occurrences de cette prestation
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
    index("client_services_dates_idx").on(t.dateDebut, t.dateFin),
  ],
);

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
    dateDebutPrevue: timestamptz("date_debut_prevue"),
    dateFinPrevue: timestamptz("date_fin_prevue"),
    dateDebutReelle: timestamptz("date_debut_reelle"),
    dateFinReelle: timestamptz("date_fin_reelle"),
    executionId: uuid("execution_id").references(
      () => clientServiceExecutions.id,
      { onDelete: "set null" },
    ),
    // execution gagnante figée à la génération (prestataire + tarif applicables)
    statut: occurrenceStatutEnum("statut").notNull().default("planifiee"),
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
    index("client_service_occurrences_client_service_idx").on(
      t.clientServiceId,
    ),
    index("client_service_occurrences_site_idx").on(t.siteId),
    index("client_service_occurrences_statut_idx").on(t.statut),
    index("client_service_occurrences_execution_idx").on(t.executionId),
    index("client_service_occurrences_assignee_idx").on(t.assigneeUserId),
    index("client_service_occurrences_dates_prevues_idx").on(
      t.dateDebutPrevue,
      t.dateFinPrevue,
    ),
  ],
);

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
    // prestataire responsable (nullable = non encore assigné)
    dateDebutValidite: timestamptz("date_debut_validite").notNull(),
    dateFinValidite: timestamptz("date_fin_validite"),
    // null = pas de fin (règle perpétuelle jusqu'à désactivation)
    priorite: smallint("priorite").notNull(),
    // plus grand = gagne ; convention : 0=global, 10=bâtiment, 20=zone
    actif: boolean("actif").notNull().default(true),
    modePilotage: modePilotageEnum("mode_pilotage").notNull().default("client"),
    tacheListeTemplateId: uuid("tache_liste_template_id").references(
      () => tacheListesTemplates.id,
      { onDelete: "set null" },
    ),
    // checklist override du prestataire (prioritaire sur celle de la prestation)
    assigneeUserIdDefault: uuid("assignee_user_id_default").references(
      () => user.id,
      { onDelete: "set null" },
    ),
    // intervenant par défaut propagé aux occurrences futures (non rétroactif)
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("client_service_executions_client_service_idx").on(t.clientServiceId),
    index("client_service_executions_site_idx").on(t.siteId),
    index("client_service_executions_actif_idx").on(t.actif),
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
    // abonnement | par_occurrence | installation | frais_livraison
    montantHt: integer("montant_ht").notNull(),
    // prix facturé au client (HT *100) — source de vérité pour la facturation
    coutPrestataireHt: integer("cout_prestataire_ht"),
    // coût réel payé au prestataire (HT *100) — nullable si inconnu / standalone
    margePourcent: integer("marge_pourcent"),
    // marge FM4ALL en % (*100, ex: 12.5% = 1250) — nullable si non applicable
    periodeFacturation: executionPeriodeFacturationEnum("periode_facturation"),
    // requis si typePrix = abonnement (semaine | mois | annee)
    nbOccurrencesIncluses: integer("nb_occurrences_incluses"),
    // optionnel : quota d'occurrences incluses (au-delà → facturation par_occurrence)
    actif: boolean("actif").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("client_service_execution_prix_execution_idx").on(t.executionId),
    index("client_service_execution_prix_type_idx").on(t.typePrix),
    index("client_service_execution_prix_actif_idx").on(t.actif),
    // Index partiel : n'empêche les doublons que sur les lignes actives.
    // Les lignes soft-deleted (actif=false) peuvent coexister avec la même clé.
    uniqueIndex("client_service_execution_prix_udx")
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
      .references(() => clientServices.id, {
        onDelete: "cascade",
      }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, {
        onDelete: "cascade",
      }),
    mode: perimetreModeEnum("mode").notNull(),
    scope: siteAttributionScopeEnum("scope").notNull().default("subtree"),
    ordreAffichage: smallint("ordre_affichage").notNull().default(0),
    // tri UI uniquement — pas de logique métier sur cet ordre
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("client_service_perimetre_client_service_idx").on(t.clientServiceId),
    index("client_service_perimetre_site_idx").on(t.siteId),
    index("client_service_perimetre_mode_idx").on(t.mode),
    uniqueIndex("client_service_perimetre_udx").on(
      t.clientServiceId,
      t.siteId,
      t.mode,
      t.scope,
    ),
  ],
);

/**
 * Pack de tâches nommé (checklist header).
 * Appartient à une entreprise (FM4ALL = pack système, client = pack client, prestataire = pack prestataire).
 */
export const tacheListesTemplates = pgTable(
  "tache_listes_templates",
  {
    id: id(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .references(() => entreprises.id, { onDelete: "set null" }),
    nom: varchar("nom", { length: 255 }).notNull(),
    actif: boolean("actif").notNull().default(true),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("tache_listes_templates_service_idx").on(t.serviceId),
    index("tache_listes_templates_proprietaire_idx").on(
      t.proprietaireEntrepriseId,
    ),
    index("tache_listes_templates_actif_idx").on(t.actif),
  ],
);

/**
 * Item d’un pack de tâches (anciennement services_taches_templates).
 * Renommé + refonte : les items appartiennent maintenant à un pack (tacheListesTemplates).
 */
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
    index("tache_liste_items_liste_template_idx").on(t.listeTemplateId),
    index("tache_liste_items_actif_idx").on(t.actif),
    uniqueIndex("tache_liste_items_order_udx").on(t.listeTemplateId, t.ordre),
  ],
);

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
    // item d'origine du snapshot (null si tâche ad-hoc ou item supprimé)
    ordre: smallint("ordre").notNull(),
    titre: varchar("titre", { length: 255 }).notNull(),
    description: text("description"),
    statut: occurrenceTacheStatutEnum("statut").notNull().default("a_faire"),
    assigneeUserId: uuid("assignee_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    completeeParUserId: uuid("completee_par_user_id").references(
      () => user.id,
      {
        onDelete: "set null",
      },
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
    index("occurrence_taches_occurrence_idx").on(t.occurrenceId),
    index("occurrence_taches_statut_idx").on(t.statut),
    index("occurrence_taches_liste_item_idx").on(t.listeItemId),
    uniqueIndex("occurrence_taches_order_udx").on(t.occurrenceId, t.ordre),
  ],
);

/**
 * Table de traçabilité : enregistre chaque application d'un tarif à un événement.
 * Sert de base pour la facturation future sans jamais modifier l'historique.
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
    // Snapshot immuable : ne jamais modifier, même si le tarif source change
    typePrix: executionTypePrixEnum("type_prix").notNull(),
    montantHtSnapshot: integer("montant_ht_snapshot").notNull(),
    // montant facturé au client (centimes, HT)
    coutPrestataireHtSnapshot: integer("cout_prestataire_ht_snapshot"),
    // coût réel prestataire (centimes, HT) — null si non renseigné
    margePourcentSnapshot: integer("marge_pourcent_snapshot"),
    // marge FM4ALL (%) — null si direct
    // Pour les abonnements : plage de la période facturée
    periodeStart: date("periode_start"),
    periodeEnd: date("periode_end"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
  },
  (t) => [
    index("csp_appliques_execution_prix_idx").on(t.executionPrixId),
    index("csp_appliques_client_service_idx").on(t.clientServiceId),
    index("csp_appliques_occurrence_idx").on(t.occurrenceId),
    // Anti double-facturation : un tarif ne peut être appliqué qu'une fois par occurrence
    uniqueIndex("csp_appliques_par_occurrence_udx").on(
      t.executionPrixId,
      t.occurrenceId,
    ),
    // Anti double-facturation : un abonnement ne peut être appliqué qu'une fois par période
    uniqueIndex("csp_appliques_par_periode_udx").on(
      t.executionPrixId,
      t.periodeStart,
    ),
  ],
);
