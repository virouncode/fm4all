CREATE TYPE "public"."typecolonneseche" AS ENUM('statique', 'dynamique');--> statement-breakpoint
CREATE TYPE "public"."typehygieneconso" AS ENUM('emp', 'savon', 'ph', 'desinfectant');--> statement-breakpoint
CREATE TYPE "public"."typehygienedistrib" AS ENUM('emp', 'poubelleEmp', 'savon', 'ph', 'desinfectant', 'parfum', 'balai', 'poubelle');--> statement-breakpoint
CREATE TYPE "public"."typeincendietrilogie" AS ENUM('extincteur', 'baes', 'telBaes');--> statement-breakpoint
CREATE TYPE "public"."typelocation" AS ENUM('oneShot', '12m', '24m', '36m', '48m', '60m');--> statement-breakpoint
CREATE TYPE "public"."typeofficemanager" AS ENUM('standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."typeportecoupefeu" AS ENUM('vantaux', 'coulissante');--> statement-breakpoint
CREATE TABLE "alarmes_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_total" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alarmes_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"nb_points" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boissons_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boissons_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type_location" "typelocation" NOT NULL,
	"prix_unitaire" integer,
	"rac" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typemachine" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"nb_machines" integer,
	"type_lait" "typelait",
	"type_chocolat" "typechocolat",
	"pa_maintenance" integer,
	"nb_passages" integer,
	"frais_installation" integer,
	"cafe_machine_id" integer,
	"reconditionne" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chocolat_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "typechocolat" NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chocolat_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colonnes_seches_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colonnes_seches_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typecolonneseche" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_parking_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_parking_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"nb_exutoires" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer,
	"nb_exutoires" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontaines_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type_location" "typelocation" NOT NULL,
	"prix_unitaire" integer,
	"rac" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontaines_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typeeau" NOT NULL,
	"type_pose" "typepose" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"pa_maintenance" integer,
	"frais_installation" integer,
	"pa_conso_filtres" integer,
	"pa_conso_co2" integer,
	"pa_conso_eau_chaude" integer,
	"fontaine_id" integer,
	"reconditionne" boolean DEFAULT false,
	"infos" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fruits_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_kg" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fruits_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "typehygieneconso" NOT NULL,
	"pa_par_personne" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"effectif" integer,
	"fournisseur_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type_location" "typelocation" NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typehygienedistrib" NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_instal_distrib_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_installation" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_instal_distrib_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incendie_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "typeincendietrilogie" NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incendie_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lait_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "typelait" NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lait_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legio_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legio_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"h_par_passage" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"h_par_passage" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_repasse_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_repasse_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"h_par_passage" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_vitrerie_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_vitrerie_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"cadence_vitres" integer NOT NULL,
	"cadence_cloisons" integer NOT NULL,
	"min_facturation" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_manager_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"type" "typeofficemanager" NOT NULL,
	"demi_tjm" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_manager_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portes_coupe_feu_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portes_coupe_feu_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"type" "typeportecoupefeu" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "q18_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "q18_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qualite_air_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qualite_air_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"surface" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ria_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer NOT NULL,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ria_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_fm4all_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"assurance" "inclus" NOT NULL,
	"min_facturation_plateforme" integer NOT NULL,
	"plateforme" "inclus" NOT NULL,
	"support_admin" "inclus" NOT NULL,
	"min_facturation_support_op" integer,
	"support_op" "inclus" NOT NULL,
	"min_facturation_account_manager" integer,
	"account_manager" "inclus" NOT NULL,
	"audit" "inclus" NOT NULL,
	"remise_ca_seuil" integer NOT NULL,
	"remiseCa" integer NOT NULL,
	"remise_hof" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sucre_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sucre_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "the_conso_offres" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"prix_unitaire" integer,
	"infos" varchar,
	"imageUrl" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "the_conso_produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"fournisseur_id" integer NOT NULL,
	"effectif" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE "cafe_machines" ADD COLUMN "imageUrl" varchar;--> statement-breakpoint
ALTER TABLE "alarmes_offres" ADD CONSTRAINT "alarmes_offres_produit_id_alarmes_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."alarmes_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alarmes_produits" ADD CONSTRAINT "alarmes_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boissons_offres" ADD CONSTRAINT "boissons_offres_produit_id_boissons_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."boissons_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boissons_produits" ADD CONSTRAINT "boissons_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_conso_offres" ADD CONSTRAINT "cafe_conso_offres_produit_id_cafe_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."cafe_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_conso_produits" ADD CONSTRAINT "cafe_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_offres" ADD CONSTRAINT "cafe_machines_offres_produit_id_cafe_machines_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."cafe_machines_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_produits" ADD CONSTRAINT "cafe_machines_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_produits" ADD CONSTRAINT "cafe_machines_produits_cafe_machine_id_cafe_machines_id_fk" FOREIGN KEY ("cafe_machine_id") REFERENCES "public"."cafe_machines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chocolat_conso_offres" ADD CONSTRAINT "chocolat_conso_offres_produit_id_chocolat_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."chocolat_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chocolat_conso_produits" ADD CONSTRAINT "chocolat_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colonnes_seches_offres" ADD CONSTRAINT "colonnes_seches_offres_produit_id_colonnes_seches_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."colonnes_seches_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colonnes_seches_produits" ADD CONSTRAINT "colonnes_seches_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exutoires_offres" ADD CONSTRAINT "exutoires_offres_produit_id_exutoires_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."exutoires_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exutoires_parking_offres" ADD CONSTRAINT "exutoires_parking_offres_produit_id_exutoires_parking_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."exutoires_parking_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_offres" ADD CONSTRAINT "fontaines_offres_produit_id_fontaines_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."fontaines_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_produits" ADD CONSTRAINT "fontaines_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_produits" ADD CONSTRAINT "fontaines_produits_fontaine_id_fontaines_id_fk" FOREIGN KEY ("fontaine_id") REFERENCES "public"."fontaines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fruits_offres" ADD CONSTRAINT "fruits_offres_produit_id_fruits_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."fruits_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fruits_produits" ADD CONSTRAINT "fruits_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_conso_offres" ADD CONSTRAINT "hygiene_conso_offres_produit_id_hygiene_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."hygiene_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_conso_produits" ADD CONSTRAINT "hygiene_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_offres" ADD CONSTRAINT "hygiene_distrib_offres_produit_id_hygiene_distrib_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."hygiene_distrib_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_produits" ADD CONSTRAINT "hygiene_distrib_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_offres" ADD CONSTRAINT "hygiene_instal_distrib_offres_produit_id_hygiene_instal_distrib_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."hygiene_instal_distrib_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_produits" ADD CONSTRAINT "hygiene_instal_distrib_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incendie_offres" ADD CONSTRAINT "incendie_offres_produit_id_incendie_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."incendie_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incendie_produits" ADD CONSTRAINT "incendie_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_offres" ADD CONSTRAINT "lait_conso_offres_produit_id_lait_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."lait_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_produits" ADD CONSTRAINT "lait_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legio_offres" ADD CONSTRAINT "legio_offres_produit_id_legio_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."legio_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legio_produits" ADD CONSTRAINT "legio_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_offres" ADD CONSTRAINT "maintenance_offres_produit_id_maintenance_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."maintenance_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_produits" ADD CONSTRAINT "maintenance_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_offres" ADD CONSTRAINT "nettoyage_offres_produit_id_nettoyage_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."nettoyage_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_produits" ADD CONSTRAINT "nettoyage_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_offres" ADD CONSTRAINT "nettoyage_repasse_offres_produit_id_nettoyage_repasse_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."nettoyage_repasse_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_produits" ADD CONSTRAINT "nettoyage_repasse_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_offres" ADD CONSTRAINT "nettoyage_vitrerie_offres_produit_id_nettoyage_vitrerie_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."nettoyage_vitrerie_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_produits" ADD CONSTRAINT "nettoyage_vitrerie_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_manager_offres" ADD CONSTRAINT "office_manager_offres_produit_id_office_manager_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."office_manager_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_manager_produits" ADD CONSTRAINT "office_manager_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portes_coupe_feu_offres" ADD CONSTRAINT "portes_coupe_feu_offres_produit_id_portes_coupe_feu_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."portes_coupe_feu_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portes_coupe_feu_produits" ADD CONSTRAINT "portes_coupe_feu_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "q18_offres" ADD CONSTRAINT "q18_offres_produit_id_q18_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."q18_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "q18_produits" ADD CONSTRAINT "q18_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualite_air_offres" ADD CONSTRAINT "qualite_air_offres_produit_id_qualite_air_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."qualite_air_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualite_air_produits" ADD CONSTRAINT "qualite_air_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ria_offres" ADD CONSTRAINT "ria_offres_produit_id_ria_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."ria_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ria_produits" ADD CONSTRAINT "ria_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_fm4all_produits" ADD CONSTRAINT "services_fm4all_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snacks_offres" ADD CONSTRAINT "snacks_offres_produit_id_snacks_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."snacks_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snacks_produits" ADD CONSTRAINT "snacks_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucre_conso_offres" ADD CONSTRAINT "sucre_conso_offres_produit_id_sucre_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."sucre_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucre_conso_produits" ADD CONSTRAINT "sucre_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_offres" ADD CONSTRAINT "the_conso_offres_produit_id_the_conso_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."the_conso_produits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_produits" ADD CONSTRAINT "the_conso_produits_fournisseur_id_fournisseurs_id_fk" FOREIGN KEY ("fournisseur_id") REFERENCES "public"."fournisseurs"("id") ON DELETE no action ON UPDATE no action;