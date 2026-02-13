ALTER TABLE "user_site_attributions" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role_attribution_site";--> statement-breakpoint
CREATE TYPE "public"."role_attribution_site" AS ENUM('responsable_site', 'demandeur_site', 'observateur_site', 'intervenant_site');--> statement-breakpoint
ALTER TABLE "user_site_attributions" ALTER COLUMN "role" SET DATA TYPE "public"."role_attribution_site" USING "role"::"public"."role_attribution_site";