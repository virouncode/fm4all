ALTER TABLE "devis" RENAME TO "devis_temporaires";--> statement-breakpoint
ALTER TABLE "devis_temporaires" DROP CONSTRAINT "devis_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "devis_temporaires" ADD CONSTRAINT "devis_temporaires_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;