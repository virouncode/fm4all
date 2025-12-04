ALTER TYPE "public"."role" ADD VALUE 'client_admin';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'fournisseur_admin';--> statement-breakpoint
ALTER TABLE "devis" ALTER COLUMN "status" DROP DEFAULT;