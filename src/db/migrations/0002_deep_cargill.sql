ALTER TABLE "nettoyage_repasse_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "proprete_conso_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "proprete_distrib_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "proprete_instal_distrib_tarifs" ALTER COLUMN "fournisseur_id" SET NOT NULL;