CREATE TABLE "hygiene_distrib_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typehygiene" NOT NULL,
	"gamme" "gamme" NOT NULL,
	"one_shot" integer,
	"pa_12m" integer,
	"pa_24m" integer,
	"pa_36m" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ADD CONSTRAINT "hygiene_distrib_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;