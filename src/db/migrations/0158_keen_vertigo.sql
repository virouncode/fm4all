ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tickets_attachments" ADD COLUMN "created_by_id" text;--> statement-breakpoint
ALTER TABLE "tickets_attachments" ADD CONSTRAINT "tickets_attachments_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;