CREATE TYPE "public"."attribution_mode" AS ENUM('inclure', 'exclure');--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD COLUMN "mode" "attribution_mode" DEFAULT 'inclure' NOT NULL;