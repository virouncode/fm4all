CREATE TABLE "cafe_machines" (
	"id" serial PRIMARY KEY NOT NULL,
	"marque" varchar NOT NULL,
	"modele" varchar NOT NULL,
	"nbBoissons" integer NOT NULL,
	"arrivee_reseau" "possibilite" NOT NULL,
	"evacutaion_reseau" "possibilite" NOT NULL,
	"evacuation_marc" "possibilite" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD COLUMN "cafe_machine_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_cafe_machine_id_cafe_machines_id_fk" FOREIGN KEY ("cafe_machine_id") REFERENCES "public"."cafe_machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" DROP COLUMN "marque";--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" DROP COLUMN "modele";--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" DROP COLUMN "nb_boissons";