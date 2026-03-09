CREATE TYPE "public"."devis_demande_statut" AS ENUM('ouverte', 'en_cours', 'cloturee', 'annulee', 'archivee');--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD COLUMN "statut" "devis_demande_statut" DEFAULT 'ouverte' NOT NULL;
