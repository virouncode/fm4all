CREATE TABLE "cafe_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typemachine" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"prix_installation" integer,
	"type_lait" "typelait",
	"type_chocolat" "typechocolat",
	"one_shot" integer,
	"pa_12m" integer,
	"rac_12m" integer,
	"pa_24m" integer,
	"rac_24m" integer,
	"pa_36m" integer,
	"pa_48m" integer,
	"pa_maintenance" integer,
	"nb_passages" integer,
	"frais_installation" integer,
	"cafe_machine_id" integer,
	"infos" varchar,
	"reconditionne" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chocolat_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire_sachet" integer,
	"prix_unitaire_poudre" integer,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lait_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire_dosette" integer,
	"prix_unitaire_frais" integer,
	"prix_unitaire_poudre" integer,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sucre_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "the_conso_tarifs" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cafe_conso_tarifs" ADD CONSTRAINT "cafe_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_cafe_machine_id_cafe_machines_id_fk" FOREIGN KEY ("cafe_machine_id") REFERENCES "public"."cafe_machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chocolat_conso_tarifs" ADD CONSTRAINT "chocolat_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_tarifs" ADD CONSTRAINT "lait_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucre_conso_tarifs" ADD CONSTRAINT "sucre_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_tarifs" ADD CONSTRAINT "the_conso_tarifs_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;