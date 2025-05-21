CREATE TABLE "hygiene_min_facturation" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"min_facturation" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hygiene_min_facturation" ADD CONSTRAINT "hygiene_min_facturation_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" DROP COLUMN "min_facturation";