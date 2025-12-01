ALTER TABLE "user" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "sites" ALTER COLUMN "adresse_ligne_1" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ALTER COLUMN "surface" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ALTER COLUMN "effectif" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text;