-- Rename enum value recurrent → abonnement
ALTER TYPE "devis_type_prix" RENAME VALUE 'recurrent' TO 'abonnement';

-- Add new values to devis_type_prix
ALTER TYPE "devis_type_prix" ADD VALUE IF NOT EXISTS 'installation';
ALTER TYPE "devis_type_prix" ADD VALUE IF NOT EXISTS 'frais_livraison';

-- Create devis_periode_facturation enum
CREATE TYPE "devis_periode_facturation" AS ENUM ('semaine', 'mois', 'annee');

-- Add periode_facturation column (nullable)
ALTER TABLE "devis_lignes" ADD COLUMN "periode_facturation" "devis_periode_facturation";
