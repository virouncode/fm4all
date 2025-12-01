CREATE TYPE "public"."intervention_status" AS ENUM('en_attente_confirmation', 'planifiee', 'en_cours', 'realisee', 'annulee', 'non_honoree');--> statement-breakpoint
CREATE TYPE "public"."intervention_type" AS ENUM('corrective', 'preventive', 'audit', 'autre');--> statement-breakpoint
CREATE TABLE "interventions" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"ticket_id" integer,
	"type" "intervention_type" NOT NULL,
	"status" "intervention_status" NOT NULL,
	"confirmee_client" boolean NOT NULL,
	"confirmee_fournisseur" boolean NOT NULL,
	"client_confirmed_at" timestamp (3) with time zone,
	"fournisseur_confirmed_at" timestamp (3) with time zone,
	"date_debut_prevue" timestamp (3) with time zone NOT NULL,
	"date_fin_prevue" timestamp (3) with time zone,
	"date_debut_reelle" timestamp (3) with time zone,
	"date_fin_reelle" timestamp (3) with time zone,
	"titre" varchar NOT NULL,
	"description" varchar,
	"created_by_id" text,
	"updated_by_id" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interventions_client_id_idx" ON "interventions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "interventions_site_id_idx" ON "interventions" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "interventions_fournisseur_id_idx" ON "interventions" USING btree ("fournisseur_id");--> statement-breakpoint
CREATE INDEX "interventions_ticket_id_idx" ON "interventions" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "interventions_status_idx" ON "interventions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interventions_date_debut_prevue_idx" ON "interventions" USING btree ("date_debut_prevue");