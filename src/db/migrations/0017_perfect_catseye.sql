ALTER TABLE "cafe_machines_tarifs" RENAME COLUMN "oneShot" TO "one_shot";--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ALTER COLUMN "cafe_machine_id" DROP NOT NULL;
ALTER TABLE "cafe_machines_tarifs" RENAME COLUMN "gamme" TO "type";--> statement-breakpoint