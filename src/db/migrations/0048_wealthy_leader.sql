CREATE TABLE "services_fm4all_taux" (
	"id" serial PRIMARY KEY NOT NULL,
	"assurance" integer NOT NULL,
	"plateforme" integer NOT NULL,
	"min_facturation_plateforme" integer NOT NULL,
	"support_admin" integer NOT NULL,
	"support_op" integer NOT NULL,
	"min_facturation_support_op" integer NOT NULL,
	"account_manager" integer NOT NULL,
	"min_facturation_account_manager" integer NOT NULL,
	"remise_ca_seuil" integer NOT NULL,
	"remise_ca" integer NOT NULL,
	"remise_hof" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
