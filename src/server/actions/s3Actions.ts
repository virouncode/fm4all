"use server";

import { env } from "@/lib/env";
import { actionClient } from "@/lib/action/safe-actions";
import {
  makeTempKey,
  s3,
  S3_BUCKET,
} from "@/server/s3/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

const uploadExpiresIn = env.S3_PRESIGN_UPLOAD_EXPIRES_SECONDS;

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
    const key = makeTempKey({
      proprietaireEntrepriseId: "public",
      categorie: "devis_temporaire",
      contentType: "application/pdf",
      originalName: parsedInput.originalName,
    });

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
