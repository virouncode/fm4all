CREATE TABLE "exutoires_parking_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"nb_exutoires" integer NOT NULL,
	"prix_par_exutoire" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exutoires_parking_tarifs" ADD CONSTRAINT "exutoires_parking_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;