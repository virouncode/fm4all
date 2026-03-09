CREATE SEQUENCE "public"."devis_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "numero" varchar(20);--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "note_interne" text;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "remise_globale_ht" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "date_emission" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_numero_unique" UNIQUE("numero");