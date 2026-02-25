ALTER TABLE "tickets" ALTER COLUMN "statut" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "statut" SET DEFAULT 'nouveau'::text;--> statement-breakpoint
DROP TYPE "public"."ticket_statut";--> statement-breakpoint
CREATE TYPE "public"."ticket_statut" AS ENUM('nouveau', 'pris_en_charge', 'en_attente_prestataire', 'en_attente_client', 'a_valider', 'clos', 'annule', 'rejete');--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "statut" SET DEFAULT 'nouveau'::"public"."ticket_statut";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "statut" SET DATA TYPE "public"."ticket_statut" USING "statut"::"public"."ticket_statut";