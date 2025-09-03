CREATE TABLE "legio_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "q18_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qualite_air_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
