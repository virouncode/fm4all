// src/app/api/invalidate-cache/route.ts
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { getSession } from "@/server/auth/get-session";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z
  .object({
    tag: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .refine((v) => v.tag || (v.tags && v.tags.length > 0), {
    message: "Provide 'tag' or non-empty 'tags'.",
  });

export async function POST(request: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", {
      status: 401,
    });
  }
  try {
    // ✅ validation
    const { tag, tags } = bodySchema.parse(await request.json());

    // ✅ invalidation
    if (tag) {
      revalidateTag(tag);
    } else if (tags) {
      for (const t of tags) revalidateTag(t);
    }

    return successResponse(
      { invalidated: tag ? [tag] : (tags ?? []) },
      { status: 200, message: "Cache invalidé avec succès." },
    );
  } catch (err) {
    // Zod validation
    if (err instanceof z.ZodError) {
      return errorResponse("VALIDATION", "Requête invalide.", {
        status: 422,
        details: err.flatten(),
      });
    }

    console.error("Erreur lors de l'invalidation du cache:", err);
    return errorResponse("INTERNAL", "Erreur d'invalidation du cache.", {
      status: 500,
    });
  }
}
