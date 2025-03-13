import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "";
  if (filename && request.body) {
    const blob = await put(`devis/${filename}`, request.body, {
      access: "public",
    });
    return NextResponse.json(blob);
  } else {
    return NextResponse.json({ message: "Pas de nom de fichier" });
  }
}
