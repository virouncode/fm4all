import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "";
  const foldername = searchParams.get("foldername") || "";
  if (filename && request.body) {
    const pathname = foldername ? `${foldername}/${filename}` : `${filename}`;
    const blob = await put(pathname, request.body, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json(blob);
  } else {
    return NextResponse.json({ message: "Pas de nom de fichier" });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlToDelete = searchParams.get("url") as string;
  await del(urlToDelete);
  return NextResponse.json({ message: "Fichier supprimé" });
}
