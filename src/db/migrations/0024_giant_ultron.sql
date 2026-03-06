CREATE TABLE "client_prestataire_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_entreprise_id" uuid NOT NULL,
	"prestataire_entreprise_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD CONSTRAINT "client_prestataire_relations_client_entreprise_id_entreprises_id_fk" FOREIGN KEY ("client_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD CONSTRAINT "client_prestataire_relations_prestataire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("prestataire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD CONSTRAINT "client_prestataire_relations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_prestataire_relations" ADD CONSTRAINT "client_prestataire_relations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cpr_client_id_idx" ON "client_prestataire_relations" USING btree ("client_entreprise_id");--> statement-breakpoint
CREATE INDEX "cpr_prestataire_id_idx" ON "client_prestataire_relations" USING btree ("prestataire_entreprise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpr_client_prestataire_udx" ON "client_prestataire_relations" USING btree ("client_entreprise_id","prestataire_entreprise_id");