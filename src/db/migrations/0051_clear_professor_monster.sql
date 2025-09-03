ALTER TABLE "clients" ALTER COLUMN "siret" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "date_de_demarrage" date;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "commentaires" varchar;