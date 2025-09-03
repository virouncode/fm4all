ALTER TYPE "public"."typehygiene" RENAME TO "typehygiene";--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" RENAME TO "hygiene_conso_tarifs";--> statement-breakpoint
ALTER TABLE "hygiene_distrib_quantites" RENAME TO "hygiene_distrib_quantites";--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" RENAME TO "hygiene_distrib_tarifs";--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" RENAME TO "hygiene_instal_distrib_tarifs";--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" DROP CONSTRAINT "hygiene_conso_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" DROP CONSTRAINT "hygiene_distrib_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" DROP CONSTRAINT "hygiene_instal_distrib_tarifs_fournisseur_id_fournisseurs_id_fk";
--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ADD CONSTRAINT "hygiene_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ADD CONSTRAINT "hygiene_distrib_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" ADD CONSTRAINT "hygiene_instal_distrib_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;