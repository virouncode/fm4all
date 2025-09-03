CREATE TYPE "public"."typeeau" AS ENUM('EF', 'EC', 'EG', 'ECG');--> statement-breakpoint
CREATE TYPE "public"."typepose" AS ENUM('aposer', 'colonne', 'comptoir');--> statement-breakpoint
CREATE TABLE "fontaines" (
	"id" serial PRIMARY KEY NOT NULL,
	"marque" varchar NOT NULL,
	"modele" varchar NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontaines_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typeeau" NOT NULL,
	"type_pose" "typepose" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"one_shot" integer,
	"pa_12m" integer,
	"rac_12m" integer,
	"pa_24m" integer,
	"rac_24m" integer,
	"pa_36m" integer,
	"pa_48m" integer,
	"pa_60m" integer,
	"pa_maintenance" integer,
	"frais_installation" integer,
	"pa_conso_filtres" integer,
	"pa_conso_co2" integer,
	"pa_conso_eau_chaude" integer,
	"fontaine_id" integer,
	"reconditionne" boolean DEFAULT false,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" ADD CONSTRAINT "fontaines_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" ADD CONSTRAINT "fontaines_tarifs_fontaine_id_fontaines_id_fk" FOREIGN KEY ("fontaine_id") REFERENCES "public"."fontaines"("id") ON DELETE no action ON UPDATE no action;