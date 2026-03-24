/**
 * Variables d'environnement typées.
 *
 * Utiliser toujours `env.XXX` plutôt que `process.env.XXX` directement.
 *
 * ⚠️  Les variables sans préfixe NEXT_PUBLIC_ sont des secrets serveur.
 *     Ne jamais les importer dans des composants "use client".
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return value;
}

function optional(key: string): string | undefined {
  return process.env[key];
}

function optionalWithDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

// ---------------------------------------------------------------------------
// Serveur — secrets (ne jamais utiliser côté client)
// ---------------------------------------------------------------------------
export const env = {
  APP_URL: required("APP_URL"),
  DATABASE_URL: required("DATABASE_URL"),
  MAILGUN_API_KEY: required("MAILGUN_API_KEY"),
  AWS_REGION: required("AWS_REGION"),
  AWS_S3_BUCKET: required("AWS_S3_BUCKET"),

  FM4ALL_ENTREPRISE_ID: required("FM4ALL_ENTREPRISE_ID"),

  // Optionnels serveur
  MAILGUN_BCC_EMAIL: optional("MAILGUN_BCC_EMAIL"),
  MAILGUN_CONTACT_EMAIL: optional("MAILGUN_CONTACT_EMAIL"),
  S3_PRESIGN_READ_EXPIRES_SECONDS: Number(
    optionalWithDefault("S3_PRESIGN_READ_EXPIRES_SECONDS", "60"),
  ),
  S3_PRESIGN_UPLOAD_EXPIRES_SECONDS: Number(
    optionalWithDefault("S3_PRESIGN_UPLOAD_EXPIRES_SECONDS", "60"),
  ),
  S3_PRESIGN_DEVIS_READ_EXPIRES_SECONDS: Number(
    optionalWithDefault("S3_PRESIGN_DEVIS_READ_EXPIRES_SECONDS", "86400"),
  ),

  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",

  // ---------------------------------------------------------------------------
  // Client — variables publiques (accessibles côté client et serveur)
  // ---------------------------------------------------------------------------
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optional("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: optional("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  NEXT_PUBLIC_SANITY_DATASET: optional("NEXT_PUBLIC_SANITY_DATASET"),
  NEXT_PUBLIC_SANITY_API_VERSION: optional("NEXT_PUBLIC_SANITY_API_VERSION"),
} as const;
