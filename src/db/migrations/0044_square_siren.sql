CREATE TYPE "public"."client_prestataire_contact_side" AS ENUM('client', 'prestataire');--> statement-breakpoint
CREATE TABLE "client_prestataire_relation_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relation_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"side" "client_prestataire_contact_side" NOT NULL,
	"role" text,
	"est_principal" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entreprise_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"email" text,
	"phone" text,
	"fonction" text,
	"notes" text,
	"user_id" uuid,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_prestataire_relation_contacts" ADD CONSTRAINT "client_prestataire_relation_contacts_relation_id_client_prestataire_relations_id_fk" FOREIGN KEY ("relation_id") REFERENCES "public"."client_prestataire_relations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relation_contacts" ADD CONSTRAINT "client_prestataire_relation_contacts_contact_id_entreprise_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."entreprise_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relation_contacts" ADD CONSTRAINT "client_prestataire_relation_contacts_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relation_contacts" ADD CONSTRAINT "client_prestataire_relation_contacts_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_contacts" ADD CONSTRAINT "entreprise_contacts_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_contacts" ADD CONSTRAINT "entreprise_contacts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_contacts" ADD CONSTRAINT "entreprise_contacts_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_contacts" ADD CONSTRAINT "entreprise_contacts_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cprc_relation_id_idx" ON "client_prestataire_relation_contacts" USING btree ("relation_id");--> statement-breakpoint
CREATE INDEX "cprc_contact_id_idx" ON "client_prestataire_relation_contacts" USING btree ("contact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cprc_relation_contact_udx" ON "client_prestataire_relation_contacts" USING btree ("relation_id","contact_id");--> statement-breakpoint
CREATE INDEX "entreprise_contacts_entreprise_id_idx" ON "entreprise_contacts" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "entreprise_contacts_user_id_idx" ON "entreprise_contacts" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "prenom_contact_prestataire";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "nom_contact_prestataire";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "email_contact_prestataire";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "phone_contact_prestataire";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "prenom_contact_client";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "nom_contact_client";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "email_contact_client";--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" DROP COLUMN "phone_contact_client";--> statement-breakpoint
ALTER TABLE "entreprises" DROP COLUMN "prenom_contact";--> statement-breakpoint
ALTER TABLE "entreprises" DROP COLUMN "nom_contact";--> statement-breakpoint
ALTER TABLE "entreprises" DROP COLUMN "email_contact";--> statement-breakpoint
ALTER TABLE "entreprises" DROP COLUMN "telephone_contact";