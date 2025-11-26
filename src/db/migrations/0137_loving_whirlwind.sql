CREATE TYPE "public"."ticket_priorite" AS ENUM('basse', 'normale', 'haute', 'critique');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('nouveau', 'en_cours', 'a_valider', 'clos');--> statement-breakpoint
CREATE TABLE "client_fournisseurs" (
	"client_id" integer NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_fournisseurs_client_id_fournisseur_id_pk" PRIMARY KEY("client_id","fournisseur_id")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"nom_site" varchar NOT NULL,
	"adresse_ligne_1" varchar,
	"adresse_ligne_2" varchar,
	"code_postal" varchar NOT NULL,
	"ville" varchar NOT NULL,
	"surface" integer,
	"effectif" integer,
	"type_batiment" "typebatiment",
	"type_occupation" "typeoccupation",
	"commentaires" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"site_id" integer,
	"fournisseur_id" integer,
	"created_by_user_id" text NOT NULL,
	"titre" varchar NOT NULL,
	"description" varchar,
	"categorie" varchar,
	"priorite" "ticket_priorite" DEFAULT 'normale' NOT NULL,
	"status" "ticket_status" DEFAULT 'nouveau' NOT NULL,
	"date_cloture" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "alarmes_tarifs" DROP CONSTRAINT "alarmes_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "boissons_tarifs" DROP CONSTRAINT "boissons_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "cafe_conso_tarifs" DROP CONSTRAINT "cafe_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" DROP CONSTRAINT "cafe_machines_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" DROP CONSTRAINT "cafe_machines_tarifs_cafe_machine_id_cafe_machines_id_fk";
--> statement-breakpoint
ALTER TABLE "chocolat_conso_tarifs" DROP CONSTRAINT "chocolat_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "colonnes_seches_tarifs" DROP CONSTRAINT "colonnes_seches_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "devis" DROP CONSTRAINT "devis_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "devis_temporaires" DROP CONSTRAINT "devis_temporaires_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "exutoires_parking_tarifs" DROP CONSTRAINT "exutoires_parking_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "exutoires_tarifs" DROP CONSTRAINT "exutoires_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" DROP CONSTRAINT "fontaines_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" DROP CONSTRAINT "fontaines_tarifs_fontaine_id_fontaines_id_fk";
--> statement-breakpoint
ALTER TABLE "food_livraison_tarifs" DROP CONSTRAINT "food_livraison_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "fruits_tarifs" DROP CONSTRAINT "fruits_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" DROP CONSTRAINT "hygiene_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" DROP CONSTRAINT "hygiene_distrib_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" DROP CONSTRAINT "hygiene_instal_distrib_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_min_facturation" DROP CONSTRAINT "hygiene_min_facturation_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "incendie_tarifs" DROP CONSTRAINT "incendie_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "lait_conso_tarifs" DROP CONSTRAINT "lait_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "legio_tarifs" DROP CONSTRAINT "legio_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "maintenance_tarifs" DROP CONSTRAINT "maintenance_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_tarifs" DROP CONSTRAINT "nettoyage_repasse_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" DROP CONSTRAINT "nettoyage_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" DROP CONSTRAINT "nettoyage_vitrerie_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "office_manager_tarifs" DROP CONSTRAINT "office_manager_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "portes_coupe_feu_tarifs" DROP CONSTRAINT "portes_coupe_feu_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "q18_tarifs" DROP CONSTRAINT "q18_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "qualite_air_tarifs" DROP CONSTRAINT "qualite_air_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "ria_tarifs" DROP CONSTRAINT "ria_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "services_fournisseurs" DROP CONSTRAINT "services_fournisseurs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "services_fournisseurs" DROP CONSTRAINT "services_fournisseurs_service_id_services_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "snacks_tarifs" DROP CONSTRAINT "snacks_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "sucre_conso_tarifs" DROP CONSTRAINT "sucre_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "the_conso_tarifs" DROP CONSTRAINT "the_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_client_id_clients_id_fk";
--> statement-breakpoint
CREATE INDEX "client_fournisseurs_client_idx" ON "client_fournisseurs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_fournisseurs_fournisseur_idx" ON "client_fournisseurs" USING btree ("fournisseur_id");--> statement-breakpoint
CREATE INDEX "sites_client_id_idx" ON "sites" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "sites_code_postal_idx" ON "sites" USING btree ("code_postal");--> statement-breakpoint
CREATE INDEX "sites_ville_idx" ON "sites" USING btree ("ville");--> statement-breakpoint
CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_client_id_idx" ON "tickets" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "tickets_site_id_idx" ON "tickets" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "tickets_fournisseur_id_idx" ON "tickets" USING btree ("fournisseur_id");--> statement-breakpoint
CREATE INDEX "tickets_created_by_user_id_idx" ON "tickets" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_priorite_idx" ON "tickets" USING btree ("priorite");