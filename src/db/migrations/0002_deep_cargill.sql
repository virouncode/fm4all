ALTER TABLE "nettoyage_repasse_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;