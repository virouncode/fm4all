import { db } from "@/db";
import { clientServices } from "@/db/schema/services";
import { env } from "@/lib/env";
import { ensureOccurrencesWindow } from "@/server/utils/clientServiceOccurrences.utils";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * Cron de réconciliation nightly — Audit historique.
 *
 * Crée les occurrences passées manquantes (ex: cron J+7 qui aurait raté).
 * Utilise ensureOccurrencesWindow sur la fenêtre [now-48h, now] — idempotent.
 *
 * Les occurrences créées ont statut "planifiee" : elles existent pour l'audit
 * et peuvent être marquées manuellement non_honoree si nécessaire.
 *
 * Aucun snapshot de tâches : inutile pour le passé.
 *
 * Schedule : "30 3 * * *" (UTC) → 4h30 heure de Paris (hiver), après le cron J+7
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fenêtre passée : now-48h → now
  // ensureOccurrencesWindow(now=pastStart, daysAhead=2) → [pastStart, pastStart+48h] = [now-48h, now]
  const now = new Date();
  const pastStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);

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
        now: pastStart,
        daysAhead: 2,
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
