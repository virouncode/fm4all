CREATE TYPE "public"."possibilite" AS ENUM('possible', 'non', 'obligatoire');--> statement-breakpoint
CREATE TABLE "cafe_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prixUnitaire" integer NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"limite_boissons_j" integer NOT NULL,
	"prix_installation" integer,
	"oneShot" integer,
	"pa_12m" integer,
	"pa_24m" integer,
	"pa_36m" integer,
	"pa_48m" integer,
	"pa_60m" integer,
	"rac_12m" integer,
	"rac_24m" integer,
	"pa_maintenance" integer,
	"marque" varchar,
	"modele" varchar,
	"nb_boissons" integer,
	"reconditionne" boolean DEFAULT false,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer NOT NULL,
	"nb_cafes_par_an" integer NOT NULL,
	"nb_machines" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cafe_conso_tarifs" ADD CONSTRAINT "cafe_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;