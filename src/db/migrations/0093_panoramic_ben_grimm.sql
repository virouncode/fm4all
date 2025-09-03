CREATE TABLE "incendie_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"prix_par_extincteur" integer NOT NULL,
	"prix_par_baes" integer NOT NULL,
	"prix_par_tel_baes" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incendie_tarifs" ADD CONSTRAINT "incendie_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;