import { db } from "@/db";
import { propreteInstalDistribTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectPropreteInstalDistribTarifsSchema } from "@/zod-schemas/propreteInstalDistribTarifs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const effectif = searchParams.get("effectif");
  const fournisseurId = searchParams.get("fournisseurId");
  if (!fournisseurId || !effectif) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message:
            "Requête invalide, vous devez fournir un fournisseurId et un effectif",
        },
      },
      { status: 400 }
    );
  }
  try {
    const results = await db
      .select()
      .from(propreteInstalDistribTarifs)
      .where(
        and(
          eq(propreteInstalDistribTarifs.effectif, parseInt(effectif)),
          eq(propreteInstalDistribTarifs.fournisseurId, parseInt(fournisseurId))
        )
      );
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Aucune donnée trouvée pour ce fournisseur et cet effectif",
        },
        { status: 200 }
      );
    }
    const validatedResults = results.map((result) =>
      selectPropreteInstalDistribTarifsSchema.parse(result)
    );
    return NextResponse.json(
      {
        success: true,
        data: validatedResults,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
