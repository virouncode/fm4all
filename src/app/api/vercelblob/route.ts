import { errorHandler } from "@/lib/errorHandler";
import { del, head, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponseBody } from "../types/apiResponseBody";

type UploadMetadata = {
  url: string;
  size: number;
  mimeType: string;
  filename: string;
  pathname: string;
};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename")?.trim() ?? "";
    const rawFoldername = searchParams.get("foldername")?.trim() ?? "";

    if (!filename) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Aucun nom de fichier fourni.",
        code: "MISSING_FILENAME",
      };
      return NextResponse.json(responseBody, { status: 400 });
    }

    if (!request.body) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Aucun contenu de fichier trouvé.",
        code: "MISSING_FILE",
      };
      return NextResponse.json(responseBody, { status: 400 });
    }

    const safeFoldername = rawFoldername
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.\./g, "");

    const safeName = filename
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
    const base = safeName.replace(/\.[^.]+$/, "");

    const pathname = safeFoldername
      ? `${safeFoldername}/${base}_${Date.now()}.${ext}`
      : `${base}_${Date.now()}.${ext}`;

    const contentType = request.headers.get("content-type") ?? undefined;

    const blob = await put(pathname, request.body, {
      access: "public",
      contentType,
    });

    const meta = await head(blob.url);

    if (!meta) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Impossible de récupérer les métadonnées du fichier.",
        code: "HEAD_FAILED",
      };
      return NextResponse.json(responseBody, { status: 500 });
    }

    const data: UploadMetadata = {
      url: meta.url,
      size: meta.size,
      mimeType: meta.contentType,
      filename, // nom logique original
      pathname: meta.pathname,
    };

    const responseBody: ApiResponseBody<UploadMetadata> = {
      success: true,
      message: "Fichier uploadé avec succès",
      data,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    errorHandler(error);

    const responseBody: ApiResponseBody = {
      success: false,
      message: "Erreur interne lors de l'upload du fichier.",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(responseBody, { status: 500 });
  }
}

type DeleteMetadata = {
  url: string;
};

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlOrPathname = searchParams.get("url")?.trim() ?? "";

    if (!urlOrPathname) {
      const responseBody: ApiResponseBody = {
        success: false,
        message: "Aucun fichier spécifié pour suppression",
        code: "MISSING_URL",
      };
      return NextResponse.json(responseBody, { status: 400 });
    }

    // Optionnel : sécuriser un peu l'entrée
    // - si c'est une URL complète -> on garde telle quelle
    // - sinon on considère que c'est un pathname interne
    let target = urlOrPathname;

    try {
      const parsed = new URL(urlOrPathname);
      // Tu peux éventuellement vérifier le host ici si tu veux être strict
      // if (!parsed.host.endsWith(".blob.vercel-storage.com")) { ... }
      target = parsed.toString();
    } catch {
      // Ce n'est pas une URL, on suppose que c'est un pathname interne.
      // del() accepte aussi les pathnames.
      target = urlOrPathname;
    }

    await del(target);

    const data: DeleteMetadata = { url: target };

    const responseBody: ApiResponseBody<DeleteMetadata> = {
      success: true,
      message: "Fichier supprimé",
      data,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    errorHandler(error);

    const responseBody: ApiResponseBody = {
      success: false,
      message: "Erreur interne lors de la suppression du fichier.",
      code: "INTERNAL_ERROR",
    };

    return NextResponse.json(responseBody, { status: 500 });
  }
}
