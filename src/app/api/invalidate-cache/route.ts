// src/app/api/invalidate-cache/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tag, tags } = body;

  try {
    if (tag) {
      revalidateTag(tag);
    } else if (tags && tags.length > 0) {
      for (const t of tags) {
        revalidateTag(t);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'invalidation du cache:", error);
    return NextResponse.json(
      { success: false, error: "Erreur d'invalidation" },
      { status: 500 }
    );
  }
}
