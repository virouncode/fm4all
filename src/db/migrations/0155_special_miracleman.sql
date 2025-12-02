CREATE TABLE "prospects" (
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
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "devis_client_id_idx";--> statement-breakpoint
DROP INDEX "devis_temporaires_client_id_idx";--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "prospect_id" integer;--> statement-breakpoint
ALTER TABLE "devis_temporaires" ADD COLUMN "prospect_id" integer;--> statement-breakpoint
CREATE INDEX "prospects_email_contact_idx" ON "prospects" USING btree ("email_contact");--> statement-breakpoint
CREATE INDEX "prospects_siret_idx" ON "prospects" USING btree ("siret");--> statement-breakpoint
CREATE INDEX "prospects_code_postal_idx" ON "prospects" USING btree ("code_postal");--> statement-breakpoint
CREATE INDEX "prospects_ville_idx" ON "prospects" USING btree ("ville");--> statement-breakpoint
CREATE INDEX "prospects_created_at_idx" ON "prospects" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_temporaires" ADD CONSTRAINT "devis_temporaires_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "devis_prospect_id_idx" ON "devis" USING btree ("prospect_id");--> statement-breakpoint
CREATE INDEX "devis_temporaires_prospect_id_idx" ON "devis_temporaires" USING btree ("prospect_id");--> statement-breakpoint
ALTER TABLE "devis" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "devis_temporaires" DROP COLUMN "client_id";