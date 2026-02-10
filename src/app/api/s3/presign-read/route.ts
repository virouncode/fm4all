export const runtime = "nodejs";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { z } from "zod";

import { parseJson } from "@/app/api/(helpers)/parseJson";
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { getSession } from "@/server/auth/get-session";
import { s3, S3_BUCKET, validateKeyAllowed } from "@/server/s3/s3";

const readExpiresIn = Number(process.env.S3_PRESIGN_READ_EXPIRES_SECONDS ?? 60);

const bodySchema = z.object({
  proprietaireEntrepriseId: z.uuid(),
  key: z.string().min(1),
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

    // TODO: vérifier accès userId -> body.proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(userId, body.proprietaireEntrepriseId))) {
    //   return errorResponse("FORBIDDEN", "Access denied.", { status: 403 });
    // }

    const v = validateKeyAllowed({
      key: body.key,
      proprietaireEntrepriseId: body.proprietaireEntrepriseId,
    });

    if (!v.ok) {
      return errorResponse(
        v.status === 400 ? "VALIDATION" : "FORBIDDEN",
        v.message,
        { status: v.status, details: v.details },
      );
    }

    const cmd = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: body.key,
      ResponseContentDisposition: "inline",
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: readExpiresIn });

    return successResponse({ url }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse("VALIDATION", "Invalid input.", {
        status: 422,
        details: z.treeifyError(err),
      });
    }
    console.error("presign-read error:", err);
    return errorResponse("DEPENDENCY", "Failed to presign read URL.", {
      status: 502,
    });
  }
}
