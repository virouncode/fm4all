CREATE TYPE "public"."role_plateforme_adhesion" AS ENUM('super_admin_plateforme', 'operateur_plateforme');--> statement-breakpoint
CREATE TABLE "user_plateforme_adhesions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role_plateforme_adhesion" NOT NULL,
	"statut" "adhesion_statut" DEFAULT 'actif' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "user_adhesions" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role_adhesion";--> statement-breakpoint
CREATE TYPE "public"."role_adhesion" AS ENUM('admin', 'manager', 'collaborateur');--> statement-breakpoint
ALTER TABLE "user_adhesions" ALTER COLUMN "role" SET DATA TYPE "public"."role_adhesion" USING "role"::"public"."role_adhesion";--> statement-breakpoint
ALTER TABLE "user_plateforme_adhesions" ADD CONSTRAINT "user_plateforme_adhesions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plateforme_adhesions" ADD CONSTRAINT "user_plateforme_adhesions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plateforme_adhesions" ADD CONSTRAINT "user_plateforme_adhesions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_plateforme_adhesions_user_udx" ON "user_plateforme_adhesions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_plateforme_adhesions_role_idx" ON "user_plateforme_adhesions" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_plateforme_adhesions_statut_idx" ON "user_plateforme_adhesions" USING btree ("statut");