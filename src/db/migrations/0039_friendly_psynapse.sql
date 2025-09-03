CREATE TABLE "boissons_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boissons_tarifs" ADD CONSTRAINT "boissons_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;