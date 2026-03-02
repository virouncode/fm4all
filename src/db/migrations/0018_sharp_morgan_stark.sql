ALTER TABLE "tache_listes_templates" DROP CONSTRAINT "tache_listes_templates_proprietaire_entreprise_id_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ALTER COLUMN "proprietaire_entreprise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ADD CONSTRAINT "tache_listes_templates_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE set null ON UPDATE no action;