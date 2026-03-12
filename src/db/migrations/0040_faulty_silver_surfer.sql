CREATE TABLE "document_tag_links" (
	"document_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "document_tag_links_document_id_tag_id_pk" PRIMARY KEY("document_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "documents_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"nom" varchar(50) NOT NULL,
	"couleur" varchar(7),
	"created_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DEFAULT 'public'::text;--> statement-breakpoint
UPDATE "documents_links" SET "visibilite" = 'public' WHERE "visibilite" IN ('fm4all_only', 'client_only', 'fournisseur_only');--> statement-breakpoint
DROP TYPE "public"."document_visibilite";--> statement-breakpoint
CREATE TYPE "public"."document_visibilite" AS ENUM('prive', 'public');--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DEFAULT 'public'::"public"."document_visibilite";--> statement-breakpoint
ALTER TABLE "documents_links" ALTER COLUMN "visibilite" SET DATA TYPE "public"."document_visibilite" USING "visibilite"::"public"."document_visibilite";--> statement-breakpoint
ALTER TABLE "document_tag_links" ADD CONSTRAINT "document_tag_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_tag_links" ADD CONSTRAINT "document_tag_links_tag_id_documents_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."documents_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_tags" ADD CONSTRAINT "documents_tags_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_tags" ADD CONSTRAINT "documents_tags_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_tag_links_tag_idx" ON "document_tag_links" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "documents_tags_owner_idx" ON "documents_tags" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_tags_owner_nom_udx" ON "documents_tags" USING btree ("proprietaire_entreprise_id","nom");