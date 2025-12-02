ALTER TABLE "devis" DROP CONSTRAINT "devis_prospect_id_prospects_id_fk";
--> statement-breakpoint
ALTER TABLE "devis_temporaires" DROP CONSTRAINT "devis_temporaires_prospect_id_prospects_id_fk";
--> statement-breakpoint
ALTER TABLE "devis" ALTER COLUMN "prospect_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "devis_temporaires" ALTER COLUMN "prospect_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_temporaires" ADD CONSTRAINT "devis_temporaires_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE no action ON UPDATE no action;