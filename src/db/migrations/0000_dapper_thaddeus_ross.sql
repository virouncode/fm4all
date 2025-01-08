CREATE TYPE "public"."gamme" AS ENUM('essentiel', 'confort', 'excellence');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."typebatiment" AS ENUM('bureaux', 'localCommercial', 'entrepot', 'cabinetMedical');--> statement-breakpoint
CREATE TYPE "public"."typehygiene" AS ENUM('emp', 'savon', 'ph', 'desinfectant', 'parfum', 'balai', 'poubelle');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom_entreprise" varchar NOT NULL,
	"siret" varchar NOT NULL,
	"prenom_contact" varchar NOT NULL,
	"nom_contact" varchar NOT NULL,
	"email_contact" varchar NOT NULL,
	"phone_contact" varchar NOT NULL,
	"surface" integer NOT NULL,
	"effectif" integer NOT NULL,
	"typeBatiment" "typebatiment" NOT NULL,
	"adresse_ligne_1" varchar NOT NULL,
	"adresse_ligne_2" varchar,
	"code_postal" varchar NOT NULL,
	"ville" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_contact_unique" UNIQUE("email_contact")
);
--> statement-breakpoint
CREATE TABLE "fournisseurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom_entreprise" varchar NOT NULL,
	"siret" varchar NOT NULL,
	"prenom_contact" varchar NOT NULL,
	"nom_contact" varchar NOT NULL,
	"email_contact" varchar NOT NULL,
	"phone_contact" varchar NOT NULL,
	"date_chiffrage" date NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"slogan" varchar,
	"logo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fournisseurs_email_contact_unique" UNIQUE("email_contact")
);
--> statement-breakpoint
CREATE TABLE "logos_fournisseurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_repasse_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_vitrerie_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"cadence_vitres" integer NOT NULL,
	"cadence_cloisons" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"min_facturation" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"pa_par_personne_emp" integer NOT NULL,
	"pa_par_personne_savon" integer NOT NULL,
	"pa_par_personne_ph" integer NOT NULL,
	"pa_par_personne_desinfectant" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer NOT NULL,
	"nb_distrib_emp" integer NOT NULL,
	"nb_distrib_savon" integer NOT NULL,
	"nb_distrib_ph" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"type" "typehygiene" NOT NULL,
	"gamme" "gamme" NOT NULL,
	"one_shot" integer NOT NULL,
	"pa_12m" integer,
	"pa_24m" integer,
	"pa_36m" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_instal_distrib_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"effectif" integer NOT NULL,
	"prix_installation" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_logo_id_logos_fournisseurs_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."logos_fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_tarifs" ADD CONSTRAINT "nettoyage_repasse_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" ADD CONSTRAINT "nettoyage_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ADD CONSTRAINT "nettoyage_vitrerie_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ADD CONSTRAINT "hygiene_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ADD CONSTRAINT "hygiene_distrib_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" ADD CONSTRAINT "hygiene_instal_distrib_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;