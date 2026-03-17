CREATE TABLE "occurrence_field_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"revoked_at" timestamp (3) with time zone,
	"created_by_id" uuid,
	"auto_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "occurrence_field_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "occurrence_field_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_link_id" uuid NOT NULL,
	"assignee_nom" varchar(150) NOT NULL,
	"started_at" timestamp (3) with time zone NOT NULL,
	"ended_at" timestamp (3) with time zone,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD COLUMN "assignee_nom" varchar(150);--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD COLUMN "assignee_nom" varchar(150);--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD COLUMN "completee_par_nom" varchar(150);--> statement-breakpoint
ALTER TABLE "occurrence_field_links" ADD CONSTRAINT "occurrence_field_links_occurrence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_field_links" ADD CONSTRAINT "occurrence_field_links_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_field_sessions" ADD CONSTRAINT "occurrence_field_sessions_field_link_id_occurrence_field_links_id_fk" FOREIGN KEY ("field_link_id") REFERENCES "public"."occurrence_field_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ofl_occurrence_idx" ON "occurrence_field_links" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "ofl_token_idx" ON "occurrence_field_links" USING btree ("token");--> statement-breakpoint
CREATE INDEX "ofs_field_link_idx" ON "occurrence_field_sessions" USING btree ("field_link_id");