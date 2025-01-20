CREATE TABLE "boissons_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer NOT NULL,
	"consos_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"min_consos_par_semaine" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fruits_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"g_par_semaine_par_personne" integer NOT NULL,
	"min_kg_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"portions_par_semaine_par_personne" integer NOT NULL,
	"min_portions_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
