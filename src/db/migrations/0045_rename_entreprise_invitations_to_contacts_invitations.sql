-- Rename table entreprise_invitations → contacts_invitations
ALTER TABLE "entreprise_invitations" RENAME TO "contacts_invitations";--> statement-breakpoint

-- Update FK constraint name on entreprises
ALTER TABLE "contacts_invitations" DROP CONSTRAINT IF EXISTS "entreprise_invitations_entreprise_id_entreprises_id_fk";--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Update FK constraint on created_by_id / updated_by_id (if named)
ALTER TABLE "contacts_invitations" DROP CONSTRAINT IF EXISTS "entreprise_invitations_created_by_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "contacts_invitations" DROP CONSTRAINT IF EXISTS "entreprise_invitations_updated_by_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Rename indexes
ALTER INDEX IF EXISTS "ei_entreprise_id_idx" RENAME TO "ci_entreprise_id_idx";--> statement-breakpoint
ALTER INDEX IF EXISTS "ei_token_idx" RENAME TO "ci_token_idx";--> statement-breakpoint

-- Add contact_id column with FK
ALTER TABLE "contacts_invitations" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "contacts_invitations" ADD CONSTRAINT "contacts_invitations_contact_id_entreprise_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."entreprise_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ci_contact_id_idx" ON "contacts_invitations" USING btree ("contact_id");
