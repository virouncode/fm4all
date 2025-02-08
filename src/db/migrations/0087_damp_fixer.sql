CREATE TABLE "maintenance_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
