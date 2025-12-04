DROP INDEX "clients_email_contact_idx";--> statement-breakpoint
DROP INDEX "clients_code_postal_idx";--> statement-breakpoint
DROP INDEX "clients_ville_idx";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "prenom_contact";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "nom_contact";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "poste_contact";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "email_contact";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "phone_contact";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "prenom_signataire";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "nom_signataire";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "poste_signataire";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "email_signataire";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "surface";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "effectif";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "type_batiment";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "type_occupation";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "adresse_ligne_1";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "adresse_ligne_2";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "code_postal";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "ville";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "date_de_demarrage";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "commentaires";