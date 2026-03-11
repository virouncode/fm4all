CREATE TYPE "public"."facture_ligne_type_source" AS ENUM('manuel', 'prix_applique');--> statement-breakpoint
CREATE TYPE "public"."invitation_type_adhesion" AS ENUM('client', 'prestataire');--> statement-breakpoint
CREATE SEQUENCE "public"."facture_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "facture_lignes_prix_appliques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facture_ligne_id" uuid NOT NULL,
	"client_service_prix_applique_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "statut" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "statut" SET DEFAULT 'brouillon'::text;--> statement-breakpoint
DROP TYPE "public"."facture_statut";--> statement-breakpoint
CREATE TYPE "public"."facture_statut" AS ENUM('brouillon', 'emise', 'litige', 'annulee');--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "statut" SET DEFAULT 'brouillon'::"public"."facture_statut";--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "statut" SET DATA TYPE "public"."facture_statut" USING "statut"::"public"."facture_statut";--> statement-breakpoint
DROP INDEX "factures_owner_idx";--> statement-breakpoint
DROP INDEX "factures_numero_owner_udx";--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "numero" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "numero" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "periode_debut" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "periode_fin" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "date_emission" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "factures" ALTER COLUMN "date_emission" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "entreprise_invitations" ADD COLUMN "type_adhesion" "invitation_type_adhesion" NOT NULL;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "unite" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "remise_ht_montant" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "type_source" "facture_ligne_type_source" DEFAULT 'manuel' NOT NULL;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "montant_ht" integer;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "montant_tva" integer;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD COLUMN "montant_ttc" integer;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "site_id" uuid;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "titre" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "note_interne" text;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "notes_client" text;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "remise_globale_ht" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "montant_ht" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "montant_tva" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "factures" ADD COLUMN "montant_ttc" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "facture_lignes_prix_appliques" ADD CONSTRAINT "facture_lignes_prix_appliques_facture_ligne_id_facture_lignes_id_fk" FOREIGN KEY ("facture_ligne_id") REFERENCES "public"."facture_lignes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes_prix_appliques" ADD CONSTRAINT "facture_lignes_prix_appliques_client_service_prix_applique_id_client_service_prix_appliques_id_fk" FOREIGN KEY ("client_service_prix_applique_id") REFERENCES "public"."client_service_prix_appliques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes_prix_appliques" ADD CONSTRAINT "facture_lignes_prix_appliques_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes_prix_appliques" ADD CONSTRAINT "facture_lignes_prix_appliques_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flpa_facture_ligne_idx" ON "facture_lignes_prix_appliques" USING btree ("facture_ligne_id");--> statement-breakpoint
CREATE INDEX "flpa_prix_applique_idx" ON "facture_lignes_prix_appliques" USING btree ("client_service_prix_applique_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flpa_unique_udx" ON "facture_lignes_prix_appliques" USING btree ("facture_ligne_id","client_service_prix_applique_id");--> statement-breakpoint
CREATE UNIQUE INDEX "flpa_prix_applique_unique_udx" ON "facture_lignes_prix_appliques" USING btree ("client_service_prix_applique_id");--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "factures_proprietaire_idx" ON "factures" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "factures_site_idx" ON "factures" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "factures_created_at_idx" ON "factures" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "factures_numero_emetteur_udx" ON "factures" USING btree ("emetteur_entreprise_id","numero");--> statement-breakpoint
ALTER TABLE "facture_lignes" DROP COLUMN "total_ht";--> statement-breakpoint
ALTER TABLE "facture_lignes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "factures" DROP COLUMN "total_ht";--> statement-breakpoint
ALTER TABLE "factures" DROP COLUMN "total_tva";--> statement-breakpoint
ALTER TABLE "factures" DROP COLUMN "total_ttc";--> statement-breakpoint
DROP TYPE "public"."facture_ligne_type";