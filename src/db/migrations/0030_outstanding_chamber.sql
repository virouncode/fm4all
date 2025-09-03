CREATE TABLE "temp_fruits_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer NOT NULL,
	"kg_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
