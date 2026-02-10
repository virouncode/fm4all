import {
  boolean,
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
  frequenceEnum,
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
    intervalleJours: integer("intervalle_jours"),
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
    actif: boolean("actif").notNull().default(true),
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
    index("client_services_actif_idx").on(t.actif),
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
    prixHt: integer("prix_ht"), // *100
    taux: integer("taux"), // en pourcentage *100
    validFrom: timestamptz("valid_from").notNull(),
    validTo: timestamptz("valid_to"),
    ordre: smallint("ordre").notNull(),
    actif: boolean("actif").notNull().default(true),
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
    ordre: smallint("ordre").notNull().default(0),
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

export const servicesTachesTemplates = pgTable(
  "services_taches_templates",
  {
    id: id(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),

    proprietaireEntrepriseId: uuid("proprietaire_entreprise_id")
      .notNull()
      .references(() => entreprises.id, {
        onDelete: "cascade",
      }),
    serviceEntrepriseId: uuid("service_entreprise_id").references(
      () => serviceEntreprises.id,
      {
        onDelete: "set null",
      },
    ),
    ordre: smallint("ordre").notNull(), // ordre d’affichage / exécution
    titre: varchar("titre", { length: 255 }).notNull(), //le titre de la tâche
    description: text("description"),
    actif: boolean("actif").notNull().default(true),
    dureeEstimeeMinutes: smallint("duree_estimee_minutes"),
    createdById: createdById(() => user),
    updatedById: updatedById(() => user),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("service_task_templates_service_idx").on(t.serviceId),
    index("service_task_templates_actif_idx").on(t.actif),
    // Empêcher deux tâches au même ordre pour un service
    uniqueIndex("service_task_templates_order_udx").on(
      t.proprietaireEntrepriseId,
      t.serviceId,
      t.ordre,
    ),
  ],
);

export const occurrenceTaches = pgTable(
  "occurrence_taches",
  {
    id: id(),
    occurrenceId: uuid("occurrence_id")
      .notNull()
      .references(() => clientServiceOccurrences.id, { onDelete: "cascade" }),
    tacheTemplateId: uuid("tache_template_id").references(
      () => servicesTachesTemplates.id,
      {
        onDelete: "set null",
      },
    ),
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
    index("occurrence_taches_template_idx").on(t.tacheTemplateId),
    uniqueIndex("occurrence_taches_order_udx").on(t.occurrenceId, t.ordre),
  ],
);
