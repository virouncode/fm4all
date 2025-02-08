CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom_entreprise" varchar NOT NULL,
	"siret" varchar,
	"prenom_contact" varchar NOT NULL,
	"nom_contact" varchar NOT NULL,
	"poste_contact" varchar NOT NULL,
	"email_contact" varchar NOT NULL,
	"phone_contact" varchar NOT NULL,
	"prenom_signataire" varchar,
	"nom_signataire" varchar,
	"poste_signataire" varchar,
	"email_signataire" varchar,
	"surface" integer NOT NULL,
	"effectif" integer NOT NULL,
	"typeBatiment" "typebatiment" NOT NULL,
	"typeOccupation" "typeoccupation" NOT NULL,
	"adresse_ligne_1" varchar,
	"adresse_ligne_2" varchar,
	"code_postal" varchar NOT NULL,
	"ville" varchar NOT NULL,
	"date_de_demarrage" date,
	"commentaires" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devis" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"texte" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;