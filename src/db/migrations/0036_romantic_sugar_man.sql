ALTER TYPE "public"."document_categorie" ADD VALUE 'devis_demande' BEFORE 'facture';--> statement-breakpoint
ALTER TABLE "documents_links" ADD COLUMN "devis_demande_id" uuid;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_devis_demande_id_devis_demandes_id_fk" FOREIGN KEY ("devis_demande_id") REFERENCES "public"."devis_demandes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_links_devis_demande_idx" ON "documents_links" USING btree ("devis_demande_id");