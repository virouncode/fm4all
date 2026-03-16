import { db } from "@/db";
import { clientServices } from "@/db/schema/services";
import { env } from "@/lib/env";
import { ensureOccurrencesWindow } from "@/server/utils/clientServiceOccurrences.utils";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * Cron J+7 — Matérialisation des occurrences.
 *
 * Parcourt tous les clientServices actifs à récurrence automatique et matérialise
 * les occurrences manquantes dans la fenêtre [now, now+7j].
 *
 * Idempotent : ensureOccurrencesWindow skipe les occurrences déjà existantes
 * (clé unique : regleId | siteId | dateDebutOriginale).
 *
 * Schedule : "0 1 * * *" (UTC) → 2h heure de Paris (hiver)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();

  const activeServices = await db
    .select({ id: clientServices.id })
    .from(clientServices)
    .where(
      and(
        eq(clientServices.statut, "actif"),
        eq(clientServices.famillePlanification, "recurrence_auto"),
      ),
    );

  let totalCreated = 0;
  let totalSkipped = 0;
  let errors = 0;

  for (const cs of activeServices) {
    try {
      const { created, skipped } = await ensureOccurrencesWindow({
        clientServiceId: cs.id,
        now,
        daysAhead: 7,
      });
      totalCreated += created;
      totalSkipped += skipped;
    } catch {
      errors++;
    }
  }

  return Response.json({
    success: true,
    processed: activeServices.length,
    totalCreated,
    totalSkipped,
    errors,
  });
}
