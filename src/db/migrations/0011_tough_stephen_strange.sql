ALTER TABLE "cafe_machines" RENAME COLUMN "nbBoissons" TO "nb_boissons";--> statement-breakpoint
ALTER TABLE "cafe_machines" ADD COLUMN "nb_tasses_par_j" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "cafe_machines" ADD COLUMN "lactee" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "cafe_machines" ADD COLUMN "gourmande" boolean NOT NULL;