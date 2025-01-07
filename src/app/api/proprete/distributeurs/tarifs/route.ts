import { db } from "@/db";
import { fournisseurs, propreteDistribTarifs } from "@/db/schema";
import { errorHandler } from "@/lib/errorHandler";
import { selectPropreteDistribTarifsSchema } from "@/zod-schemas/propreteDistribTarifs";
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
        ...getTableColumns(propreteDistribTarifs),
        nomEntreprise: fournisseurs.nomEntreprise,
        slogan: fournisseurs.slogan,
      })
      .from(propreteDistribTarifs)
      .innerJoin(
        fournisseurs,
        eq(propreteDistribTarifs.fournisseurId, fournisseurs.id)
      )
      .where(eq(propreteDistribTarifs.fournisseurId, parseInt(fournisseurId)));
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
      selectPropreteDistribTarifsSchema.parse(result)
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
