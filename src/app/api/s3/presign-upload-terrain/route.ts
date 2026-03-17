export const runtime = "nodejs";

import { parseJson } from "@/app/api/(helpers)/parseJson";
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { db } from "@/db";
import {
  clientServiceOccurrences,
  clientServices,
  occurrenceFieldLinks,
} from "@/db/schema/services";
import { env } from "@/lib/env";
import {
  makeTempKey,
  s3,
  S3_ALLOWED_CONTENT_TYPES,
  S3_BUCKET,
} from "@/server/s3/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

const uploadExpiresIn = env.S3_PRESIGN_UPLOAD_EXPIRES_SECONDS;

const bodySchema = z.object({
  token: z.string().min(1),
  contentType: z.enum(S3_ALLOWED_CONTENT_TYPES),
  originalName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await parseJson(req, bodySchema);
    const now = new Date();

    // Valider le token terrain
    const [link] = await db
      .select({
        clientEntrepriseId: clientServices.entrepriseId,
      })
      .from(occurrenceFieldLinks)
      .innerJoin(
        clientServiceOccurrences,
        eq(clientServiceOccurrences.id, occurrenceFieldLinks.occurrenceId),
      )
      .innerJoin(
        clientServices,
        eq(clientServices.id, clientServiceOccurrences.clientServiceId),
      )
      .where(
        and(
          eq(occurrenceFieldLinks.token, body.token),
          isNull(occurrenceFieldLinks.revokedAt),
          gt(occurrenceFieldLinks.expiresAt, now),
        ),
      )
      .limit(1);

    if (!link) {
      return errorResponse("UNAUTHORIZED", "Lien terrain invalide ou expiré.", {
        status: 401,
      });
    }

    const key = makeTempKey({
      proprietaireEntrepriseId: link.clientEntrepriseId,
      categorie: "tache_piece_jointe",
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
      { key, url, headers: { "Content-Type": body.contentType } },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse("VALIDATION", "Invalid input.", {
        status: 422,
        details: z.treeifyError(err),
      });
    }
    console.error("presign-upload-terrain error:", err);
    return errorResponse("DEPENDENCY", "Failed to presign upload URL.", {
      status: 502,
    });
  }
}
