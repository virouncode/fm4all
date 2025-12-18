ALTER TABLE "tickets" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'nouveau'::text;--> statement-breakpoint
DROP TYPE "public"."ticket_status";--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('nouveau', 'pris_en_charge', 'en_attente_fournisseur', 'en_attente_client', 'a_valider', 'clos', 'annule', 'rejete');--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'nouveau'::"public"."ticket_status";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "status" SET DATA TYPE "public"."ticket_status" USING "status"::"public"."ticket_status";