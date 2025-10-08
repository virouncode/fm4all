import { errorHandler } from "@/lib/errorHandler";
import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBody } from "../types/apiResponseBody";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "";
    const foldername = searchParams.get("foldername") || "";

    if (!filename || !request.body) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Aucun nom de fichier ou contenu trouvé.",
        code: "MISSING_FILE",
      };
      return NextResponse.json(responseBody, { status: 400 });
    }

    const pathname = foldername ? `${foldername}/${filename}` : `${filename}`;
    const blob = await put(pathname, request.body, {
      access: "public",
      addRandomSuffix: true,
    });
    const responseBody: ApiResponseBody<typeof blob> = {
      success: true,
      message: "Fichier uploadé avec succès",
      data: blob,
    };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    errorHandler(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get("url") as string;
    if (!urlToDelete) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Aucun fichier spécifié pour suppression",
        code: "MISSING_URL",
      };
      return NextResponse.json(responseBody, { status: 400 });
    }
    await del(urlToDelete);
    const responseBody: ApiResponseBody = {
      success: true,
      message: "Fichier supprimé",
    };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    errorHandler(error);
  }
}
