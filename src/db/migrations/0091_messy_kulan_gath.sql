CREATE TABLE "incendie_quantites" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"nb_extincteurs" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
