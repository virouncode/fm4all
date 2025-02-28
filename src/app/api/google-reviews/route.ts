import { errorHandler } from "@/lib/errorHandler";
import { ApifyClient } from "apify-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { locationUrl } = await req.json();
  if (!locationUrl) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Le paramètre 'locationUrl' est requis.",
        },
      },
      { status: 400 }
    );
  }
  const input = {
    startUrls: [
      {
        url: locationUrl,
      },
    ],
    maxReviews: 100,
    reviewsSort: "newest",
    language: "all",
    reviewsOrigin: "all",
    personalData: true,
  };

  const apiKey = process.env.APIFY_TOKEN;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "La clé API Apify est manquante.",
        },
      },
      { status: 500 }
    );
  }

  const client = new ApifyClient({
    token: apiKey,
  });

  try {
    const run = await client.actor("Xb8osYTtOjlsgI6k9").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return NextResponse.json(
      {
        success: true,
        data: items,
        message: "google reviews récupérées avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    return errorHandler(err);
  }
}
