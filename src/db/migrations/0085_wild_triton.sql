CREATE TABLE "hygiene_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer,
	"fournisseur_id" integer NOT NULL,
	"pa_par_personne_emp" integer NOT NULL,
	"pa_par_personne_savon" integer NOT NULL,
	"pa_par_personne_ph" integer NOT NULL,
	"pa_par_personne_desinfectant" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ADD CONSTRAINT "hygiene_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;