ALTER TABLE "clients" RENAME COLUMN "createdById" TO "created_by_id";--> statement-breakpoint
ALTER TABLE "clients" RENAME COLUMN "updatedById" TO "updated_by_id";--> statement-breakpoint
ALTER TABLE "prospects" RENAME COLUMN "createdById" TO "created_by_id";--> statement-breakpoint
ALTER TABLE "prospects" RENAME COLUMN "updatedById" TO "updated_by_id";--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_createdById_user_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_updatedById_user_id_fk";
--> statement-breakpoint
ALTER TABLE "prospects" DROP CONSTRAINT "prospects_createdById_user_id_fk";
--> statement-breakpoint
ALTER TABLE "prospects" DROP CONSTRAINT "prospects_updatedById_user_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;