CREATE TYPE "public"."famille_planification" AS ENUM('recurrence_auto', 'quota_manuel', 'ponctuel');--> statement-breakpoint
CREATE TYPE "public"."mode_ancrage_periode" AS ENUM('contrat', 'civil');--> statement-breakpoint
CREATE TYPE "public"."periode_quota" AS ENUM('trimestre', 'semestre', 'annee');--> statement-breakpoint
CREATE TYPE "public"."type_exception_recurrence" AS ENUM('supprimee', 'deplacee', 'modifiee');--> statement-breakpoint
CREATE TYPE "public"."type_source_occurrence" AS ENUM('regle_recurrence', 'quota_manuel', 'ponctuel');--> statement-breakpoint
CREATE TABLE "client_service_exceptions_recurrence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"regle_recurrence_id" uuid,
	"site_id" uuid,
	"date_originale" timestamp (3) with time zone NOT NULL,
	"type_exception" "type_exception_recurrence" NOT NULL,
	"nouvelle_date_debut" timestamp (3) with time zone,
	"nouvelle_heure_fin" timestamp (3) with time zone,
	"motif" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_service_quotas_planification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"nb_occurrences_par_periode" smallint NOT NULL,
	"periode_quota" "periode_quota" NOT NULL,
	"mode_ancrage_periode" "mode_ancrage_periode" DEFAULT 'contrat' NOT NULL,
	"date_ancrage_periode" date NOT NULL,
	"notes" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_service_quotas_planification_client_service_id_unique" UNIQUE("client_service_id")
);
--> statement-breakpoint
CREATE TABLE "client_service_regles_recurrence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"libelle" varchar(255),
	"dtstart_local" timestamp (0) NOT NULL,
	"fuseau_horaire" varchar(64) DEFAULT 'Europe/Paris' NOT NULL,
	"regle_rrule" text NOT NULL,
	"duree_prevue_minutes" smallint,
	"actif" boolean DEFAULT true NOT NULL,
	"ordre" smallint DEFAULT 0 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entreprise_invitations" RENAME TO "contacts_invitations";--> statement-breakpoint
ALTER TABLE "contacts_invitations" DROP CONSTRAINT "entreprise_invitations_token_unique";--> statement-breakpoint
ALTER TABLE "contacts_invitations" DROP CONSTRAINT "entreprise_invitations_entreprise_id_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts_invitations" DROP CONSTRAINT "entreprise_invitations_created_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "contacts_invitations" DROP CONSTRAINT "entreprise_invitations_updated_by_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "ei_entreprise_id_idx";--> statement-breakpoint
DROP INDEX "ei_token_idx";--> statement-breakpoint
DROP INDEX "client_service_execution_prix_execution_idx";--> statement-breakpoint
DROP INDEX "client_service_execution_prix_type_idx";--> statement-breakpoint
DROP INDEX "client_service_execution_prix_actif_idx";--> statement-breakpoint
DROP INDEX "client_service_execution_prix_udx";--> statement-breakpoint
DROP INDEX "client_service_executions_client_service_idx";--> statement-breakpoint
DROP INDEX "client_service_executions_site_idx";--> statement-breakpoint
DROP INDEX "client_service_executions_actif_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_client_service_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_site_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_statut_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_execution_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_assignee_idx";--> statement-breakpoint
DROP INDEX "client_service_occurrences_dates_prevues_idx";--> statement-breakpoint
DROP INDEX "client_service_perimetre_client_service_idx";--> statement-breakpoint
DROP INDEX "client_service_perimetre_site_idx";--> statement-breakpoint
DROP INDEX "client_service_perimetre_mode_idx";--> statement-breakpoint
DROP INDEX "client_service_perimetre_udx";--> statement-breakpoint
DROP INDEX "csp_appliques_execution_prix_idx";--> statement-breakpoint
DROP INDEX "csp_appliques_client_service_idx";--> statement-breakpoint
DROP INDEX "csp_appliques_occurrence_idx";--> statement-breakpoint
DROP INDEX "csp_appliques_par_occurrence_udx";--> statement-breakpoint
DROP INDEX "csp_appliques_par_periode_udx";--> statement-breakpoint
DROP INDEX "occurrence_taches_occurrence_idx";--> statement-breakpoint
DROP INDEX "occurrence_taches_statut_idx";--> statement-breakpoint
DROP INDEX "occurrence_taches_liste_item_idx";--> statement-breakpoint
DROP INDEX "occurrence_taches_order_udx";--> statement-breakpoint
DROP INDEX "tache_liste_items_liste_template_idx";--> statement-breakpoint
DROP INDEX "tache_liste_items_actif_idx";--> statement-breakpoint
DROP INDEX "tache_liste_items_order_udx";--> statement-breakpoint
DROP INDEX "tache_listes_templates_service_idx";--> statement-breakpoint
DROP INDEX "tache_listes_templates_proprietaire_idx";--> statement-breakpoint
DROP INDEX "tache_listes_templates_actif_idx";--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD COLUMN "type_source" "type_source_occurrence" DEFAULT 'ponctuel' NOT NULL;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD COLUMN "regle_recurrence_id" uuid;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD COLUMN "date_debut_originale" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "famille_planification" "famille_planification" DEFAULT 'recurrence_auto' NOT NULL;--> statement-breakpoint
ALTER TABLE "client_service_exceptions_recurrence" ADD CONSTRAINT "client_service_exceptions_recurrence_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_exceptions_recurrence" ADD CONSTRAINT "client_service_exceptions_recurrence_regle_recurrence_id_client_service_regles_recurrence_id_fk" FOREIGN KEY ("regle_recurrence_id") REFERENCES "public"."client_service_regles_recurrence"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_exceptions_recurrence" ADD CONSTRAINT "client_service_exceptions_recurrence_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_exceptions_recurrence" ADD CONSTRAINT "client_service_exceptions_recurrence_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_exceptions_recurrence" ADD CONSTRAINT "client_service_exceptions_recurrence_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_quotas_planification" ADD CONSTRAINT "client_service_quotas_planification_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_quotas_planification" ADD CONSTRAINT "client_service_quotas_planification_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_quotas_planification" ADD CONSTRAINT "client_service_quotas_planification_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_regles_recurrence" ADD CONSTRAINT "client_service_regles_recurrence_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_regles_recurrence" ADD CONSTRAINT "client_service_regles_recurrence_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_regles_recurrence" ADD CONSTRAINT "client_service_regles_recurrence_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cser_client_service_idx" ON "client_service_exceptions_recurrence" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "cser_regle_recurrence_idx" ON "client_service_exceptions_recurrence" USING btree ("regle_recurrence_id");--> statement-breakpoint
CREATE INDEX "cser_date_originale_idx" ON "client_service_exceptions_recurrence" USING btree ("date_originale");--> statement-breakpoint
CREATE INDEX "csqp_client_service_idx" ON "client_service_quotas_planification" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "csrr_client_service_idx" ON "client_service_regles_recurrence" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "csrr_actif_idx" ON "client_service_regles_recurrence" USING btree ("actif");--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_contact_id_entreprise_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."entreprise_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_regle_recurrence_id_client_service_regles_recurrence_id_fk" FOREIGN KEY ("regle_recurrence_id") REFERENCES "public"."client_service_regles_recurrence"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ci_entreprise_id_idx" ON "contacts_invitations" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "ci_token_idx" ON "contacts_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "ci_contact_id_idx" ON "contacts_invitations" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "csep_execution_idx" ON "client_service_execution_prix" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "csep_type_idx" ON "client_service_execution_prix" USING btree ("type_prix");--> statement-breakpoint
CREATE INDEX "csep_actif_idx" ON "client_service_execution_prix" USING btree ("actif");--> statement-breakpoint
CREATE UNIQUE INDEX "csep_actif_udx" ON "client_service_execution_prix" USING btree ("execution_id","type_prix","periode_facturation") WHERE actif = true;--> statement-breakpoint
CREATE INDEX "cse_client_service_idx" ON "client_service_executions" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "cse_site_idx" ON "client_service_executions" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "cse_actif_idx" ON "client_service_executions" USING btree ("actif");--> statement-breakpoint
CREATE INDEX "cso_client_service_idx" ON "client_service_occurrences" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "cso_site_idx" ON "client_service_occurrences" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "cso_statut_idx" ON "client_service_occurrences" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "cso_execution_idx" ON "client_service_occurrences" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "cso_assignee_idx" ON "client_service_occurrences" USING btree ("assignee_user_id");--> statement-breakpoint
CREATE INDEX "cso_type_source_idx" ON "client_service_occurrences" USING btree ("type_source");--> statement-breakpoint
CREATE INDEX "cso_regle_recurrence_idx" ON "client_service_occurrences" USING btree ("regle_recurrence_id");--> statement-breakpoint
CREATE INDEX "cso_dates_prevues_idx" ON "client_service_occurrences" USING btree ("date_debut_prevue","date_fin_prevue");--> statement-breakpoint
CREATE UNIQUE INDEX "cso_regle_recurrence_udx" ON "client_service_occurrences" USING btree ("client_service_id","regle_recurrence_id","site_id","date_debut_originale") WHERE type_source = 'regle_recurrence';--> statement-breakpoint
CREATE INDEX "csp_client_service_idx" ON "client_service_perimetre" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "csp_site_idx" ON "client_service_perimetre" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "csp_mode_idx" ON "client_service_perimetre" USING btree ("mode");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_udx" ON "client_service_perimetre" USING btree ("client_service_id","site_id","mode","scope");--> statement-breakpoint
CREATE INDEX "cspa_execution_prix_idx" ON "client_service_prix_appliques" USING btree ("execution_prix_id");--> statement-breakpoint
CREATE INDEX "cspa_client_service_idx" ON "client_service_prix_appliques" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "cspa_occurrence_idx" ON "client_service_prix_appliques" USING btree ("occurrence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cspa_par_occurrence_udx" ON "client_service_prix_appliques" USING btree ("execution_prix_id","occurrence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cspa_par_periode_udx" ON "client_service_prix_appliques" USING btree ("execution_prix_id","periode_start");--> statement-breakpoint
CREATE INDEX "client_services_famille_idx" ON "client_services" USING btree ("famille_planification");--> statement-breakpoint
CREATE INDEX "ot_occurrence_idx" ON "occurrence_taches" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "ot_statut_idx" ON "occurrence_taches" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "ot_liste_item_idx" ON "occurrence_taches" USING btree ("liste_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ot_order_udx" ON "occurrence_taches" USING btree ("occurrence_id","ordre");--> statement-breakpoint
CREATE INDEX "tli_liste_template_idx" ON "tache_liste_items" USING btree ("liste_template_id");--> statement-breakpoint
CREATE INDEX "tli_actif_idx" ON "tache_liste_items" USING btree ("actif");--> statement-breakpoint
CREATE UNIQUE INDEX "tli_order_udx" ON "tache_liste_items" USING btree ("liste_template_id","ordre");--> statement-breakpoint
CREATE INDEX "tlt_service_idx" ON "tache_listes_templates" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "tlt_proprietaire_idx" ON "tache_listes_templates" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "tlt_actif_idx" ON "tache_listes_templates" USING btree ("actif");--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "frequence";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "frequence_par_periode";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "intervalle_jours";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "jours_preference";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "heure_debut_preference";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "duree_estimee_minutes";--> statement-breakpoint
ALTER TABLE "client_services" DROP COLUMN "mode_planning";--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_token_unique" UNIQUE("token");--> statement-breakpoint
DROP TYPE "public"."client_service_mode_planning";--> statement-breakpoint
DROP TYPE "public"."frequence";