ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
CREATE INDEX "user_first_name_idx" ON "user" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "user_last_name_idx" ON "user" USING btree ("last_name");