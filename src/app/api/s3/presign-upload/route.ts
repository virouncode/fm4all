export const runtime = "nodejs";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { z } from "zod";

import { parseJson } from "@/app/api/(helpers)/parseJson";
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { documentCategorieCodes } from "@/constants/codeTables";
import { env } from "@/lib/env";
import { getSession } from "@/server/auth/get-session";
import {
  makeTempKey,
  s3,
  S3_ALLOWED_CONTENT_TYPES,
  S3_BUCKET,
} from "@/server/s3/s3";

const uploadExpiresIn = env.S3_PRESIGN_UPLOAD_EXPIRES_SECONDS;

const bodySchema = z.object({
  proprietaireEntrepriseId: z.uuid(),
  categorie: z.enum(documentCategorieCodes),
  contentType: z.enum(S3_ALLOWED_CONTENT_TYPES),
  originalName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", {
      status: 401,
    });
  }

  try {
    const body = await parseJson(req, bodySchema);

    // TODO: vérifier que userId a accès à body.proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(userId, body.proprietaireEntrepriseId))) {
    //   return errorResponse("FORBIDDEN", "Access denied.", { status: 403 });
    // }

    const key = makeTempKey({
      proprietaireEntrepriseId: body.proprietaireEntrepriseId,
      categorie: body.categorie,
      contentType: body.contentType,
      originalName: body.originalName,
    });

    const cmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: body.contentType,
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: uploadExpiresIn });

    return successResponse(
      {
        key,
        url,
        headers: { "Content-Type": body.contentType },
      },
      { status: 200, message: "Presigned upload URL generated." },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse("VALIDATION", "Invalid input.", {
        status: 422,
        details: z.treeifyError(err),
      });
    }
    console.error("presign-upload error:", err);
    return errorResponse("DEPENDENCY", "Failed to presign upload URL.", {
      status: 502,
    });
  }
}
