CREATE TYPE "public"."demande_devis_categorie" AS ENUM('proprete', 'consommables', 'degradations', 'electricite', 'plomberie', 'cvc', 'exterieurs', 'securite_incendie', 'cafe', 'fontaines_eau', 'office_management', 'autre');--> statement-breakpoint
CREATE TYPE "public"."demande_devis_status" AS ENUM('nouvelle', 'en_cours', 'devis_envoye', 'cloturee', 'annulee');--> statement-breakpoint
ALTER TYPE "public"."ticket_categorie" ADD VALUE 'devis' BEFORE 'autre';--> statement-breakpoint
CREATE TABLE "demandes_devis" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"site_id" integer,
	"titre" varchar NOT NULL,
	"description" text NOT NULL,
	"categorie" "demande_devis_categorie" NOT NULL,
	"status" "demande_devis_status" NOT NULL,
	"created_by_id" text NOT NULL,
	"updated_by_id" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets_attachments" DROP CONSTRAINT "tickets_attachments_uploaded_by_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "tickets_attachment_uploaded_by_id_idx";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "client_id" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "demande_devis_id" integer;--> statement-breakpoint
ALTER TABLE "demandes_devis" ADD CONSTRAINT "demandes_devis_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_devis" ADD CONSTRAINT "demandes_devis_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_devis" ADD CONSTRAINT "demandes_devis_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_devis" ADD CONSTRAINT "demandes_devis_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_demande_devis_id_demandes_devis_id_fk" FOREIGN KEY ("demande_devis_id") REFERENCES "public"."demandes_devis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_attachments" DROP COLUMN "uploaded_by_id";--> statement-breakpoint
ALTER TABLE "tickets_attachments" DROP COLUMN "updated_at";