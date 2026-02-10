CREATE TYPE "public"."adhesion_statut" AS ENUM('actif', 'en_attente', 'refuse', 'suspendu');--> statement-breakpoint
CREATE TYPE "public"."client_service_mode" AS ENUM('recurrent', 'one_shot');--> statement-breakpoint
CREATE TYPE "public"."contrat_deal_mode" AS ENUM('direct', 'intermediaire', 'gestion_pilotee', 'apporteur_affaires');--> statement-breakpoint
CREATE TYPE "public"."contrat_statut" AS ENUM('brouillon', 'actif', 'suspendu', 'termine', 'resilie');--> statement-breakpoint
CREATE TYPE "public"."contrat_type" AS ENUM('multiservices', 'service', 'mandat_gestion', 'ponctuel');--> statement-breakpoint
CREATE TYPE "public"."devis_ligne_unite" AS ENUM('unite', 'paire', 'piece', 'article', 'ensemble', 'lot', 'seconde', 'minute', 'heure', 'jour', 'semaine', 'deux_semaines', 'quatre_semaines', 'trimestre', 'semestre', 'mois', 'annee', 'milligramme', 'gramme', 'kilogramme', 'tonne', 'millilitre', 'centilitre', 'litre', 'millimetre', 'centimètre', 'metre', 'metre_carre', 'metre_cube', 'metre_cube_par_heure', 'ampère', 'gigajoule', 'gigawatt', 'gigawatt_par_heure', 'joule', 'kilojoule', 'kilovar', 'kilowatt', 'kilowatt_par_heure', 'megajoule', 'megawatt', 'megawatt_par_heure', 'voltampere', 'voltampere_reactif', 'wattheure');--> statement-breakpoint
CREATE TYPE "public"."devis_statut" AS ENUM('brouillon', 'emis', 'signe', 'refuse');--> statement-breakpoint
CREATE TYPE "public"."devis_type_prix" AS ENUM('recurrent', 'one_shot');--> statement-breakpoint
CREATE TYPE "public"."document_categorie" AS ENUM('contrat', 'avenant', 'devis', 'facture', 'bon_commande', 'rapport_intervention', 'compte_rendu', 'procedure', 'plan_acces', 'cahier_charges', 'specification', 'avatar', 'photo', 'logo', 'document', 'piece_jointe');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('contrat_pdf', 'avenant_pdf', 'devis_pdf', 'devis_signe_pdf', 'annexe', 'cahier_des_charges', 'plan_site', 'procedure_acces', 'consignes_securite', 'assurance', 'kbis', 'autre');--> statement-breakpoint
CREATE TYPE "public"."document_visibilite" AS ENUM('public', 'fm4all_only', 'client_only', 'fournisseur_only');--> statement-breakpoint
CREATE TYPE "public"."facture_ligne_type" AS ENUM('ponctuel', 'recurrent', 'ajustement');--> statement-breakpoint
CREATE TYPE "public"."facture_statut" AS ENUM('brouillon', 'emise', 'payee', 'en_retard', 'litige', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."frequence" AS ENUM('one_shot', 'hebdomadaire', 'mensuelle', 'trimestrielle', 'semestrielle', 'annuelle', 'tous_les_x_jours');--> statement-breakpoint
CREATE TYPE "public"."gamme" AS ENUM('essentiel', 'confort', 'excellence');--> statement-breakpoint
CREATE TYPE "public"."inclus" AS ENUM('inclus', 'non inclus', 'non propose', 'sur demande');--> statement-breakpoint
CREATE TYPE "public"."occurrence_statut" AS ENUM('planifiee', 'en_cours', 'terminee', 'non_honoree', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."occurrence_tache_statut" AS ENUM('a_faire', 'en_cours', 'terminee', 'non_honoree', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."paiement_methode" AS ENUM('virement', 'cheque', 'prelevement', 'carte', 'especes', 'avoir');--> statement-breakpoint
CREATE TYPE "public"."paiement_statut" AS ENUM('en_attente', 'recu', 'partiel', 'refuse', 'annule');--> statement-breakpoint
CREATE TYPE "public"."perimetre_mode" AS ENUM('inclure', 'exclure');--> statement-breakpoint
CREATE TYPE "public"."possibilite" AS ENUM('possible', 'non', 'obligatoire');--> statement-breakpoint
CREATE TYPE "public"."role_adhesion" AS ENUM('super_admin', 'admin', 'manager', 'collaborateur');--> statement-breakpoint
CREATE TYPE "public"."role_attribution_site" AS ENUM('responsable_site', 'validateur_site', 'demandeur_site', 'intervenant_site', 'observateur_site');--> statement-breakpoint
CREATE TYPE "public"."role_entreprise" AS ENUM('client', 'prestataire', 'plateforme');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'fournisseur', 'client', 'client_admin', 'fournisseur_admin');--> statement-breakpoint
CREATE TYPE "public"."site_attribution_scope" AS ENUM('self', 'subtree');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."storage_provider" AS ENUM('vercel_blob', 's3');--> statement-breakpoint
CREATE TYPE "public"."ticket_message_visibilite" AS ENUM('public', 'fm4all_only', 'client_only', 'fournisseur_only');--> statement-breakpoint
CREATE TYPE "public"."ticket_priorite" AS ENUM('basse', 'normale', 'haute', 'critique');--> statement-breakpoint
CREATE TYPE "public"."ticket_statut" AS ENUM('nouveau', 'pris_en_charge', 'en_attente_fournisseur', 'en_attente_client', 'a_valider', 'clos', 'annule', 'rejete');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('incident', 'demande', 'autre');--> statement-breakpoint
CREATE TYPE "public"."typebatiment" AS ENUM('bureaux', 'localCommercial', 'entrepot', 'cabinetMedical');--> statement-breakpoint
CREATE TYPE "public"."typechocolat" AS ENUM('sachets', 'poudre');--> statement-breakpoint
CREATE TYPE "public"."typecolonne" AS ENUM('statique', 'dynamique');--> statement-breakpoint
CREATE TYPE "public"."typeeau" AS ENUM('EF', 'EC', 'EG', 'ECG');--> statement-breakpoint
CREATE TYPE "public"."typehygiene" AS ENUM('emp', 'poubelleEmp', 'savon', 'ph', 'desinfectant', 'parfum', 'balai', 'poubelle');--> statement-breakpoint
CREATE TYPE "public"."typelait" AS ENUM('dosettes', 'frais', 'poudre');--> statement-breakpoint
CREATE TYPE "public"."typemachine" AS ENUM('cafe', 'lait', 'chocolat');--> statement-breakpoint
CREATE TYPE "public"."typeoccupation" AS ENUM('partieEtage', 'plateauComplet', 'batimentEntier');--> statement-breakpoint
CREATE TYPE "public"."typeporte" AS ENUM('vantaux', 'coulissante');--> statement-breakpoint
CREATE TYPE "public"."typepose" AS ENUM('aposer', 'colonne', 'comptoir');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp (3) with time zone,
	"refresh_token_expires_at" timestamp (3) with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"phone" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"avatar_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marque" varchar NOT NULL,
	"modele" varchar NOT NULL,
	"nb_boissons" integer NOT NULL,
	"nb_tasses_par_j" integer NOT NULL,
	"arrivee_reseau" "possibilite" NOT NULL,
	"evacuation_reseau" "possibilite" NOT NULL,
	"evacuation_marc" "possibilite" NOT NULL,
	"lactee" boolean NOT NULL,
	"gourmande" boolean NOT NULL,
	"infos" varchar,
	"image_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cafe_machines_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"type" "typemachine" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"nb_machines" integer,
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
	"cafe_machine_id" uuid,
	"reconditionne" boolean DEFAULT false,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chocolat_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire_sachet" integer,
	"prix_unitaire_poudre" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lait_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire_dosette" integer,
	"prix_unitaire_frais" integer,
	"prix_unitaire_poudre" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sucre_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "the_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"gamme" "gamme" NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contrat_client_services" (
	"contrat_id" uuid NOT NULL,
	"client_service_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contrat_client_services_contrat_id_client_service_id_pk" PRIMARY KEY("contrat_id","client_service_id")
);
--> statement-breakpoint
CREATE TABLE "contrat_devis" (
	"contrat_id" uuid NOT NULL,
	"devis_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contrat_devis_contrat_id_devis_id_pk" PRIMARY KEY("contrat_id","devis_id")
);
--> statement-breakpoint
CREATE TABLE "contrats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"type" "contrat_type" NOT NULL,
	"deal_mode" "contrat_deal_mode" NOT NULL,
	"partie_a_entreprise_id" uuid NOT NULL,
	"partie_b_entreprise_id" uuid NOT NULL,
	"titre" varchar(255) NOT NULL,
	"reference_externe" varchar(255),
	"notes" text,
	"site_id" uuid,
	"statut" "contrat_statut" DEFAULT 'actif' NOT NULL,
	"date_debut" timestamp (3) with time zone,
	"date_fin" timestamp (3) with time zone,
	"is_contrat_cadre" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_demande_id" uuid,
	"demandeur_entreprise_id" uuid NOT NULL,
	"emetteur_entreprise_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"ticket_id" uuid,
	"titre" varchar(255) NOT NULL,
	"description" text,
	"statut" "devis_statut" DEFAULT 'brouillon' NOT NULL,
	"valid_to" timestamp (3) with time zone,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devis_demandes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demandeur_entreprise_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"ticket_id" uuid,
	"service_id" uuid NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "devis_lignes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" uuid NOT NULL,
	"service_id" uuid,
	"designation" varchar(255) NOT NULL,
	"description" text,
	"quantite" numeric(12, 3) NOT NULL,
	"unite" "devis_ligne_unite" NOT NULL,
	"prix_unitaire_ht" integer NOT NULL,
	"taux_tva" integer NOT NULL,
	"ordre" integer NOT NULL,
	"remise_ht" integer DEFAULT 0 NOT NULL,
	"type_prix" "devis_type_prix" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "devis_temporaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prospect_id" uuid,
	"texte" varchar NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"categorie" "document_categorie" NOT NULL,
	"titre" varchar(255),
	"storage_provider" "storage_provider" NOT NULL,
	"storage_key" varchar(1024) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"entreprise_id" uuid,
	"site_id" uuid,
	"ticket_id" uuid,
	"occurrence_id" uuid,
	"devis_id" uuid,
	"contrat_id" uuid,
	"facture_id" uuid,
	"client_service_id" uuid,
	"client_service_execution_id" uuid,
	"occurrence_tache_id" uuid,
	"visibilite" "document_visibilite" DEFAULT 'public' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "entreprise_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"role" "role_entreprise" NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entreprises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"siret" text NOT NULL,
	"prospect_id" uuid,
	"prenom_contact" text,
	"nom_contact" text,
	"email_contact" text,
	"telephone_contact" text,
	"logo_id" uuid,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entreprises_siret_unique" UNIQUE("siret")
);
--> statement-breakpoint
CREATE TABLE "service_entreprises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facture_ligne_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facture_ligne_id" uuid NOT NULL,
	"site_id" uuid,
	"client_service_id" uuid,
	"occurrence_id" uuid,
	"ticket_id" uuid,
	"montant_ht" integer NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facture_lignes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facture_id" uuid NOT NULL,
	"service_id" uuid,
	"designation" varchar(255) NOT NULL,
	"description" text,
	"quantite" numeric(12, 3) NOT NULL,
	"prix_unitaire_ht" integer NOT NULL,
	"taux_tva" integer NOT NULL,
	"total_ht" integer NOT NULL,
	"ordre" integer NOT NULL,
	"type" "facture_ligne_type" NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emetteur_entreprise_id" uuid NOT NULL,
	"destinataire_entreprise_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"client_service_id" uuid,
	"ticket_id" uuid,
	"numero" varchar(64) NOT NULL,
	"statut" "facture_statut" DEFAULT 'brouillon' NOT NULL,
	"periode_debut" timestamp (3) with time zone,
	"periode_fin" timestamp (3) with time zone,
	"date_emission" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"date_echeance" timestamp (3) with time zone,
	"total_ht" integer NOT NULL,
	"total_tva" integer NOT NULL,
	"total_ttc" integer NOT NULL,
	"generee_par_outil" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontaines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marque" varchar NOT NULL,
	"modele" varchar NOT NULL,
	"infos" varchar,
	"image_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fontaines_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"type" "typeeau" NOT NULL,
	"type_pose" "typepose" NOT NULL,
	"nb_personnes" integer NOT NULL,
	"one_shot" integer,
	"pa_12m" integer,
	"rac_12m" integer,
	"pa_24m" integer,
	"rac_24m" integer,
	"pa_36m" integer,
	"pa_48m" integer,
	"pa_60m" integer,
	"pa_maintenance" integer,
	"frais_installation" integer,
	"pa_conso_filtres" integer,
	"pa_conso_co2" integer,
	"pa_conso_eau_chaude" integer,
	"fontaine_id" integer,
	"reconditionne" boolean DEFAULT false,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boissons_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consos_par_semaine_par_personne" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"min_consos_par_semaine" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boissons_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_livraison_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"panier_min" integer,
	"prix_unitaire" integer NOT NULL,
	"prix_unitaire_si_cafe" integer NOT NULL,
	"seuil_franco" integer,
	"remise_si_cafe" integer,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fruits_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"g_par_semaine_par_personne" integer NOT NULL,
	"min_kg_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fruits_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_kg" integer,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portions_par_semaine_par_personne" integer NOT NULL,
	"min_portions_par_semaine" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snacks_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_unitaire" integer,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_conso_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"effectif" integer,
	"entreprise_id" uuid NOT NULL,
	"pa_par_personne_emp" integer NOT NULL,
	"pa_par_personne_savon" integer NOT NULL,
	"pa_par_personne_ph" integer NOT NULL,
	"pa_par_personne_desinfectant" integer NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"effectif" integer NOT NULL,
	"nb_distrib_emp" integer NOT NULL,
	"nb_distrib_savon" integer NOT NULL,
	"nb_distrib_ph" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_distrib_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"type" "typehygiene" NOT NULL,
	"gamme" "gamme" NOT NULL,
	"one_shot" integer,
	"pa_12m" integer,
	"pa_24m" integer,
	"pa_36m" integer,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_instal_distrib_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"effectif" integer NOT NULL,
	"prix_installation" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_min_facturation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"min_facturation" integer,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alarmes_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"nb_points" integer NOT NULL,
	"prix_par_controle" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colonnes_seches_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"type" "typecolonne" NOT NULL,
	"prix_par_colonne" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_parking_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"nb_exutoires" integer NOT NULL,
	"prix_par_exutoire" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exutoires_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"nb_exutoires" integer NOT NULL,
	"prix_par_exutoire" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incendie_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surface" integer NOT NULL,
	"nb_extincteurs" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incendie_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"surface" integer NOT NULL,
	"prix_par_extincteur" integer NOT NULL,
	"prix_par_baes" integer NOT NULL,
	"prix_par_tel_baes" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portes_coupe_feu_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"type" "typeporte" NOT NULL,
	"prix_par_porte" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ria_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"prix_par_ria" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legio_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surface" integer NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"surface" integer NOT NULL,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "q18_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qualite_air_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"surface" integer NOT NULL,
	"prix_annuel" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freq_annuelle" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_repasse_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"h_par_passage" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nettoyage_vitrerie_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"cadence_vitres" integer NOT NULL,
	"cadence_cloisons" integer NOT NULL,
	"taux_horaire" integer NOT NULL,
	"min_facturation" integer NOT NULL,
	"frais_deplacement" integer NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_manager_quantites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"effectif" integer NOT NULL,
	"surface" integer NOT NULL,
	"gamme" "gamme" NOT NULL,
	"demi_j_par_semaine" integer NOT NULL,
	"majoration" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_manager_tarifs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"demi_tjm" integer NOT NULL,
	"demi_tjm_premium" integer NOT NULL,
	"image_id" uuid,
	"infos" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payeur_entreprise_id" uuid NOT NULL,
	"receveur_entreprise_id" uuid NOT NULL,
	"montant_ttc" integer NOT NULL,
	"methode" "paiement_methode" NOT NULL,
	"statut" "paiement_statut" DEFAULT 'en_attente' NOT NULL,
	"date_paiement" timestamp (3) with time zone,
	"reference_externe" text,
	"commentaires" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paiements_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paiement_id" uuid NOT NULL,
	"facture_id" uuid NOT NULL,
	"montant_ttc" integer NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom_entreprise" varchar NOT NULL,
	"siret" varchar,
	"prenom_contact" varchar NOT NULL,
	"nom_contact" varchar NOT NULL,
	"poste_contact" varchar NOT NULL,
	"email_contact" varchar NOT NULL,
	"phone_contact" varchar NOT NULL,
	"prenom_signataire" varchar,
	"nom_signataire" varchar,
	"poste_signataire" varchar,
	"email_signataire" varchar,
	"surface" integer NOT NULL,
	"effectif" integer NOT NULL,
	"type_batiment" "typebatiment" NOT NULL,
	"type_occupation" "typeoccupation" NOT NULL,
	"adresse_ligne_1" varchar,
	"adresse_ligne_2" varchar,
	"code_postal" varchar NOT NULL,
	"ville" varchar NOT NULL,
	"date_de_demarrage" date,
	"commentaires" varchar,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_service_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"service_entreprise_id" uuid,
	"prix_ht" integer,
	"taux" integer,
	"valid_from" timestamp (3) with time zone NOT NULL,
	"valid_to" timestamp (3) with time zone,
	"ordre" smallint NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "client_service_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"date_debut_prevue" timestamp (3) with time zone,
	"date_fin_prevue" timestamp (3) with time zone,
	"date_debut_reelle" timestamp (3) with time zone,
	"date_fin_reelle" timestamp (3) with time zone,
	"statut" "occurrence_statut" DEFAULT 'planifiee' NOT NULL,
	"assignee_user_id" uuid,
	"demandee_par_user_id" uuid,
	"notes" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_service_perimetre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_service_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"mode" "perimetre_mode" NOT NULL,
	"scope" "site_attribution_scope" DEFAULT 'subtree' NOT NULL,
	"ordre" smallint DEFAULT 0 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"frequence" "frequence" NOT NULL,
	"frequence_par_periode" integer,
	"intervalle_jours" integer,
	"date_debut" timestamp (3) with time zone,
	"date_fin" timestamp (3) with time zone,
	"actif" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occurrence_taches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"tache_template_id" uuid,
	"ordre" smallint NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text,
	"statut" "occurrence_tache_statut" DEFAULT 'a_faire' NOT NULL,
	"assignee_user_id" uuid,
	"completee_par_user_id" uuid,
	"temps_passe_secondes" integer,
	"notes" text,
	"started_at" timestamp (3) with time zone,
	"done_at" timestamp (3) with time zone,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" varchar NOT NULL,
	"description" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_taches_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"service_entreprise_id" uuid,
	"ordre" smallint NOT NULL,
	"titre" varchar(255) NOT NULL,
	"description" text,
	"actif" boolean DEFAULT true NOT NULL,
	"duree_estimee_minutes" smallint,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_fm4all_offres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gamme" "gamme" NOT NULL,
	"assurance" "inclus" NOT NULL,
	"plateforme" "inclus" NOT NULL,
	"support_admin" "inclus" NOT NULL,
	"support_op" "inclus" NOT NULL,
	"account_manager" "inclus" NOT NULL,
	"audit" "inclus" NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_fm4all_taux" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assurance" integer NOT NULL,
	"plateforme" integer NOT NULL,
	"min_facturation_plateforme" integer NOT NULL,
	"support_admin" integer NOT NULL,
	"support_op" integer NOT NULL,
	"min_facturation_support_op" integer NOT NULL,
	"account_manager" integer NOT NULL,
	"min_facturation_account_manager" integer NOT NULL,
	"remise_ca_seuil" integer NOT NULL,
	"remise_ca" integer NOT NULL,
	"remise_hof" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"parent_id" uuid,
	"nom" varchar NOT NULL,
	"adresse_ligne_1" varchar NOT NULL,
	"adresse_ligne_2" varchar,
	"code_postal" varchar NOT NULL,
	"ville" varchar NOT NULL,
	"surface" integer NOT NULL,
	"effectif" integer NOT NULL,
	"type_batiment" "typebatiment" NOT NULL,
	"type_occupation" "typeoccupation" NOT NULL,
	"commentaires" varchar,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites_arborescence" (
	"entreprise_id" uuid NOT NULL,
	"ancetre_id" uuid NOT NULL,
	"descendant_id" uuid NOT NULL,
	"profondeur" smallint NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sites_arborescence_entreprise_id_ancetre_id_descendant_id_pk" PRIMARY KEY("entreprise_id","ancetre_id","descendant_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"auteur_user_id" uuid,
	"message" text NOT NULL,
	"visibilite" "ticket_message_visibilite" DEFAULT 'public' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurence_id" uuid,
	"occurence_tache_id" uuid,
	"proprietaire_entreprise_id" uuid NOT NULL,
	"demandeur_entreprise_id" uuid,
	"assigne_entreprise_id" uuid,
	"assigne_user_id" uuid,
	"titre" varchar(255) NOT NULL,
	"description" text,
	"type" "ticket_type" NOT NULL,
	"priorite" "ticket_priorite" DEFAULT 'normale' NOT NULL,
	"statut" "ticket_statut" DEFAULT 'nouveau' NOT NULL,
	"last_activity_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp (3) with time zone,
	"closed_at" timestamp (3) with time zone,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_adhesions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"role" "role_adhesion" NOT NULL,
	"statut" "adhesion_statut" DEFAULT 'actif' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_site_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"role" "role_attribution_site" NOT NULL,
	"scope" "site_attribution_scope" DEFAULT 'subtree' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users_arborescence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entreprise_id" uuid NOT NULL,
	"ancetre_id" uuid,
	"descendant_id" uuid,
	"profondeur" smallint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_avatar_id_documents_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_conso_tarifs" ADD CONSTRAINT "cafe_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_conso_tarifs" ADD CONSTRAINT "cafe_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines" ADD CONSTRAINT "cafe_machines_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_cafe_machine_id_cafe_machines_id_fk" FOREIGN KEY ("cafe_machine_id") REFERENCES "public"."cafe_machines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_machines_tarifs" ADD CONSTRAINT "cafe_machines_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chocolat_conso_tarifs" ADD CONSTRAINT "chocolat_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chocolat_conso_tarifs" ADD CONSTRAINT "chocolat_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_tarifs" ADD CONSTRAINT "lait_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lait_conso_tarifs" ADD CONSTRAINT "lait_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucre_conso_tarifs" ADD CONSTRAINT "sucre_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sucre_conso_tarifs" ADD CONSTRAINT "sucre_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_tarifs" ADD CONSTRAINT "the_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_conso_tarifs" ADD CONSTRAINT "the_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_client_services" ADD CONSTRAINT "contrat_client_services_contrat_id_contrats_id_fk" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_client_services" ADD CONSTRAINT "contrat_client_services_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_client_services" ADD CONSTRAINT "contrat_client_services_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_client_services" ADD CONSTRAINT "contrat_client_services_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_client_services" ADD CONSTRAINT "contrat_client_services_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_devis" ADD CONSTRAINT "contrat_devis_contrat_id_contrats_id_fk" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_devis" ADD CONSTRAINT "contrat_devis_devis_id_devis_id_fk" FOREIGN KEY ("devis_id") REFERENCES "public"."devis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_devis" ADD CONSTRAINT "contrat_devis_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrat_devis" ADD CONSTRAINT "contrat_devis_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_partie_a_entreprise_id_entreprises_id_fk" FOREIGN KEY ("partie_a_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_partie_b_entreprise_id_entreprises_id_fk" FOREIGN KEY ("partie_b_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_devis_demande_id_devis_demandes_id_fk" FOREIGN KEY ("devis_demande_id") REFERENCES "public"."devis_demandes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_demandeur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("demandeur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_emetteur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("emetteur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis" ADD CONSTRAINT "devis_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_demandeur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("demandeur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_demandes" ADD CONSTRAINT "devis_demandes_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_devis_id_devis_id_fk" FOREIGN KEY ("devis_id") REFERENCES "public"."devis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_lignes" ADD CONSTRAINT "devis_lignes_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devis_temporaires" ADD CONSTRAINT "devis_temporaires_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_occurrence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_devis_id_devis_id_fk" FOREIGN KEY ("devis_id") REFERENCES "public"."devis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_contrat_id_contrats_id_fk" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_facture_id_factures_id_fk" FOREIGN KEY ("facture_id") REFERENCES "public"."factures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_client_service_execution_id_client_service_executions_id_fk" FOREIGN KEY ("client_service_execution_id") REFERENCES "public"."client_service_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_occurrence_tache_id_occurrence_taches_id_fk" FOREIGN KEY ("occurrence_tache_id") REFERENCES "public"."occurrence_taches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_links" ADD CONSTRAINT "documents_links_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_roles" ADD CONSTRAINT "entreprise_roles_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_roles" ADD CONSTRAINT "entreprise_roles_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprise_roles" ADD CONSTRAINT "entreprise_roles_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_logo_id_documents_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_entreprises" ADD CONSTRAINT "service_entreprises_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_entreprises" ADD CONSTRAINT "service_entreprises_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_entreprises" ADD CONSTRAINT "service_entreprises_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_entreprises" ADD CONSTRAINT "service_entreprises_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_facture_ligne_id_facture_lignes_id_fk" FOREIGN KEY ("facture_ligne_id") REFERENCES "public"."facture_lignes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_occurrence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_ligne_allocations" ADD CONSTRAINT "facture_ligne_allocations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD CONSTRAINT "facture_lignes_facture_id_factures_id_fk" FOREIGN KEY ("facture_id") REFERENCES "public"."factures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD CONSTRAINT "facture_lignes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD CONSTRAINT "facture_lignes_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facture_lignes" ADD CONSTRAINT "facture_lignes_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_emetteur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("emetteur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_destinataire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("destinataire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factures" ADD CONSTRAINT "factures_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines" ADD CONSTRAINT "fontaines_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" ADD CONSTRAINT "fontaines_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fontaines_tarifs" ADD CONSTRAINT "fontaines_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boissons_tarifs" ADD CONSTRAINT "boissons_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boissons_tarifs" ADD CONSTRAINT "boissons_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_livraison_tarifs" ADD CONSTRAINT "food_livraison_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fruits_tarifs" ADD CONSTRAINT "fruits_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fruits_tarifs" ADD CONSTRAINT "fruits_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snacks_tarifs" ADD CONSTRAINT "snacks_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snacks_tarifs" ADD CONSTRAINT "snacks_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ADD CONSTRAINT "hygiene_conso_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_conso_tarifs" ADD CONSTRAINT "hygiene_conso_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ADD CONSTRAINT "hygiene_distrib_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_distrib_tarifs" ADD CONSTRAINT "hygiene_distrib_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_instal_distrib_tarifs" ADD CONSTRAINT "hygiene_instal_distrib_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_min_facturation" ADD CONSTRAINT "hygiene_min_facturation_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alarmes_tarifs" ADD CONSTRAINT "alarmes_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colonnes_seches_tarifs" ADD CONSTRAINT "colonnes_seches_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exutoires_parking_tarifs" ADD CONSTRAINT "exutoires_parking_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exutoires_tarifs" ADD CONSTRAINT "exutoires_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incendie_tarifs" ADD CONSTRAINT "incendie_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incendie_tarifs" ADD CONSTRAINT "incendie_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portes_coupe_feu_tarifs" ADD CONSTRAINT "portes_coupe_feu_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ria_tarifs" ADD CONSTRAINT "ria_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legio_tarifs" ADD CONSTRAINT "legio_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_tarifs" ADD CONSTRAINT "maintenance_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_tarifs" ADD CONSTRAINT "maintenance_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "q18_tarifs" ADD CONSTRAINT "q18_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualite_air_tarifs" ADD CONSTRAINT "qualite_air_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_tarifs" ADD CONSTRAINT "nettoyage_repasse_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_repasse_tarifs" ADD CONSTRAINT "nettoyage_repasse_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" ADD CONSTRAINT "nettoyage_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_tarifs" ADD CONSTRAINT "nettoyage_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ADD CONSTRAINT "nettoyage_vitrerie_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nettoyage_vitrerie_tarifs" ADD CONSTRAINT "nettoyage_vitrerie_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_manager_tarifs" ADD CONSTRAINT "office_manager_tarifs_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_manager_tarifs" ADD CONSTRAINT "office_manager_tarifs_image_id_documents_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_payeur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("payeur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_receveur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("receveur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements_allocations" ADD CONSTRAINT "paiements_allocations_paiement_id_paiements_id_fk" FOREIGN KEY ("paiement_id") REFERENCES "public"."paiements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements_allocations" ADD CONSTRAINT "paiements_allocations_facture_id_factures_id_fk" FOREIGN KEY ("facture_id") REFERENCES "public"."factures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements_allocations" ADD CONSTRAINT "paiements_allocations_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements_allocations" ADD CONSTRAINT "paiements_allocations_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_service_entreprise_id_service_entreprises_id_fk" FOREIGN KEY ("service_entreprise_id") REFERENCES "public"."service_entreprises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_executions" ADD CONSTRAINT "client_service_executions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_assignee_user_id_user_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_demandee_par_user_id_user_id_fk" FOREIGN KEY ("demandee_par_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_occurrences" ADD CONSTRAINT "client_service_occurrences_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_perimetre" ADD CONSTRAINT "client_service_perimetre_client_service_id_client_services_id_fk" FOREIGN KEY ("client_service_id") REFERENCES "public"."client_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_perimetre" ADD CONSTRAINT "client_service_perimetre_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_perimetre" ADD CONSTRAINT "client_service_perimetre_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_service_perimetre" ADD CONSTRAINT "client_service_perimetre_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_occurrence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_tache_template_id_services_taches_templates_id_fk" FOREIGN KEY ("tache_template_id") REFERENCES "public"."services_taches_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_assignee_user_id_user_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_completee_par_user_id_user_id_fk" FOREIGN KEY ("completee_par_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_taches" ADD CONSTRAINT "occurrence_taches_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_taches_templates" ADD CONSTRAINT "services_taches_templates_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_taches_templates" ADD CONSTRAINT "services_taches_templates_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_taches_templates" ADD CONSTRAINT "services_taches_templates_service_entreprise_id_service_entreprises_id_fk" FOREIGN KEY ("service_entreprise_id") REFERENCES "public"."service_entreprises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_taches_templates" ADD CONSTRAINT "services_taches_templates_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_taches_templates" ADD CONSTRAINT "services_taches_templates_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_parent_id_sites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sites"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_arborescence" ADD CONSTRAINT "sites_arborescence_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_arborescence" ADD CONSTRAINT "sites_arborescence_ancetre_id_sites_id_fk" FOREIGN KEY ("ancetre_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_arborescence" ADD CONSTRAINT "sites_arborescence_descendant_id_sites_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_arborescence" ADD CONSTRAINT "sites_arborescence_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites_arborescence" ADD CONSTRAINT "sites_arborescence_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_auteur_user_id_user_id_fk" FOREIGN KEY ("auteur_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_occurence_id_client_service_occurrences_id_fk" FOREIGN KEY ("occurence_id") REFERENCES "public"."client_service_occurrences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_occurence_tache_id_occurrence_taches_id_fk" FOREIGN KEY ("occurence_tache_id") REFERENCES "public"."occurrence_taches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_proprietaire_entreprise_id_entreprises_id_fk" FOREIGN KEY ("proprietaire_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_demandeur_entreprise_id_entreprises_id_fk" FOREIGN KEY ("demandeur_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigne_entreprise_id_entreprises_id_fk" FOREIGN KEY ("assigne_entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigne_user_id_user_id_fk" FOREIGN KEY ("assigne_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_adhesions" ADD CONSTRAINT "user_adhesions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_adhesions" ADD CONSTRAINT "user_adhesions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_adhesions" ADD CONSTRAINT "user_adhesions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_adhesions" ADD CONSTRAINT "user_adhesions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD CONSTRAINT "user_site_attributions_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD CONSTRAINT "user_site_attributions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD CONSTRAINT "user_site_attributions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD CONSTRAINT "user_site_attributions_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_site_attributions" ADD CONSTRAINT "user_site_attributions_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_arborescence" ADD CONSTRAINT "users_arborescence_entreprise_id_entreprises_id_fk" FOREIGN KEY ("entreprise_id") REFERENCES "public"."entreprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_arborescence" ADD CONSTRAINT "users_arborescence_ancetre_id_user_id_fk" FOREIGN KEY ("ancetre_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_arborescence" ADD CONSTRAINT "users_arborescence_descendant_id_user_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_arborescence" ADD CONSTRAINT "users_arborescence_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_arborescence" ADD CONSTRAINT "users_arborescence_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_udx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_phone_idx" ON "user" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "cafe_conso_tarifs_entreprise_gamme_effectif_idx" ON "cafe_conso_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE INDEX "cafe_machines_tarifs_entreprise_type_nb_personnes_idx" ON "cafe_machines_tarifs" USING btree ("entreprise_id","type","nb_personnes");--> statement-breakpoint
CREATE INDEX "cafe_machines_tarifs_cafe_machine_id_idx" ON "cafe_machines_tarifs" USING btree ("cafe_machine_id");--> statement-breakpoint
CREATE INDEX "chocolat_conso_tarifs_entreprise_effectif_idx" ON "chocolat_conso_tarifs" USING btree ("entreprise_id","effectif");--> statement-breakpoint
CREATE INDEX "lait_conso_tarifs_entreprise_effectif_idx" ON "lait_conso_tarifs" USING btree ("entreprise_id","effectif");--> statement-breakpoint
CREATE INDEX "sucre_conso_tarifs_entreprise_effectif_idx" ON "sucre_conso_tarifs" USING btree ("entreprise_id","effectif");--> statement-breakpoint
CREATE INDEX "the_conso_tarifs_entreprise_gamme_effectif_idx" ON "the_conso_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE INDEX "contrat_client_services_owner_idx" ON "contrat_client_services" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "contrat_client_services_contrat_idx" ON "contrat_client_services" USING btree ("contrat_id");--> statement-breakpoint
CREATE INDEX "contrat_client_services_client_service_idx" ON "contrat_client_services" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "contrat_devis_owner_idx" ON "contrat_devis" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "contrat_devis_contrat_idx" ON "contrat_devis" USING btree ("contrat_id");--> statement-breakpoint
CREATE INDEX "contrat_devis_devis_idx" ON "contrat_devis" USING btree ("devis_id");--> statement-breakpoint
CREATE INDEX "contrats_owner_idx" ON "contrats" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "contrats_partie_a_idx" ON "contrats" USING btree ("partie_a_entreprise_id");--> statement-breakpoint
CREATE INDEX "contrats_partie_b_idx" ON "contrats" USING btree ("partie_b_entreprise_id");--> statement-breakpoint
CREATE INDEX "contrats_site_idx" ON "contrats" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "contrats_statut_idx" ON "contrats" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "contrats_dates_idx" ON "contrats" USING btree ("date_debut","date_fin");--> statement-breakpoint
CREATE INDEX "devis_ticket_id_idx" ON "devis" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "devis_statut_idx" ON "devis" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "devis_created_at_idx" ON "devis" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "devis_demandes_demandeur_entreprise_id_idx" ON "devis_demandes" USING btree ("demandeur_entreprise_id");--> statement-breakpoint
CREATE INDEX "devis_demandes_site_id_idx" ON "devis_demandes" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "devis_demandes_ticket_id_idx" ON "devis_demandes" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "devis_demandes_service_id_idx" ON "devis_demandes" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "devis_demandes_created_at_idx" ON "devis_demandes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "devis_lignes_devis_id_idx" ON "devis_lignes" USING btree ("devis_id");--> statement-breakpoint
CREATE INDEX "devis_lignes_created_at_idx" ON "devis_lignes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "devis_lignes_ordre_udx" ON "devis_lignes" USING btree ("devis_id","ordre");--> statement-breakpoint
CREATE INDEX "devis_temporaires_prospect_id_idx" ON "devis_temporaires" USING btree ("prospect_id");--> statement-breakpoint
CREATE INDEX "devis_temporaires_created_at_idx" ON "devis_temporaires" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_provider_key_udx" ON "documents" USING btree ("storage_provider","storage_key");--> statement-breakpoint
CREATE INDEX "documents_owner_idx" ON "documents" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "documents_created_by_idx" ON "documents" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_links_owner_idx" ON "documents_links" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "documents_links_document_idx" ON "documents_links" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_links_ticket_idx" ON "documents_links" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "documents_links_site_idx" ON "documents_links" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "documents_links_occurrence_idx" ON "documents_links" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "documents_links_devis_idx" ON "documents_links" USING btree ("devis_id");--> statement-breakpoint
CREATE INDEX "documents_links_contrat_idx" ON "documents_links" USING btree ("contrat_id");--> statement-breakpoint
CREATE INDEX "documents_links_facture_idx" ON "documents_links" USING btree ("facture_id");--> statement-breakpoint
CREATE INDEX "documents_links_owner_vis_idx" ON "documents_links" USING btree ("proprietaire_entreprise_id","visibilite");--> statement-breakpoint
CREATE INDEX "entreprise_roles_entreprise_id_idx" ON "entreprise_roles" USING btree ("entreprise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entreprise_roles_entreprise_role_udx" ON "entreprise_roles" USING btree ("entreprise_id","role");--> statement-breakpoint
CREATE INDEX "entreprises_prospect_id_idx" ON "entreprises" USING btree ("prospect_id");--> statement-breakpoint
CREATE INDEX "entreprises_created_at_idx" ON "entreprises" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "service_entreprises_entreprise_id_idx" ON "service_entreprises" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "service_entreprises_service_id_idx" ON "service_entreprises" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_entreprises_entreprise_service_udx" ON "service_entreprises" USING btree ("entreprise_id","service_id");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_ligne_idx" ON "facture_ligne_allocations" USING btree ("facture_ligne_id");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_site_idx" ON "facture_ligne_allocations" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_client_service_idx" ON "facture_ligne_allocations" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_occurrence_idx" ON "facture_ligne_allocations" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "facture_ligne_allocations_ticket_idx" ON "facture_ligne_allocations" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "facture_lignes_facture_idx" ON "facture_lignes" USING btree ("facture_id");--> statement-breakpoint
CREATE INDEX "facture_lignes_service_idx" ON "facture_lignes" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "facture_lignes_created_at_idx" ON "facture_lignes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "facture_lignes_ordre_udx" ON "facture_lignes" USING btree ("facture_id","ordre");--> statement-breakpoint
CREATE INDEX "factures_owner_idx" ON "factures" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "factures_emetteur_idx" ON "factures" USING btree ("emetteur_entreprise_id");--> statement-breakpoint
CREATE INDEX "factures_destinataire_idx" ON "factures" USING btree ("destinataire_entreprise_id");--> statement-breakpoint
CREATE INDEX "factures_statut_idx" ON "factures" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "factures_date_emission_idx" ON "factures" USING btree ("date_emission");--> statement-breakpoint
CREATE INDEX "factures_date_echeance_idx" ON "factures" USING btree ("date_echeance");--> statement-breakpoint
CREATE INDEX "factures_client_service_idx" ON "factures" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "factures_ticket_idx" ON "factures" USING btree ("ticket_id");--> statement-breakpoint
CREATE UNIQUE INDEX "factures_numero_owner_udx" ON "factures" USING btree ("proprietaire_entreprise_id","emetteur_entreprise_id","numero");--> statement-breakpoint
CREATE INDEX "fontaines_tarifs_entreprise_type_nb_personnes_idx" ON "fontaines_tarifs" USING btree ("entreprise_id","type","nb_personnes");--> statement-breakpoint
CREATE INDEX "fontaines_tarifs_fontaine_id_idx" ON "fontaines_tarifs" USING btree ("fontaine_id");--> statement-breakpoint
CREATE INDEX "boissons_quantites_gamme_idx" ON "boissons_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE UNIQUE INDEX "boissons_quantites_gamme_udx" ON "boissons_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE INDEX "boissons_tarifs_entreprise_gamme_effectif_idx" ON "boissons_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE UNIQUE INDEX "boissons_tarifs_entreprise_gamme_effectif_udx" ON "boissons_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE INDEX "food_livraison_tarifs_entreprise_freq_idx" ON "food_livraison_tarifs" USING btree ("entreprise_id","freq_annuelle");--> statement-breakpoint
CREATE UNIQUE INDEX "food_livraison_tarifs_entreprise_freq_udx" ON "food_livraison_tarifs" USING btree ("entreprise_id","freq_annuelle");--> statement-breakpoint
CREATE INDEX "fruits_quantites_gamme_idx" ON "fruits_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE UNIQUE INDEX "fruits_quantites_gamme_udx" ON "fruits_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE INDEX "fruits_tarifs_entreprise_gamme_effectif_idx" ON "fruits_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE UNIQUE INDEX "fruits_tarifs_entreprise_gamme_effectif_udx" ON "fruits_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE INDEX "snacks_quantites_gamme_idx" ON "snacks_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE UNIQUE INDEX "snacks_quantites_gamme_udx" ON "snacks_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE INDEX "snacks_tarifs_entreprise_gamme_effectif_idx" ON "snacks_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE UNIQUE INDEX "snacks_tarifs_entreprise_gamme_effectif_udx" ON "snacks_tarifs" USING btree ("entreprise_id","gamme","effectif");--> statement-breakpoint
CREATE INDEX "hygiene_conso_tarifs_entreprise_effectif_idx" ON "hygiene_conso_tarifs" USING btree ("entreprise_id","effectif");--> statement-breakpoint
CREATE INDEX "hygiene_distrib_quantites_effectif_idx" ON "hygiene_distrib_quantites" USING btree ("effectif");--> statement-breakpoint
CREATE INDEX "hygiene_distrib_tarifs_entreprise_idx" ON "hygiene_distrib_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "hygiene_distrib_tarifs_entreprise_type_gamme_idx" ON "hygiene_distrib_tarifs" USING btree ("entreprise_id","type","gamme");--> statement-breakpoint
CREATE INDEX "hygiene_instal_distrib_tarifs_entreprise_effectif_idx" ON "hygiene_instal_distrib_tarifs" USING btree ("entreprise_id","effectif");--> statement-breakpoint
CREATE INDEX "hygiene_min_facturation_entreprise_idx" ON "hygiene_min_facturation" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "alarmes_tarifs_entreprise_nb_points_idx" ON "alarmes_tarifs" USING btree ("entreprise_id","nb_points");--> statement-breakpoint
CREATE INDEX "colonnes_seches_tarifs_entr_type_idx" ON "colonnes_seches_tarifs" USING btree ("entreprise_id","type");--> statement-breakpoint
CREATE INDEX "exutoires_parking_tarifs_entreprise_nb_exutoires_idx" ON "exutoires_parking_tarifs" USING btree ("entreprise_id","nb_exutoires");--> statement-breakpoint
CREATE INDEX "exutoires_tarifs_entreprise_nb_exutoires_idx" ON "exutoires_tarifs" USING btree ("entreprise_id","nb_exutoires");--> statement-breakpoint
CREATE INDEX "incendie_quantites_surface_idx" ON "incendie_quantites" USING btree ("surface");--> statement-breakpoint
CREATE INDEX "incendie_tarifs_entreprise_surface_idx" ON "incendie_tarifs" USING btree ("entreprise_id","surface");--> statement-breakpoint
CREATE INDEX "portes_coupe_feu_tarifs_entreprise_type_idx" ON "portes_coupe_feu_tarifs" USING btree ("entreprise_id","type");--> statement-breakpoint
CREATE INDEX "ria_tarifs_entreprise_idx" ON "ria_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "legio_tarifs_entreprise_surface_idx" ON "legio_tarifs" USING btree ("entreprise_id","surface");--> statement-breakpoint
CREATE INDEX "maintenance_quantites_surface_gamme_idx" ON "maintenance_quantites" USING btree ("surface","gamme");--> statement-breakpoint
CREATE INDEX "maintenance_quantites_freq_idx" ON "maintenance_quantites" USING btree ("freq_annuelle");--> statement-breakpoint
CREATE INDEX "maintenance_tarifs_entreprise_surface_gamme_idx" ON "maintenance_tarifs" USING btree ("entreprise_id","surface","gamme");--> statement-breakpoint
CREATE INDEX "q18_tarifs_entreprise_surface_idx" ON "q18_tarifs" USING btree ("entreprise_id","surface");--> statement-breakpoint
CREATE INDEX "qualite_air_tarifs_entreprise_surface_idx" ON "qualite_air_tarifs" USING btree ("entreprise_id","surface");--> statement-breakpoint
CREATE INDEX "nettoyage_quantites_gamme_surface_idx" ON "nettoyage_quantites" USING btree ("gamme","surface");--> statement-breakpoint
CREATE INDEX "nettoyage_quantites_freq_idx" ON "nettoyage_quantites" USING btree ("freq_annuelle");--> statement-breakpoint
CREATE INDEX "nettoyage_repasse_tarifs_entreprise_idx" ON "nettoyage_repasse_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "nettoyage_repasse_tarifs_entreprise_surface_gamme_idx" ON "nettoyage_repasse_tarifs" USING btree ("entreprise_id","surface","gamme");--> statement-breakpoint
CREATE INDEX "nettoyage_tarifs_entreprise_idx" ON "nettoyage_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "nettoyage_tarifs_entreprise_surface_gamme_idx" ON "nettoyage_tarifs" USING btree ("entreprise_id","surface","gamme");--> statement-breakpoint
CREATE INDEX "nettoyage_vitrerie_tarifs_entreprise_idx" ON "nettoyage_vitrerie_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "office_manager_quantites_effectif_surface_idx" ON "office_manager_quantites" USING btree ("effectif","surface");--> statement-breakpoint
CREATE INDEX "office_manager_quantites_gamme_idx" ON "office_manager_quantites" USING btree ("gamme");--> statement-breakpoint
CREATE INDEX "office_manager_tarifs_entreprise_idx" ON "office_manager_tarifs" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "paiements_payeur_idx" ON "paiements" USING btree ("payeur_entreprise_id");--> statement-breakpoint
CREATE INDEX "paiements_receveur_idx" ON "paiements" USING btree ("receveur_entreprise_id");--> statement-breakpoint
CREATE INDEX "paiements_statut_idx" ON "paiements" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "paiements_methode_idx" ON "paiements" USING btree ("methode");--> statement-breakpoint
CREATE INDEX "paiements_date_paiement_idx" ON "paiements" USING btree ("date_paiement");--> statement-breakpoint
CREATE INDEX "paiements_created_at_idx" ON "paiements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "paiements_allocations_paiement_idx" ON "paiements_allocations" USING btree ("paiement_id");--> statement-breakpoint
CREATE INDEX "paiements_allocations_facture_idx" ON "paiements_allocations" USING btree ("facture_id");--> statement-breakpoint
CREATE INDEX "paiements_allocations_created_at_idx" ON "paiements_allocations" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "paiements_allocations_unique_udx" ON "paiements_allocations" USING btree ("paiement_id","facture_id","montant_ttc");--> statement-breakpoint
CREATE INDEX "prospects_email_contact_idx" ON "prospects" USING btree ("email_contact");--> statement-breakpoint
CREATE INDEX "prospects_siret_idx" ON "prospects" USING btree ("siret");--> statement-breakpoint
CREATE INDEX "prospects_code_postal_idx" ON "prospects" USING btree ("code_postal");--> statement-breakpoint
CREATE INDEX "prospects_ville_idx" ON "prospects" USING btree ("ville");--> statement-breakpoint
CREATE INDEX "prospects_created_at_idx" ON "prospects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "client_service_executions_client_service_idx" ON "client_service_executions" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "client_service_executions_site_idx" ON "client_service_executions" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "client_service_executions_actif_idx" ON "client_service_executions" USING btree ("actif");--> statement-breakpoint
CREATE INDEX "client_service_occurrences_client_service_idx" ON "client_service_occurrences" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "client_service_occurrences_site_idx" ON "client_service_occurrences" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "client_service_occurrences_statut_idx" ON "client_service_occurrences" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "client_service_occurrences_assignee_idx" ON "client_service_occurrences" USING btree ("assignee_user_id");--> statement-breakpoint
CREATE INDEX "client_service_occurrences_dates_prevues_idx" ON "client_service_occurrences" USING btree ("date_debut_prevue","date_fin_prevue");--> statement-breakpoint
CREATE INDEX "client_service_perimetre_client_service_idx" ON "client_service_perimetre" USING btree ("client_service_id");--> statement-breakpoint
CREATE INDEX "client_service_perimetre_site_idx" ON "client_service_perimetre" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "client_service_perimetre_mode_idx" ON "client_service_perimetre" USING btree ("mode");--> statement-breakpoint
CREATE UNIQUE INDEX "client_service_perimetre_udx" ON "client_service_perimetre" USING btree ("client_service_id","site_id","mode","scope");--> statement-breakpoint
CREATE INDEX "client_services_entreprise_idx" ON "client_services" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "client_services_site_idx" ON "client_services" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "client_services_service_idx" ON "client_services" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "client_services_actif_idx" ON "client_services" USING btree ("actif");--> statement-breakpoint
CREATE INDEX "client_services_dates_idx" ON "client_services" USING btree ("date_debut","date_fin");--> statement-breakpoint
CREATE INDEX "occurrence_taches_occurrence_idx" ON "occurrence_taches" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "occurrence_taches_statut_idx" ON "occurrence_taches" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "occurrence_taches_template_idx" ON "occurrence_taches" USING btree ("tache_template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "occurrence_taches_order_udx" ON "occurrence_taches" USING btree ("occurrence_id","ordre");--> statement-breakpoint
CREATE UNIQUE INDEX "services_nom_udx" ON "services" USING btree ("nom");--> statement-breakpoint
CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "service_task_templates_service_idx" ON "services_taches_templates" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_task_templates_actif_idx" ON "services_taches_templates" USING btree ("actif");--> statement-breakpoint
CREATE UNIQUE INDEX "service_task_templates_order_udx" ON "services_taches_templates" USING btree ("proprietaire_entreprise_id","service_id","ordre");--> statement-breakpoint
CREATE INDEX "services_fm4all_offres_gamme_idx" ON "services_fm4all_offres" USING btree ("gamme");--> statement-breakpoint
CREATE INDEX "sites_entreprise_id_idx" ON "sites" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "sites_code_postal_idx" ON "sites" USING btree ("code_postal");--> statement-breakpoint
CREATE INDEX "sites_ville_idx" ON "sites" USING btree ("ville");--> statement-breakpoint
CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sites_parent_id_idx" ON "sites" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "sites_arborescence_anc_idx" ON "sites_arborescence" USING btree ("entreprise_id","ancetre_id");--> statement-breakpoint
CREATE INDEX "sites_arborescence_desc_idx" ON "sites_arborescence" USING btree ("entreprise_id","descendant_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_ticket_idx" ON "ticket_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_ticket_created_at_idx" ON "ticket_messages" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "ticket_messages_auteur_idx" ON "ticket_messages" USING btree ("auteur_user_id");--> statement-breakpoint
CREATE INDEX "ticket_messages_visibilite_idx" ON "ticket_messages" USING btree ("visibilite");--> statement-breakpoint
CREATE INDEX "tickets_proprietaire_idx" ON "tickets" USING btree ("proprietaire_entreprise_id");--> statement-breakpoint
CREATE INDEX "tickets_demandeur_idx" ON "tickets" USING btree ("demandeur_entreprise_id");--> statement-breakpoint
CREATE INDEX "tickets_assigne_entreprise_idx" ON "tickets" USING btree ("assigne_entreprise_id");--> statement-breakpoint
CREATE INDEX "tickets_occurence_idx" ON "tickets" USING btree ("occurence_id");--> statement-breakpoint
CREATE INDEX "tickets_occurence_tache_idx" ON "tickets" USING btree ("occurence_tache_id");--> statement-breakpoint
CREATE INDEX "tickets_statut_idx" ON "tickets" USING btree ("statut");--> statement-breakpoint
CREATE INDEX "tickets_priorite_idx" ON "tickets" USING btree ("priorite");--> statement-breakpoint
CREATE INDEX "tickets_type_idx" ON "tickets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tickets_assigne_user_idx" ON "tickets" USING btree ("assigne_user_id");--> statement-breakpoint
CREATE INDEX "tickets_last_activity_idx" ON "tickets" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_adhesions_user_id_idx" ON "user_adhesions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_adhesions_entreprise_id_idx" ON "user_adhesions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_adhesions_statut_idx" ON "user_adhesions" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "user_adhesions_user_entreprise_udx" ON "user_adhesions" USING btree ("user_id","entreprise_id");--> statement-breakpoint
CREATE INDEX "user_site_attributions_entreprise_id_idx" ON "user_site_attributions" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "user_site_attributions_user_id_idx" ON "user_site_attributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_site_attributions_site_id_idx" ON "user_site_attributions" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_site_attributions_user_site_role_udx" ON "user_site_attributions" USING btree ("user_id","site_id","role");--> statement-breakpoint
CREATE INDEX "users_arborescence_entreprise_id_idx" ON "users_arborescence" USING btree ("entreprise_id");--> statement-breakpoint
CREATE INDEX "users_arborescence_ancetre_id_idx" ON "users_arborescence" USING btree ("ancetre_id");--> statement-breakpoint
CREATE INDEX "users_arborescence_descendant_id_idx" ON "users_arborescence" USING btree ("descendant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_arborescence_entreprise_anc_desc_udx" ON "users_arborescence" USING btree ("entreprise_id","ancetre_id","descendant_id");