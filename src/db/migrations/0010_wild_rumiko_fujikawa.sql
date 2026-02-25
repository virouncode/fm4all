ALTER TABLE "ticket_messages" ALTER COLUMN "visibilite" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ticket_messages" ALTER COLUMN "visibilite" SET DEFAULT 'public'::text;--> statement-breakpoint
DROP TYPE "public"."ticket_message_visibilite";--> statement-breakpoint
CREATE TYPE "public"."ticket_message_visibilite" AS ENUM('public', 'fm4all_only', 'client_only', 'prestataire_only');--> statement-breakpoint
ALTER TABLE "ticket_messages" ALTER COLUMN "visibilite" SET DEFAULT 'public'::"public"."ticket_message_visibilite";--> statement-breakpoint
ALTER TABLE "ticket_messages" ALTER COLUMN "visibilite" SET DATA TYPE "public"."ticket_message_visibilite" USING "visibilite"::"public"."ticket_message_visibilite";