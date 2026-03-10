-- Ajout du type d'adhésion sur les invitations entreprise
-- Permet de distinguer une invitation admin "client" d'une invitation admin "prestataire"
-- pour les entreprises ayant les deux rôles simultanément.

CREATE TYPE "public"."invitation_type_adhesion" AS ENUM('client', 'prestataire');

ALTER TABLE "entreprise_invitations"
  ADD COLUMN "type_adhesion" "invitation_type_adhesion" NOT NULL DEFAULT 'client';

-- Les invitations existantes proviennent toutes de inviterClientAdminAction → type "client" correct.
-- On supprime le DEFAULT après le backfill : toute future insertion devra fournir explicitement la valeur.
ALTER TABLE "entreprise_invitations"
  ALTER COLUMN "type_adhesion" DROP DEFAULT;
