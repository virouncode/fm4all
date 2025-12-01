ALTER TABLE "fournisseurs" ALTER COLUMN "annee_creation" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "site_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets_attachments" ALTER COLUMN "size" SET NOT NULL;