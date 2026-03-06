CREATE TABLE "entreprise_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entreprise_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "entreprise_invitations" ADD CONSTRAINT "entreprise_invitations_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_invitations" ADD CONSTRAINT "entreprise_invitations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_invitations" ADD CONSTRAINT "entreprise_invitations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ei_entreprise_id_idx" ON "entreprise_invitations" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "ei_token_idx" ON "entreprise_invitations" USING btree ("token");