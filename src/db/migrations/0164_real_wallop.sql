ALTER TABLE "clients" ADD COLUMN "createdById" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "updatedById" text;--> statement-breakpoint
ALTER TABLE "prospects" ADD COLUMN "createdById" text;--> statement-breakpoint
ALTER TABLE "prospects" ADD COLUMN "updatedById" text;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_updatedById_user_id_fk" FOREIGN KEY ("updatedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_updatedById_user_id_fk" FOREIGN KEY ("updatedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;