CREATE TYPE "public"."typeoccupation" AS ENUM('partieEtage', 'plateauComplet', 'batimentEntier');--> statement-breakpoint
CREATE TABLE "maintenance_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "poste_contact" varchar;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "typeOccupation" "typeoccupation" NOT NULL;--> statement-breakpoint
ALTER TABLE "maintenance_tarifs" ADD CONSTRAINT "maintenance_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;