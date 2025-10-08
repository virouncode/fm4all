// src/app/api/invalidate-cache/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBody } from "../types/apiResponseBody";

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
    const responseBody: ApiResponseBody = {
      message: "Cache invalidé avec succès.",
      success: true,
    };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'invalidation du cache:", error);
    const responseBody = {
      message: "Erreur d'invalidation du cache",
      success: false,
    };
    return NextResponse.json(responseBody, { status: 500 });
  }
}
