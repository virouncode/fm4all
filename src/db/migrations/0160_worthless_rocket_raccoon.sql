CREATE TYPE "public"."devis_ligne_unite" AS ENUM('unite', 'paire', 'piece', 'article', 'ensemble', 'lot', 'seconde', 'minute', 'heure', 'jour', 'semaine', 'deux_semaines', 'quatre_semaines', 'trimestre', 'semestre', 'mois', 'annee', 'milligramme', 'gramme', 'kilogramme', 'tonne', 'millilitre', 'centilitre', 'litre', 'millimetre', 'centimètre', 'metre', 'metre_carre', 'metre_cube', 'metre_cube_par_heure', 'ampère', 'gigajoule', 'gigawatt', 'gigawatt_par_heure', 'joule', 'kilojoule', 'kilovar', 'kilowatt', 'kilowatt_par_heure', 'megajoule', 'megawatt', 'megawatt_par_heure', 'voltampere', 'voltampere_reactif', 'wattheure');--> statement-breakpoint
CREATE TYPE "public"."devis_status" AS ENUM('brouillon', 'emis', 'signe', 'refuse');--> statement-breakpoint
CREATE TYPE "public"."devis_type_prix" AS ENUM('forfait', 'one_shot');--> statement-breakpoint
CREATE TABLE "devis_lignes" (
	"id" serial PRIMARY KEY NOT NULL,
	"devis_id" integer NOT NULL,
	"ordre" integer NOT NULL,
	"libelle" varchar(255) NOT NULL,
	"description" text,
	"quantite" numeric(12, 3) NOT NULL,
	"unite" "devis_ligne_unite" NOT NULL,
	"prix_unitaire_ht" integer NOT NULL,
	"total_ligne_ht" integer NOT NULL,
	"remise_ht" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" text,
	"updated_by_id" text
);
--> statement-breakpoint
ALTER TABLE "demandes_devis" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "demandes_devis" CASCADE;--> statement-breakpoint
ALTER TABLE "devis" DROP CONSTRAINT "devis_prospect_id_prospects_id_fk";
--> statement-breakpoint
ALTER TABLE "devis" DROP CONSTRAINT "devis_client_id_clients_id_fk";
--> statement-breakpoint
-- ALTER TABLE "tickets" DROP CONSTRAINT "tickets_demande_devis_id_demandes_devis_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "categorie" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ticket_categorie";--> statement-breakpoint
CREATE TYPE "public"."ticket_categorie" AS ENUM('proprete', 'consommables', 'degradations', 'electricite', 'plomberie', 'cvc', 'exterieurs', 'securite_incendie', 'cafe', 'fontaines_eau', 'office_management', 'demande_devis', 'autre');--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "categorie" SET DATA TYPE "public"."ticket_categorie" USING "categorie"::"public"."ticket_categorie";--> statement-breakpoint
ALTER TABLE "devis" ALTER COLUMN "devis_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "fournisseur_id" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "ticket_id" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "site_id" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "titre" varchar(255);--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "type_prix" "devis_type_prix";--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "marge_coefficient" numeric(9, 8);--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "total_one_shot_ht" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "total_mensuel_ht" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "total_installation_ht" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "date_validite" date;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "status" "devis_status";--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "signed_at" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "created_by_id" text;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "updated_by_id" text;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_devis_id_devis_id_fk" FOREIGN KEY ("devis_id") REFERENCES "public"."devis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "devis_lignes_devis_id_idx" ON "devis_lignes" USING btree ("devis_id");--> statement-breakpoint
CREATE INDEX "devis_lignes_created_at_idx" ON "devis_lignes" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "devis_client_id_idx" ON "devis" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "devis_ticket_id_idx" ON "devis" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "devis_fournisseur_id_idx" ON "devis" USING btree ("fournisseur_id");--> statement-breakpoint
CREATE INDEX "devis_status_idx" ON "devis" USING btree ("status");--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "demande_devis_id";--> statement-breakpoint
DROP TYPE "public"."demande_devis_categorie";--> statement-breakpoint
DROP TYPE "public"."demande_devis_status";