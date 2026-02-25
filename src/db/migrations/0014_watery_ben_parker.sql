CREATE TYPE "public"."client_service_mode_planning" AS ENUM('planifie', 'a_la_demande');--> statement-breakpoint
CREATE TYPE "public"."client_service_statut" AS ENUM('brouillon', 'actif', 'en_pause', 'termine');--> statement-breakpoint
ALTER TABLE "client_services" RENAME COLUMN "actif" TO "statut";--> statement-breakpoint
DROP INDEX "client_services_actif_idx";--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "mode_planning" "client_service_mode_planning" DEFAULT 'planifie' NOT NULL;--> statement-breakpoint
CREATE INDEX "client_services_statut_idx" ON "client_services" USING btree ("statut");