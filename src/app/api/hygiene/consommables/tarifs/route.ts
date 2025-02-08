import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { fournisseurs, hygieneConsoTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectHygieneConsoTarifsSchema } from "@/zod-schemas/hygieneConsoTarifs";
import { and, eq, getTableColumns } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const effectif = searchParams.get("effectif");
  const fournisseurId = searchParams.get("fournisseurId");

  if (!effectif || !fournisseurId) {
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
      .select({
        ...getTableColumns(hygieneConsoTarifs),
        nomFournisseur: fournisseurs.nomFournisseur,
        slogan: fournisseurs.slogan,
      })
      .from(hygieneConsoTarifs)
      .innerJoin(
        fournisseurs,
        eq(hygieneConsoTarifs.fournisseurId, fournisseurs.id)
      )
      .where(
        and(
          eq(hygieneConsoTarifs.effectif, parseInt(effectif)),
          eq(hygieneConsoTarifs.fournisseurId, parseInt(fournisseurId))
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
      selectHygieneConsoTarifsSchema.parse(result)
    );
    const data = validatedResults.map((result) => ({
      ...result,
      paParPersonneEmp: result.paParPersonneEmp / RATIO,
      paParPersonneSavon: result.paParPersonneSavon / RATIO,
      paParPersonnePh: result.paParPersonnePh / RATIO,
      paParPersonneDesinfectant: result.paParPersonneDesinfectant / RATIO,
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
