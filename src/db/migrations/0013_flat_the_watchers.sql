ALTER TABLE "client_services" RENAME COLUMN "jours_semaine" TO "jours_preference";--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "heure_debut_preference" varchar(5);--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "duree_estimee_minutes" smallint;