CREATE TABLE "client_service_prix_appliques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_prix_id" uuid NOT NULL,
	"client_service_id" uuid NOT NULL,
	"execution_id" uuid NOT NULL,
	"occurrence_id" uuid,
	"type_prix" "execution_type_prix" NOT NULL,
	"montant_ht_snapshot" integer NOT NULL,
	"cout_prestataire_ht_snapshot" integer,
	"marge_pourcent_snapshot" integer,
	"periode_start" date,
	"periode_end" date,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_execution_prix_id_client_service_execution_prix_id_fk" FOREIGN KEY ("execution_prix_id") REFERENCES "public"."client_service_execution_prix"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_execution_id_client_service_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."client_service_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_occurrence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_prix_appliques" ADD CONSTRAINT "client_service_prix_appliques_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "csp_appliques_execution_prix_idx" ON "client_service_prix_appliques" USING btree ("execution_prix_id");--> statement-breakpoint
CREATE INDEX "csp_appliques_client_service_idx" ON "client_service_prix_appliques" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "csp_appliques_occurrence_idx" ON "client_service_prix_appliques" USING btree ("occurrence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_appliques_par_occurrence_udx" ON "client_service_prix_appliques" USING btree ("execution_prix_id","occurrence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_appliques_par_periode_udx" ON "client_service_prix_appliques" USING btree ("execution_prix_id","periode_start");