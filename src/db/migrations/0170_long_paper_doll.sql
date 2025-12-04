ALTER TABLE "clients" ADD COLUMN "prospect_id" integer;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "date_demarrage" date;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clients_prospect_id_udx" ON "clients" USING btree ("prospect_id");