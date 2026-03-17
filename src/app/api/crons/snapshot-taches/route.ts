import { db } from "@/db";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServiceReglesRecurrence,
  occurrenceTaches,
} from "@/db/schema/services";
import { env } from "@/lib/env";
import { snapshotOccurrenceTaches } from "@/server/utils/clientServiceOccurrences.utils";
import { and, count, eq, gte, isNotNull, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * Cron — Snapshot des tâches.
 *
 * Pour chaque occurrence planifiée dont le début est dans les prochaines 8 jours
 * (aligné sur la fenêtre de matérialisation J+7), snapshot les items de la checklist
 * associée (si pas encore fait).
 *
 * Priorité : occurrence.tacheListeTemplateId > regle.tacheListeTemplateId > execution.tacheListeTemplateId
 *
 * Idempotent : si occurrenceTaches existe déjà pour une occurrence, on skip.
 * Aucune occurrence sans executionId ou sans tacheListeTemplateId n'est touchée.
 *
 * Schedule : "0 21 * * *" (UTC) → 22h heure de Paris (hiver)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  // Fenêtre : prochains 8 jours — aligné sur ensureOccurrencesWindow (daysAhead=7)
  const windowEnd = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  const occurrences = await db
    .select({
      id: clientServiceOccurrences.id,
      executionId: clientServiceOccurrences.executionId,
      occurrenceTemplateId: clientServiceOccurrences.tacheListeTemplateId,
      regleTemplateId: clientServiceReglesRecurrence.tacheListeTemplateId,
    })
    .from(clientServiceOccurrences)
    .leftJoin(
      clientServiceReglesRecurrence,
      eq(clientServiceReglesRecurrence.id, clientServiceOccurrences.regleRecurrenceId),
    )
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

    // Idempotence : skip si des tâches issues d'un template existent déjà
    // (les tâches ad-hoc ont listeItemId IS NULL et ne comptent pas)
    const [existing] = await db
      .select({ nb: count() })
      .from(occurrenceTaches)
      .where(and(
        eq(occurrenceTaches.occurrenceId, occ.id),
        isNotNull(occurrenceTaches.listeItemId),
      ));

    if ((existing?.nb ?? 0) > 0) {
      alreadyDone++;
      continue;
    }

    // Priorité : occurrence > regle > execution
    const templateId = occ.occurrenceTemplateId ?? occ.regleTemplateId ?? (await db
      .select({ tacheListeTemplateId: clientServiceExecutions.tacheListeTemplateId })
      .from(clientServiceExecutions)
      .where(eq(clientServiceExecutions.id, occ.executionId))
      .then((rows) => rows[0]?.tacheListeTemplateId ?? null));

    if (!templateId) continue;

    try {
      await snapshotOccurrenceTaches({
        occurrenceId: occ.id,
        tacheListeTemplateId: templateId,
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
