CREATE TYPE "public"."typechocolat" AS ENUM('sachets', 'poudre');--> statement-breakpoint
CREATE TYPE "public"."typelait" AS ENUM('dosettes', 'frais', 'poudre');--> statement-breakpoint
DROP TABLE "cafe_conso_tarifs" CASCADE;--> statement-breakpoint
DROP TABLE "cafe_machines_tarifs" CASCADE;--> statement-breakpoint
DROP TABLE "cafe_quantites" CASCADE;--> statement-breakpoint
DROP TABLE "choco_conso_tarifs" CASCADE;--> statement-breakpoint
DROP TABLE "lait_conso_tarifs" CASCADE;--> statement-breakpoint
DROP TABLE "the_conso_tarifs" CASCADE;