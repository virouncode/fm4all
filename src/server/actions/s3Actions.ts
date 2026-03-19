"use server";

import { documentCategorieCodes } from "@/constants/codeTables";
import { errors } from "@/lib/action/errors";
import { env } from "@/lib/env";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import {
  makeTempKey,
  s3,
  S3_ALLOWED_CONTENT_TYPES,
  S3_BUCKET,
  validateKeyAllowed,
} from "@/server/s3/s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

const uploadExpiresIn = env.S3_PRESIGN_UPLOAD_EXPIRES_SECONDS;
const readExpiresIn = env.S3_PRESIGN_READ_EXPIRES_SECONDS;

// ==================== GET PRESIGNED UPLOAD URL ====================

export const getPresignedUploadUrlAction = actionClient
  .metadata({ actionName: "getPresignedUploadUrlAction" })
  .inputSchema(
    z.object({
      proprietaireEntrepriseId: z.uuid("ID d'entreprise invalide"),
      categorie: z.enum(documentCategorieCodes),
      contentType: z.enum(S3_ALLOWED_CONTENT_TYPES),
      originalName: z.string().min(1, "Le nom du fichier est requis"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // TODO: Vérifier que currentUser a accès à proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(currentUser.id, parsedInput.proprietaireEntrepriseId))) {
    //   throw errors.forbidden("Accès refusé à cette entreprise.");
    // }

    const key = makeTempKey({
      proprietaireEntrepriseId: parsedInput.proprietaireEntrepriseId,
      categorie: parsedInput.categorie,
      contentType: parsedInput.contentType,
      originalName: parsedInput.originalName,
    });

    const cmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: parsedInput.contentType,
    });

    const uploadUrl = await getSignedUrl(s3, cmd, {
      expiresIn: uploadExpiresIn,
    });

    // Generate read URL for immediate preview
    const readCmd = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ResponseContentDisposition: "inline",
    });
    const previewUrl = await getSignedUrl(s3, readCmd, {
      expiresIn: readExpiresIn,
    });

    return {
      key,
      uploadUrl,
      previewUrl,
      headers: { "Content-Type": parsedInput.contentType },
    };
  });

// ==================== GET PRESIGNED READ URL ====================

export const getPresignedReadUrlAction = actionClient
  .metadata({ actionName: "getPresignedReadUrlAction" })
  .inputSchema(
    z.object({
      proprietaireEntrepriseId: z.uuid("ID d'entreprise invalide"),
      key: z.string().min(1, "La clé S3 est requise"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // TODO: Vérifier accès userId -> proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(currentUser.id, parsedInput.proprietaireEntrepriseId))) {
    //   throw errors.forbidden("Accès refusé à cette entreprise.");
    // }

    const validation = validateKeyAllowed({
      key: parsedInput.key,
      proprietaireEntrepriseId: parsedInput.proprietaireEntrepriseId,
    });

    if (!validation.ok) {
      if (validation.status === 400) {
        throw errors.validation(validation.message);
      } else {
        throw errors.forbidden(validation.message);
      }
    }

    const cmd = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: parsedInput.key,
      ResponseContentDisposition: "inline",
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: readExpiresIn });

    return { url };
  });

// ==================== DELETE S3 OBJECT ====================

export const deleteS3ObjectAction = actionClient
  .metadata({ actionName: "deleteS3ObjectAction" })
  .inputSchema(
    z.object({
      proprietaireEntrepriseId: z.uuid("ID d'entreprise invalide"),
      key: z.string().min(1, "La clé S3 est requise"),
    }),
    {
      handleValidationErrorsShape: async (ve) =>
        flattenValidationErrors(ve).fieldErrors,
    },
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw errors.unauthorized("Vous n'êtes pas authentifié.");
    }

    // TODO: Vérifier accès userId -> proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(currentUser.id, parsedInput.proprietaireEntrepriseId))) {
    //   throw errors.forbidden("Accès refusé à cette entreprise.");
    // }

    const validation = validateKeyAllowed({
      key: parsedInput.key,
      proprietaireEntrepriseId: parsedInput.proprietaireEntrepriseId,
    });

    if (!validation.ok) {
      if (validation.status === 400) {
        throw errors.validation(validation.message);
      } else {
        throw errors.forbidden(validation.message);
      }
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: parsedInput.key,
      }),
    );

    return { success: true, message: "Fichier supprimé avec succès." };
  });
