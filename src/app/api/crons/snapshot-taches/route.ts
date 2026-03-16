import { db } from "@/db";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  occurrenceTaches,
} from "@/db/schema/services";
import { env } from "@/lib/env";
import { snapshotOccurrenceTaches } from "@/server/utils/clientServiceOccurrences.utils";
import { and, count, eq, gte, isNotNull, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * Cron J-1 — Snapshot des tâches.
 *
 * Pour chaque occurrence planifiée dont le début est dans les prochaines 24h,
 * snapshot les items de la checklist associée (si pas encore fait).
 *
 * Idempotent : si occurrenceTaches existe déjà pour une occurrence, on skip.
 * Aucune occurrence sans executionId ou sans tacheListeTemplateId n'est touchée.
 *
 * Schedule : "0 21 * * *" (UTC) → 22h heure de Paris (hiver) = J-1 pour le lendemain
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  // Fenêtre : prochaines 24h (couvre toutes les occurrences de demain quelle que soit la timezone)
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const occurrences = await db
    .select({
      id: clientServiceOccurrences.id,
      executionId: clientServiceOccurrences.executionId,
    })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.statut, "planifiee"),
        isNotNull(clientServiceOccurrences.executionId),
        gte(clientServiceOccurrences.dateDebutPrevue, now),
        lt(clientServiceOccurrences.dateDebutPrevue, windowEnd),
      ),
    );

  let snapshotted = 0;
  let alreadyDone = 0;
  let errors = 0;

  for (const occ of occurrences) {
    if (!occ.executionId) continue;

    // Idempotence : skip si tâches déjà snapshotées pour cette occurrence
    const [existing] = await db
      .select({ nb: count() })
      .from(occurrenceTaches)
      .where(eq(occurrenceTaches.occurrenceId, occ.id));

    if ((existing?.nb ?? 0) > 0) {
      alreadyDone++;
      continue;
    }

    const [execution] = await db
      .select({ tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId })
      .from(clientServiceExecutions)
      .where(eq(clientServiceExecutions.id, occ.executionId));

    if (!execution?.tacheListeTemplateId) continue;

    try {
      await snapshotOccurrenceTaches({
        occurrenceId: occ.id,
        tacheListeTemplateId: execution.tacheListeTemplateId,
      });
      snapshotted++;
    } catch {
      errors++;
    }
  }

  return Response.json({
    success: true,
    processed: occurrences.length,
    snapshotted,
    alreadyDone,
    errors,
  });
}
