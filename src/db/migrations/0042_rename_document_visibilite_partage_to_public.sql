-- Rename enum value 'partage' → 'public' in document_visibilite
-- Must drop DEFAULT before dropping the type (PostgreSQL constraint)

ALTER TABLE "documents_links" ALTER COLUMN "visibilite" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DATA TYPE text;--> statement-breakpoint
UPDATE "documents_links" SET "visibilite" = 'public' WHERE "visibilite" = 'partage';--> statement-breakpoint
DROP TYPE "public"."document_visibilite";--> statement-breakpoint
CREATE TYPE "public"."document_visibilite" AS ENUM('prive', 'public');--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DATA TYPE "public"."document_visibilite" USING "visibilite"::"public"."document_visibilite";--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DEFAULT 'public'::"public"."document_visibilite";
