import "server-only";

import { documentCategorieCodes } from "@/constants/codeTables";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import crypto from "crypto";
import path from "path";
import { Readable } from "stream";

export const S3_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov (iPhone)
] as const;

export type S3AllowedContentType = (typeof S3_ALLOWED_CONTENT_TYPES)[number];

/** TODO: Adapte à tes scopes */
export const S3_SCOPES = ["documents", "avatars", "tickets", "temp"] as const;
export type S3ScopeType = (typeof S3_SCOPES)[number];

/** Vars d'env */
const AWS_REGION = process.env.AWS_REGION;
export const S3_BUCKET = process.env.AWS_S3_BUCKET;

if (!AWS_REGION) throw new Error("Missing env AWS_REGION");
if (!S3_BUCKET) throw new Error("Missing env AWS_S3_BUCKET");

export const s3 = new S3Client({
  region: AWS_REGION,
});

const EXT_BY_CONTENT_TYPE: Record<S3AllowedContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Pluralise une catégorie de document pour obtenir le nom de dossier S3
 * Gère les cas particuliers de pluralisation en français
 */
function pluralizeCategorie(
  categorie: (typeof documentCategorieCodes)[number],
): string {
  // Mots invariables
  if (categorie === "devis") {
    return "devis";
  }

  // Cas spécial : compte_rendu → comptes_rendus (double pluriel)
  if (categorie === "compte_rendu") {
    return "comptes_rendus";
  }

  // Mots composés avec underscore : pluriel sur le premier mot uniquement
  // Ex: bon_commande → bons_commande, rapport_intervention → rapports_intervention
  if (categorie.includes("_")) {
    const parts = categorie.split("_");
    parts[0] = `${parts[0]}s`;
    return parts.join("_");
  }

  // Mots simples : ajouter "s"
  // Ex: avatar → avatars, document → documents, contrat → contrats
  return `${categorie}s`;
}

export function makeTempKey(params: {
  proprietaireEntrepriseId: string;
  categorie: (typeof documentCategorieCodes)[number];
  contentType: S3AllowedContentType;
  originalName: string;
}) {
  const { proprietaireEntrepriseId, categorie, contentType, originalName } =
    params;

  const safeBase = path
    .parse(originalName)
    .name.replace(/[^\w.\-]+/g, "_")
    .slice(0, 80);

  const ext = EXT_BY_CONTENT_TYPE[contentType];
  const uuid = crypto.randomUUID();

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");

  // Pluralisation de la catégorie pour le nom de dossier S3
  const folderName = pluralizeCategorie(categorie);

  return `temp/entreprises/${proprietaireEntrepriseId}/${folderName}/${yyyy}/${mm}/${uuid}_${safeBase}.${ext}`;
}

/**
 * Promote a file from temp/ to its permanent location.
 * Copy the file to the new location and delete the temp file.
 * @returns The new permanent key
 */

export async function promoteS3Key(params: {
  tempKey: string;
}): Promise<string> {
  const { tempKey } = params;

  // already promoted (or not a temp key)
  if (!tempKey.startsWith("temp/")) {
    console.log(`[S3] Key already promoted or not temp: ${tempKey}`);
    return tempKey;
  }

  const newKey = tempKey.replace(/^temp\//, "documents/");
  console.log(`[S3] Promoting ${tempKey} → ${newKey}`);

  try {
    await s3.send(
      new CopyObjectCommand({
        Bucket: S3_BUCKET,
        CopySource: `${S3_BUCKET}/${tempKey}`,
        Key: newKey,
      }),
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: tempKey,
      }),
    );

    console.log(`[S3] Successfully promoted to ${newKey}`);
    return newKey;
  } catch (e) {
    console.error(`[S3] Failed to promote ${tempKey}:`, e);
    // keep it simple: callers convert to API errorResponse
    throw new Error(
      `S3_PROMOTE_FAILED: tempKey=${tempKey} newKey=${newKey} cause=${String(e)}`,
    );
  }
}

/**
 * Vérifie que la key est safe et dans des préfixes autorisés
 */
export type KeyValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: "S3_KEY_INVALID" | "S3_KEY_FORBIDDEN";
      message: string;
      status: 400 | 403;
      details?: unknown;
    };

export function validateKeyAllowed(params: {
  key: string;
  proprietaireEntrepriseId: string;
}): KeyValidationResult {
  const { key, proprietaireEntrepriseId } = params;

  if (
    key.includes("..") ||
    key.includes("\\") ||
    key.startsWith("/") ||
    key.includes("\0")
  ) {
    return {
      ok: false,
      code: "S3_KEY_INVALID",
      message: "Invalid S3 key.",
      status: 400,
      details: { key },
    };
  }

  const allowedTempPrefix = `temp/entreprises/${proprietaireEntrepriseId}/`;
  const allowedDocsPrefix = `documents/entreprises/${proprietaireEntrepriseId}/`;

  if (
    !key.startsWith(allowedTempPrefix) &&
    !key.startsWith(allowedDocsPrefix)
  ) {
    return {
      ok: false,
      code: "S3_KEY_FORBIDDEN",
      message: "S3 key not allowed for this entreprise.",
      status: 403,
      details: { key, proprietaireEntrepriseId },
    };
  }

  return { ok: true };
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  if (stream instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  throw new Error("Unsupported S3 Body stream type");
}

export async function getS3ObjectAsBuffer(key: string): Promise<Buffer> {
  const obj = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );

  if (!obj.Body) throw new Error("S3 object body is empty");
  return streamToBuffer(obj.Body);
}

/**
 * Delete an object from S3.
 * This is a low-level utility - caller is responsible for validation/permissions.
 */
export async function deleteS3Object(params: { key: string }): Promise<void> {
  const { key } = params;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
}
