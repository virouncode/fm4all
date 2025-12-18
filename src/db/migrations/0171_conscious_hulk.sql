CREATE TYPE "public"."ticket_type" AS ENUM('incident', 'demande_devis', 'demande_intervention', 'audit', 'autre');--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "categorie" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ticket_categorie";--> statement-breakpoint
CREATE TYPE "public"."ticket_categorie" AS ENUM('proprete', 'consommables', 'degradations', 'electricite', 'plomberie', 'cvc', 'exterieurs', 'securite_incendie', 'cafe', 'fontaines_eau', 'office_management', 'autre');--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "categorie" SET DATA TYPE "public"."ticket_categorie" USING "categorie"::"public"."ticket_categorie";--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "type" "ticket_type";--> statement-breakpoint
CREATE INDEX "tickets_type_idx" ON "tickets" USING btree ("type");