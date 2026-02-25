CREATE TYPE "public"."execution_periode_facturation" AS ENUM('semaine', 'mois', 'annee');--> statement-breakpoint
CREATE TYPE "public"."execution_type_prix" AS ENUM('abonnement', 'par_occurrence', 'installation', 'frais_livraison');--> statement-breakpoint
CREATE TABLE "client_service_execution_prix" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"type_prix" "execution_type_prix" NOT NULL,
	"montant_ht" integer NOT NULL,
	"cout_prestataire_ht" integer,
	"marge_pourcent" integer,
	"periode_facturation" "execution_periode_facturation",
	"nb_occurrences_incluses" integer,
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "client_service_executions" RENAME COLUMN "valid_from" TO "date_debut_validite";--> statement-breakpoint
ALTER TABLE "client_service_executions" RENAME COLUMN "valid_to" TO "date_fin_validite";--> statement-breakpoint
ALTER TABLE "client_service_executions" RENAME COLUMN "ordre" TO "priorite";--> statement-breakpoint
ALTER TABLE "client_service_perimetre" RENAME COLUMN "ordre" TO "ordre_affichage";--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD COLUMN "execution_id" uuid;--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "jours_semaine" jsonb;--> statement-breakpoint
ALTER TABLE "client_service_execution_prix" ADD CONSTRAINT "client_service_execution_prix_execution_id_client_service_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."client_service_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_execution_prix" ADD CONSTRAINT "client_service_execution_prix_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_execution_prix" ADD CONSTRAINT "client_service_execution_prix_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_service_execution_prix_execution_idx" ON "client_service_execution_prix" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "client_service_execution_prix_type_idx" ON "client_service_execution_prix" USING btree ("type_prix");--> statement-breakpoint
CREATE INDEX "client_service_execution_prix_actif_idx" ON "client_service_execution_prix" USING btree ("actif");--> statement-breakpoint
CREATE UNIQUE INDEX "client_service_execution_prix_udx" ON "client_service_execution_prix" USING btree ("execution_id","type_prix","periode_facturation");--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_execution_id_client_service_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."client_service_executions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_service_occurrences_execution_idx" ON "client_service_occurrences" USING btree ("execution_id");--> statement-breakpoint
ALTER TABLE "client_service_executions" DROP COLUMN "prix_ht";--> statement-breakpoint
ALTER TABLE "client_service_executions" DROP COLUMN "taux";