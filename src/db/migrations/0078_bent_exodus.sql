CREATE TABLE "nettoyage_vitrerie_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"cadence_vitres" integer NOT NULL,
	"cadence_cloisons" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"min_facturation" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ADD CONSTRAINT "nettoyage_vitrerie_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;