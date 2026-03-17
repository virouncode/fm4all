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
  BETTER_AUTH_URL: required("BETTER_AUTH_URL"),
  DATABASE_URL: required("DATABASE_URL"),
  MAILGUN_API_KEY: required("MAILGUN_API_KEY"),
  AWS_REGION: required("AWS_REGION"),
  AWS_S3_BUCKET: required("AWS_S3_BUCKET"),
  INSEE_API_TOKEN: optional("INSEE_API_TOKEN"),

  // Optionnels serveur
  MAILGUN_BCC_EMAIL: optional("MAILGUN_BCC_EMAIL"),
  CRON_SECRET: required("CRON_SECRET"),
  S3_PRESIGN_READ_EXPIRES_SECONDS: Number(
    optionalWithDefault("S3_PRESIGN_READ_EXPIRES_SECONDS", "60"),
  ),
  S3_PRESIGN_UPLOAD_EXPIRES_SECONDS: Number(
    optionalWithDefault("S3_PRESIGN_UPLOAD_EXPIRES_SECONDS", "60"),
  ),

  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",

  // ---------------------------------------------------------------------------
  // Client — variables publiques (accessibles côté client et serveur)
  // ---------------------------------------------------------------------------
  NEXT_PUBLIC_PUSHER_APP_ID: optional("NEXT_PUBLIC_PUSHER_APP_ID"),
  NEXT_PUBLIC_PUSHER_KEY: optional("NEXT_PUBLIC_PUSHER_KEY"),
  PUSHER_SECRET: required("PUSHER_SECRET"),
  NEXT_PUBLIC_PUSHER_CLUSTER: optional("NEXT_PUBLIC_PUSHER_CLUSTER"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optional("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: optional("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  NEXT_PUBLIC_SANITY_DATASET: optional("NEXT_PUBLIC_SANITY_DATASET"),
  NEXT_PUBLIC_SANITY_API_VERSION: optional("NEXT_PUBLIC_SANITY_API_VERSION"),
} as const;
