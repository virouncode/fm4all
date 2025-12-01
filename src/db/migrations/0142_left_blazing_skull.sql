ALTER TABLE "fournisseurs"
  ALTER COLUMN "annee_creation" TYPE integer
  USING NULLIF("annee_creation", '')::integer;

ALTER TABLE "fournisseurs"
  ALTER COLUMN "nb_clients" TYPE integer
  USING NULLIF("nb_clients", '')::integer;

ALTER TABLE "fournisseurs"
  ALTER COLUMN "nb_avis" TYPE integer
  USING NULLIF("nb_avis", '')::integer;

