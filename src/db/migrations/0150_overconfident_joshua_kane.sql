ALTER TABLE "user" RENAME COLUMN "avatar_url" TO "image";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "name" text NOT NULL;