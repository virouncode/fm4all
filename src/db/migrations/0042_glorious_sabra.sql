CREATE TYPE "public"."inclus" AS ENUM('inclus', 'non inclus', 'non propose', 'sur demande');--> statement-breakpoint
CREATE TABLE "services_fm4all_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"gamme" "gamme" NOT NULL,
	"assurance" "inclus" NOT NULL,
	"plateforme" "inclus" NOT NULL,
	"support_admin" "inclus" NOT NULL,
	"support_op" "inclus" NOT NULL,
	"account_manager" "inclus" NOT NULL,
	"audit" "inclus" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_fm4all_taux" (
	"id" serial PRIMARY KEY NOT NULL,
	"assurance" integer NOT NULL,
	"plateforme" integer NOT NULL,
	"support_admin" integer NOT NULL,
	"support_op" integer NOT NULL,
	"account_manager" integer NOT NULL,
	"remise_ca_seuil" integer NOT NULL,
	"remise_ca" integer NOT NULL,
	"remise_hof" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
