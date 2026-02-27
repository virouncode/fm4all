ALTER TYPE "public"."occurrence_tache_statut" ADD VALUE 'non_applicable';--> statement-breakpoint
CREATE TABLE "tache_listes_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"nom" varchar(255) NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services_taches_templates" RENAME TO "tache_liste_items";--> statement-breakpoint
ALTER TABLE "occurrence_taches" RENAME COLUMN "tache_template_id" TO "liste_item_id";--> statement-breakpoint
ALTER TABLE "occurrence_taches" DROP CONSTRAINT "occurrence_taches_tache_template_id_services_taches_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP CONSTRAINT "services_taches_templates_service_id_services_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP CONSTRAINT "services_taches_templates_proprietaire_entreprise_id_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP CONSTRAINT "services_taches_templates_service_entreprise_id_service_entreprises_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP CONSTRAINT "services_taches_templates_created_by_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP CONSTRAINT "services_taches_templates_updated_by_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "occurrence_taches_template_idx";--> statement-breakpoint
DROP INDEX "service_task_templates_service_idx";--> statement-breakpoint
DROP INDEX "service_task_templates_actif_idx";--> statement-breakpoint
DROP INDEX "service_task_templates_order_udx";--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD COLUMN "tache_liste_template_id" uuid;--> statement-breakpoint
ALTER TABLE "client_services" ADD COLUMN "tache_liste_template_id" uuid;--> statement-breakpoint
ALTER TABLE "tache_liste_items" ADD COLUMN "liste_template_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ADD CONSTRAINT "tache_listes_templates_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ADD CONSTRAINT "tache_listes_templates_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ADD CONSTRAINT "tache_listes_templates_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_listes_templates" ADD CONSTRAINT "tache_listes_templates_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tache_listes_templates_service_idx" ON "tache_listes_templates" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "tache_listes_templates_proprietaire_idx" ON "tache_listes_templates" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "tache_listes_templates_actif_idx" ON "tache_listes_templates" USING btree ("actif");--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_tache_liste_template_id_tache_listes_templates_id_fk" FOREIGN KEY ("tache_liste_template_id") REFERENCES "public"."tache_listes_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_tache_liste_template_id_tache_listes_templates_id_fk" FOREIGN KEY ("tache_liste_template_id") REFERENCES "public"."tache_listes_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_liste_item_id_tache_liste_items_id_fk" FOREIGN KEY ("liste_item_id") REFERENCES "public"."tache_liste_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_liste_items" ADD CONSTRAINT "tache_liste_items_liste_template_id_tache_listes_templates_id_fk" FOREIGN KEY ("liste_template_id") REFERENCES "public"."tache_listes_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_liste_items" ADD CONSTRAINT "tache_liste_items_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tache_liste_items" ADD CONSTRAINT "tache_liste_items_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "occurrence_taches_liste_item_idx" ON "occurrence_taches" USING btree ("liste_item_id");--> statement-breakpoint
CREATE INDEX "tache_liste_items_liste_template_idx" ON "tache_liste_items" USING btree ("liste_template_id");--> statement-breakpoint
CREATE INDEX "tache_liste_items_actif_idx" ON "tache_liste_items" USING btree ("actif");--> statement-breakpoint
CREATE UNIQUE INDEX "tache_liste_items_order_udx" ON "tache_liste_items" USING btree ("liste_template_id","ordre");--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP COLUMN "service_id";--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP COLUMN "proprietaire_entreprise_id";--> statement-breakpoint
ALTER TABLE "tache_liste_items" DROP COLUMN "service_entreprise_id";