CREATE TABLE "nettoyage_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
