-- 1. Enlever le DEFAULT qui dépend de l'ancien enum
ALTER TABLE "tickets"
  ALTER COLUMN "status" DROP DEFAULT;

-- 2. Convertir temporairement la colonne en TEXT
ALTER TABLE "tickets"
  ALTER COLUMN "status" TYPE text USING status::text;

-- 3. Supprimer l'ancien type
DROP TYPE "ticket_status";

-- 4. Recréer le type avec les nouvelles valeurs
CREATE TYPE "ticket_status" AS ENUM (
  'nouveau',
  'pris_en_charge',
  'en_attente_fournisseur',
  'en_attente_client',
  'a_valider',
  'clos',
  'refuse'
);

-- 5. Rebasculer la colonne sur le nouveau type
ALTER TABLE "tickets"
  ALTER COLUMN "status"
  TYPE "ticket_status"
  USING (status::text::"ticket_status");

-- 6. Remettre un DEFAULT si tu en veux un
ALTER TABLE "tickets"
  ALTER COLUMN "status" SET DEFAULT 'nouveau';