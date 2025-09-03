CREATE TABLE "office_manager_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"demi_j_par_semaine" integer NOT NULL,
	"majoration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_manager_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"demi_tjm" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "office_manager_tarifs" ADD CONSTRAINT "office_manager_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;