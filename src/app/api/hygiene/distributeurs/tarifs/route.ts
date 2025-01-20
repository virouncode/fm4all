import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { fournisseurs, hygieneDistribTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectHygieneDistribTarifsSchema } from "@/zod-schemas/hygieneDistribTarifs";
import { eq, getTableColumns } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fournisseurId = searchParams.get("fournisseurId");
  if (!fournisseurId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Requête invalide, vous devez fournir un fournisseurId",
        },
      },
      { status: 400 }
    );
  }
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneDistribTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(hygieneDistribTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneDistribTarifs.fournisseurId, fournisseurs.id)
      )
      .where(eq(hygieneDistribTarifs.fournisseurId, parseInt(fournisseurId)));
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "Aucune donnée trouvée pour ce fournisseur",
        },
        { status: 200 }
      );
    }
    const validatedResults = results.map((result) =>
      selectHygieneDistribTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot ? result.oneShot / RATIO : null,
      pa12M: result.pa12M ? result.pa12M / RATIO : null,
      pa24M: result.pa24M ? result.pa24M / RATIO : null,
      pa36M: result.pa36M ? result.pa36M / RATIO : null,
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
