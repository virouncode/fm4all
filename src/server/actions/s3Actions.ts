"use server";

import { env } from "@/lib/env";
import { actionClient } from "@/lib/action/safe-actions";
import {
  s3,
  S3_BUCKET,
} from "@/server/s3/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { flattenValidationErrors } from "next-safe-action";
import path from "node:path";
import { z } from "zod";

const uploadExpiresIn = env.S3_PRESIGN_UPLOAD_EXPIRES_SECONDS;
const readExpiresIn = env.S3_PRESIGN_READ_EXPIRES_SECONDS;

// ==================== DEVIS PDF (parcours public, sans authentification) ====================

export const getPresignedDevisUploadUrlAction = actionClient
  .metadata({ actionName: "getPresignedDevisUploadUrlAction" })
  .inputSchema(
    z.object({
      originalName: z.string().min(1, "Le nom du fichier est requis"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const safeBase = path
      .parse(parsedInput.originalName)
      .name.replace(/[^\w.\-]+/g, "_")
      .slice(0, 80);
    const uuid = crypto.randomUUID();
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const key = `public/devis_temporaires/${yyyy}/${mm}/${uuid}_${safeBase}.pdf`;

    const cmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: "application/pdf",
    });

    const uploadUrl = await getSignedUrl(s3, cmd, {
      expiresIn: uploadExpiresIn,
    });

    return { key, uploadUrl };
  });

// ==================== DEVIS TARIF IMAGES (parcours public, lecture seule) ====================

export const getPresignedDevisImageReadUrlAction = actionClient
  .metadata({ actionName: "getPresignedDevisImageReadUrlAction" })
  .inputSchema(
    z.object({
      key: z.string().min(1, "La clé S3 est requise"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const { key } = parsedInput;
    if (
      key.includes("..") ||
      key.includes("\\") ||
      key.startsWith("/") ||
      key.includes("\0") ||
      !key.startsWith("documents/")
    ) {
      throw new Error("Clé S3 invalide");
    }

    const cmd = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: readExpiresIn });
    return { url };
  });
