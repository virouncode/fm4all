CREATE TYPE "public"."typemachine" AS ENUM('cafe', 'lait', 'chocolat');--> statement-breakpoint
CREATE TABLE "choco_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prixUnitaire" integer NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lait_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prixUnitaire" integer NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "the_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prixUnitaire" integer NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" RENAME COLUMN "gamme" TO "type";--> statement-breakpoint
ALTER TABLE "choco_conso_tarifs" ADD CONSTRAINT "choco_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_tarifs" ADD CONSTRAINT "lait_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_tarifs" ADD CONSTRAINT "the_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;