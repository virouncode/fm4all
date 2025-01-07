import { errorHandler } from "@/lib/errorHandler";
import { SelectNettoyageVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const surface = searchParams.get("surface");
  if (!surface) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Requête invalide, vous devez fournir une surface",
        },
      },
      { status: 400 }
    );
  }
  const tarifsResponse = await fetch(
    `${process.env.MY_URL}/api/nettoyage/vitrerie/tarifs?surface=${surface}`
  );
  if (!tarifsResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXTERNAL_API_ERROR",
          message: `Erreur lors de la récupération des tarifs : ${tarifsResponse.statusText}`,
        },
      },
      { status: tarifsResponse.status }
    );
  }
  try {
    const tarifsJson = await tarifsResponse.json();
    if (!tarifsJson.success) {
      return NextResponse.json(
        {
          success: false,
          error: tarifsJson.error,
        },
        { status: 400 }
      );
    }
    const tarifs: SelectNettoyageVitrerieTarifsType[] = tarifsJson.data;
    const surfaceVitrerie = parseInt(surface) * 0.15;
    const surfaceCloisons = parseInt(surface) * 0.15;
    const propositions = tarifs.map((tarif) => {
      const { cadenceVitres, cadenceCloisons, tauxHoraire } = tarif;
      return {
        ...tarif,
        prixVitrerieParPassage: (surfaceVitrerie / cadenceVitres) * tauxHoraire,
        prixCloisonsParPassage:
          (surfaceCloisons / cadenceCloisons) * tarif.tauxHoraire,
      };
    });
    return NextResponse.json(
      {
        success: true,
        data: propositions,
        message: "Données récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    errorHandler(err);
  }
}
