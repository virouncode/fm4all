CREATE TABLE "devis" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"devis_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;