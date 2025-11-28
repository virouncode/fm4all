ALTER TABLE "interventions" ALTER COLUMN "status" SET DEFAULT 'en_attente_confirmation';--> statement-breakpoint
ALTER TABLE "interventions" ALTER COLUMN "confirmee_client" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "interventions" ALTER COLUMN "confirmee_fournisseur" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "interventions" ALTER COLUMN "date_debut_prevue" DROP NOT NULL;