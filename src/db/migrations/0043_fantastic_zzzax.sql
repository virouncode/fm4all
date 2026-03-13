ALTER TABLE "client_prestataire_relations" ADD COLUMN "prenom_contact_prestataire" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "nom_contact_prestataire" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "email_contact_prestataire" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "phone_contact_prestataire" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "prenom_contact_client" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "nom_contact_client" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "email_contact_client" text;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD COLUMN "phone_contact_client" text;--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "adresse_ligne1" text;--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "adresse_ligne2" text;--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "code_postal" varchar(10);--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "ville" varchar;--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "forme_juridique" varchar;--> statement-breakpoint
ALTER TABLE "entreprises" ADD COLUMN "sirene_synced_at" timestamp with time zone;