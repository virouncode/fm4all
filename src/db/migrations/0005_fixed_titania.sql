ALTER TABLE "user_adhesions" ALTER COLUMN "statut" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_adhesions" ALTER COLUMN "statut" SET DEFAULT 'actif'::text;--> statement-breakpoint
DROP TYPE "public"."adhesion_statut";--> statement-breakpoint
CREATE TYPE "public"."adhesion_statut" AS ENUM('actif', 'en_attente', 'suspendu');--> statement-breakpoint
ALTER TABLE "user_adhesions" ALTER COLUMN "statut" SET DEFAULT 'actif'::"public"."adhesion_statut";--> statement-breakpoint
ALTER TABLE "user_adhesions" ALTER COLUMN "statut" SET DATA TYPE "public"."adhesion_statut" USING "statut"::"public"."adhesion_statut";