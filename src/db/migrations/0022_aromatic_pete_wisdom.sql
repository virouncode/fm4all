CREATE TYPE "public"."role_prestataire_adhesion" AS ENUM('admin', 'manager', 'collaborateur');--> statement-breakpoint
CREATE TYPE "public"."role_prestataire_attribution_site" AS ENUM('responsable_site', 'demandeur_site', 'observateur_site', 'intervenant_site');--> statement-breakpoint
ALTER TYPE "public"."role_adhesion" RENAME TO "role_client_adhesion";--> statement-breakpoint
ALTER TYPE "public"."role_attribution_site" RENAME TO "role_client_attribution_site";--> statement-breakpoint
CREATE TABLE "user_prestataire_adhesions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"role" "role_prestataire_adhesion" NOT NULL,
	"statut" "adhesion_statut" DEFAULT 'actif' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_prestataire_site_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"mode" "attribution_mode" DEFAULT 'inclure' NOT NULL,
	"scope" "site_attribution_scope" DEFAULT 'subtree' NOT NULL,
	"role" "role_prestataire_attribution_site" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "user_adhesions" RENAME TO "user_client_adhesions";--> statement-breakpoint
ALTER TABLE "user_site_attributions" RENAME TO "user_client_site_attributions";--> statement-breakpoint
ALTER TABLE "user_client_adhesions" DROP CONSTRAINT "user_adhesions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_adhesions" DROP CONSTRAINT "user_adhesions_entreprise_id_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_adhesions" DROP CONSTRAINT "user_adhesions_created_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_adhesions" DROP CONSTRAINT "user_adhesions_updated_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" DROP CONSTRAINT "user_site_attributions_entreprise_id_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" DROP CONSTRAINT "user_site_attributions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" DROP CONSTRAINT "user_site_attributions_site_id_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" DROP CONSTRAINT "user_site_attributions_created_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" DROP CONSTRAINT "user_site_attributions_updated_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role_client_attribution_site";--> statement-breakpoint
CREATE TYPE "public"."role_client_attribution_site" AS ENUM('responsable_site', 'demandeur_site', 'observateur_site');--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ALTER COLUMN "role" SET DATA TYPE "public"."role_client_attribution_site" USING "role"::"public"."role_client_attribution_site";--> statement-breakpoint
DROP INDEX "user_adhesions_user_id_idx";--> statement-breakpoint
DROP INDEX "user_adhesions_entreprise_id_idx";--> statement-breakpoint
DROP INDEX "user_adhesions_statut_idx";--> statement-breakpoint
DROP INDEX "user_adhesions_user_entreprise_udx";--> statement-breakpoint
DROP INDEX "user_site_attributions_entreprise_id_idx";--> statement-breakpoint
DROP INDEX "user_site_attributions_user_id_idx";--> statement-breakpoint
DROP INDEX "user_site_attributions_site_id_idx";--> statement-breakpoint
DROP INDEX "user_site_attributions_user_site_entreprise_udx";--> statement-breakpoint
ALTER TABLE "user_prestataire_adhesions" ADD CONSTRAINT "user_prestataire_adhesions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_adhesions" ADD CONSTRAINT "user_prestataire_adhesions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_adhesions" ADD CONSTRAINT "user_prestataire_adhesions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_adhesions" ADD CONSTRAINT "user_prestataire_adhesions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_site_attributions" ADD CONSTRAINT "user_prestataire_site_attributions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_site_attributions" ADD CONSTRAINT "user_prestataire_site_attributions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_site_attributions" ADD CONSTRAINT "user_prestataire_site_attributions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_site_attributions" ADD CONSTRAINT "user_prestataire_site_attributions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_prestataire_site_attributions" ADD CONSTRAINT "user_prestataire_site_attributions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_prestataire_adhesions_user_id_idx" ON "user_prestataire_adhesions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_prestataire_adhesions_entreprise_id_idx" ON "user_prestataire_adhesions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_prestataire_adhesions_statut_idx" ON "user_prestataire_adhesions" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "user_prestataire_adhesions_user_entreprise_udx" ON "user_prestataire_adhesions" USING btree ("user_id","entreprise_id");--> statement-breakpoint
CREATE INDEX "user_prestataire_site_attributions_entreprise_id_idx" ON "user_prestataire_site_attributions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_prestataire_site_attributions_user_id_idx" ON "user_prestataire_site_attributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_prestataire_site_attributions_site_id_idx" ON "user_prestataire_site_attributions" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_prestataire_site_attributions_user_site_entreprise_udx" ON "user_prestataire_site_attributions" USING btree ("user_id","site_id","entreprise_id");--> statement-breakpoint
ALTER TABLE "user_client_adhesions" ADD CONSTRAINT "user_client_adhesions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_adhesions" ADD CONSTRAINT "user_client_adhesions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_adhesions" ADD CONSTRAINT "user_client_adhesions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_adhesions" ADD CONSTRAINT "user_client_adhesions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ADD CONSTRAINT "user_client_site_attributions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ADD CONSTRAINT "user_client_site_attributions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ADD CONSTRAINT "user_client_site_attributions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ADD CONSTRAINT "user_client_site_attributions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_client_site_attributions" ADD CONSTRAINT "user_client_site_attributions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_client_adhesions_user_id_idx" ON "user_client_adhesions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_client_adhesions_entreprise_id_idx" ON "user_client_adhesions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_client_adhesions_statut_idx" ON "user_client_adhesions" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "user_client_adhesions_user_entreprise_udx" ON "user_client_adhesions" USING btree ("user_id","entreprise_id");--> statement-breakpoint
CREATE INDEX "user_client_site_attributions_entreprise_id_idx" ON "user_client_site_attributions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_client_site_attributions_user_id_idx" ON "user_client_site_attributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_client_site_attributions_site_id_idx" ON "user_client_site_attributions" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_client_site_attributions_user_site_entreprise_udx" ON "user_client_site_attributions" USING btree ("user_id","site_id","entreprise_id");