export const runtime = "nodejs";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { z } from "zod";

import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { getSession } from "@/server/auth/get-session";
import { s3, S3_BUCKET, validateKeyAllowed } from "@/server/s3/s3";

const querySchema = z.object({
  proprietaireEntrepriseId: z.uuid(),
  key: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", {
      status: 401,
    });
  }

  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      proprietaireEntrepriseId: url.searchParams.get(
        "proprietaireEntrepriseId",
      ),
      key: url.searchParams.get("key"),
    });

    if (!parsed.success) {
      return errorResponse("VALIDATION", "Invalid input.", {
        status: 422,
        details: parsed.error.flatten(),
      });
    }

    const { proprietaireEntrepriseId, key } = parsed.data;

    // TODO: vérifier accès userId -> proprietaireEntrepriseId
    // if (!(await userHasEntrepriseAccess(userId, proprietaireEntrepriseId))) {
    //   return errorResponse("FORBIDDEN", "Access denied.", { status: 403 });
    // }

    const v = validateKeyAllowed({ key, proprietaireEntrepriseId });
    if (!v.ok) {
      return errorResponse(
        v.status === 400 ? "VALIDATION" : "FORBIDDEN",
        v.message,
        { status: v.status, details: v.details },
      );
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      }),
    );

    return successResponse(
      { ok: true },
      { status: 200, message: "File deleted." },
    );
  } catch (err) {
    console.error("s3 delete error:", err);
    return errorResponse("DEPENDENCY", "Failed to delete file.", {
      status: 502,
    });
  }
}
