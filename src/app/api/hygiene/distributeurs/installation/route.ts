import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { hygieneInstalDistribTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectHygieneInstalDistribTarifsSchema } from "@/zod-schemas/hygieneInstalDistribTarifs";
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
      .from(hygieneInstalDistribTarifs)
      .where(
        and(
          eq(hygieneInstalDistribTarifs.effectif, parseInt(effectif)),
          eq(hygieneInstalDistribTarifs.fournisseurId, parseInt(fournisseurId))
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
      selectHygieneInstalDistribTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      prixInstallation: result.prixInstallation / RATIO,
    }));
    return NextResponse.json(
      {
        success: true,
        data,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
