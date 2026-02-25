import "server-only";
import { db } from "@/db";
import {
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePerimetre,
  clientServices,
} from "@/db/schema/services";
import { sitesArborescence } from "@/db/schema/sites";
import { and, eq, gte, inArray, isNull, lte, or, gt } from "drizzle-orm";

type DbOrTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

// ---------------------------------------------------------------------------
// 1. RÉSOLUTION DU PÉRIMÈTRE
// ---------------------------------------------------------------------------

/**
 * Résout le périmètre d'un service client en un tableau de siteIds.
 *
 * Algorithme :
 *   - Collecter les sites "inclure" (avec leur scope self|subtree)
 *   - Collecter les sites "exclure"
 *   - Résultat = inclus MINUS exclus   (l'exclure gagne toujours)
 *   - Si aucune règle "inclure" → défaut = siteId racine du service + tout son sous-arbre
 */
export async function getEffectiveSitesForService({
  clientServiceId,
  entrepriseId,
  rootSiteId,
  tx,
}: {
  clientServiceId: string;
  entrepriseId: string;
  rootSiteId: string;
  tx?: DbOrTransaction;
}): Promise<string[]> {
  const dbClient = tx ?? db;

  const perimetreRows = await dbClient
    .select()
    .from(clientServicePerimetre)
    .where(eq(clientServicePerimetre.clientServiceId, clientServiceId));

  const inclureRows = perimetreRows.filter((r) => r.mode === "inclure");
  const exclureRows = perimetreRows.filter((r) => r.mode === "exclure");

  /**
   * Résout un tableau de lignes de périmètre en un Set de siteIds.
   * scope=self → seulement le site ; scope=subtree → site + tous les descendants.
   */
  async function resolveRows(
    rows: typeof perimetreRows,
  ): Promise<Set<string>> {
    const result = new Set<string>();
    for (const row of rows) {
      result.add(row.siteId);
      if (row.scope === "subtree") {
        const descendants = await dbClient
          .select({ descendantId: sitesArborescence.descendantId })
          .from(sitesArborescence)
          .where(
            and(
              eq(sitesArborescence.entrepriseId, entrepriseId),
              eq(sitesArborescence.ancetreId, row.siteId),
              gt(sitesArborescence.profondeur, 0),
            ),
          );
        descendants.forEach((d) => result.add(d.descendantId));
      }
    }
    return result;
  }

  let includedSiteIds: Set<string>;

  if (inclureRows.length === 0) {
    // Défaut : site racine du contrat + tout son sous-arbre
    includedSiteIds = new Set([rootSiteId]);
    const descendants = await dbClient
      .select({ descendantId: sitesArborescence.descendantId })
      .from(sitesArborescence)
      .where(
        and(
          eq(sitesArborescence.entrepriseId, entrepriseId),
          eq(sitesArborescence.ancetreId, rootSiteId),
          gt(sitesArborescence.profondeur, 0),
        ),
      );
    descendants.forEach((d) => includedSiteIds.add(d.descendantId));
  } else {
    includedSiteIds = await resolveRows(inclureRows);
  }

  if (exclureRows.length > 0) {
    const excludedSiteIds = await resolveRows(exclureRows);
    excludedSiteIds.forEach((id) => includedSiteIds.delete(id));
  }

  return Array.from(includedSiteIds);
}

// ---------------------------------------------------------------------------
// 2. SÉLECTION DE L'EXÉCUTION GAGNANTE
// ---------------------------------------------------------------------------

/**
 * Sélectionne l'exécution gagnante pour un site et une date cible.
 *
 * Algorithme :
 *   1. Récupère tous les ancêtres du siteId (closure table) — couverture subtree implicite
 *   2. Filtre les exécutions : actif=true, validité couvre targetDate, siteId ∈ ancêtres
 *   3. Trie par priorite décroissante → la plus haute gagne
 *   4. Retourne l'id de l'exécution gagnante, ou null si aucune
 */
export async function pickExecutionForOccurrence({
  clientServiceId,
  entrepriseId,
  siteId,
  targetDate,
  tx,
}: {
  clientServiceId: string;
  entrepriseId: string;
  siteId: string;
  targetDate: Date;
  tx?: DbOrTransaction;
}): Promise<string | null> {
  const dbClient = tx ?? db;

  // Récupère tous les ancêtres du site cible (y compris lui-même, profondeur=0)
  const ancestorRows = await dbClient
    .select({ ancetreId: sitesArborescence.ancetreId })
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.entrepriseId, entrepriseId),
        eq(sitesArborescence.descendantId, siteId),
      ),
    );

  const ancestorIds = ancestorRows.map((a) => a.ancetreId);
  if (ancestorIds.length === 0) return null;

  const candidates = await dbClient
    .select({
      id: clientServiceExecutions.id,
      priorite: clientServiceExecutions.priorite,
    })
    .from(clientServiceExecutions)
    .where(
      and(
        eq(clientServiceExecutions.clientServiceId, clientServiceId),
        eq(clientServiceExecutions.actif, true),
        lte(clientServiceExecutions.dateDebutValidite, targetDate),
        or(
          isNull(clientServiceExecutions.dateFinValidite),
          gte(clientServiceExecutions.dateFinValidite, targetDate),
        ),
        inArray(clientServiceExecutions.siteId, ancestorIds),
      ),
    );

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => (b.priorite ?? 0) - (a.priorite ?? 0));
  return candidates[0].id;
}

// ---------------------------------------------------------------------------
// 3. GÉNÉRATION DES DATES D'OCCURRENCES (logique pure, pas de DB)
// ---------------------------------------------------------------------------

type ClientServiceForGen = {
  frequence: string;
  frequenceParPeriode: number | null;
  intervalleJours: number | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  joursPreference: number[] | null;
  heureDebutPreference: string | null;
};

/**
 * Parse "HH:mm" → { hours, minutes }. Défaut : 08:00.
 */
function parseHeure(h: string | null): { hours: number; minutes: number } {
  if (!h) return { hours: 8, minutes: 0 };
  const parts = h.split(":");
  return {
    hours: parseInt(parts[0] ?? "8", 10),
    minutes: parseInt(parts[1] ?? "0", 10),
  };
}

/**
 * Applique l'heure de préférence à une date (sans muter l'original).
 */
function withTime(d: Date, heurePreference: string | null): Date {
  const { hours, minutes } = parseHeure(heurePreference);
  const result = new Date(d);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Calcule le numéro ISO du jour (1=lundi … 7=dimanche) depuis un objet Date.
 */
function isoWeekday(d: Date): number {
  const day = d.getDay(); // 0=dimanche
  return day === 0 ? 7 : day;
}

/**
 * Génère toutes les dates d'occurrences planifiées dans une fenêtre temporelle,
 * en tenant compte de la fréquence, des préférences de jours/heure et des bornes du contrat.
 *
 * Règles générales :
 *   - windowStart/windowEnd = fenêtre cible (ex: now … now+90j)
 *   - dateDebut/dateFin = bornes du contrat
 *   - Génération dans l'intersection des deux intervalles
 *   - heureDebutPreference appliquée sur chaque date
 */
export function generateOccurrenceDates(
  cs: ClientServiceForGen,
  windowStart: Date,
  windowEnd: Date,
): Date[] {
  const contractStart = cs.dateDebut ?? windowStart;
  const contractEnd = cs.dateFin ?? windowEnd;

  const start = new Date(
    Math.max(contractStart.getTime(), windowStart.getTime()),
  );
  const end = new Date(Math.min(contractEnd.getTime(), windowEnd.getTime()));

  if (start > end) return [];

  const dates: Date[] = [];

  switch (cs.frequence) {
    // ------------------------------------------------------------------
    case "one_shot": {
      // Une seule occurrence à la date de début du contrat
      const d = withTime(contractStart, cs.heureDebutPreference);
      if (d >= start && d <= end) {
        dates.push(d);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "tous_les_x_jours": {
      const interval = cs.intervalleJours ?? 1;
      const cursor = new Date(start);
      while (cursor <= end) {
        dates.push(withTime(cursor, cs.heureDebutPreference));
        cursor.setDate(cursor.getDate() + interval);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "hebdomadaire": {
      // frequenceParPeriode fois par semaine
      // joursPreference contient les jours ISO souhaités
      const timesPerWeek = cs.frequenceParPeriode ?? 1;
      let preferredDays: number[];

      if (
        cs.joursPreference &&
        cs.joursPreference.length >= timesPerWeek
      ) {
        preferredDays = cs.joursPreference
          .slice(0, timesPerWeek)
          .sort((a, b) => a - b);
      } else {
        // Défaut : premiers N jours de semaine (lun, mar, …)
        preferredDays = [1, 2, 3, 4, 5].slice(0, timesPerWeek);
      }

      const cursor = new Date(start);
      while (cursor <= end) {
        if (preferredDays.includes(isoWeekday(cursor))) {
          dates.push(withTime(cursor, cs.heureDebutPreference));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "mensuelle": {
      const timesPerMonth = cs.frequenceParPeriode ?? 1;
      // Si joursPreference fourni → traité comme jours du mois (1..31)
      // Sinon distribution uniforme
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

      while (cursor <= end) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let occurrenceDays: number[];
        if (
          cs.joursPreference &&
          cs.joursPreference.length >= timesPerMonth
        ) {
          occurrenceDays = cs.joursPreference
            .slice(0, timesPerMonth)
            .sort((a, b) => a - b);
        } else {
          occurrenceDays = [];
          for (let i = 0; i < timesPerMonth; i++) {
            occurrenceDays.push(
              Math.floor((daysInMonth / timesPerMonth) * i) + 1,
            );
          }
        }

        for (const day of occurrenceDays) {
          const d = withTime(
            new Date(year, month, day),
            cs.heureDebutPreference,
          );
          if (d >= start && d <= end) {
            dates.push(d);
          }
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "trimestrielle": {
      const timesPerQuarter = cs.frequenceParPeriode ?? 1;
      // Normalise au début du trimestre courant
      const startMonth = Math.floor(start.getMonth() / 3) * 3;
      const cursor = new Date(start.getFullYear(), startMonth, 1);

      while (cursor <= end) {
        const qStart = new Date(cursor);
        const qEnd = new Date(
          cursor.getFullYear(),
          cursor.getMonth() + 3,
          0,
          23,
          59,
          59,
        );
        const qDuration = qEnd.getTime() - qStart.getTime();

        for (let i = 0; i < timesPerQuarter; i++) {
          const d = withTime(
            new Date(
              qStart.getTime() + (qDuration / timesPerQuarter) * i,
            ),
            cs.heureDebutPreference,
          );
          if (d >= start && d <= end) {
            dates.push(d);
          }
        }
        cursor.setMonth(cursor.getMonth() + 3);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "semestrielle": {
      const timesPerSemester = cs.frequenceParPeriode ?? 1;
      const startMonth = start.getMonth() < 6 ? 0 : 6;
      const cursor = new Date(start.getFullYear(), startMonth, 1);

      while (cursor <= end) {
        const sStart = new Date(cursor);
        const sEnd = new Date(
          cursor.getFullYear(),
          cursor.getMonth() + 6,
          0,
          23,
          59,
          59,
        );
        const sDuration = sEnd.getTime() - sStart.getTime();

        for (let i = 0; i < timesPerSemester; i++) {
          const d = withTime(
            new Date(
              sStart.getTime() + (sDuration / timesPerSemester) * i,
            ),
            cs.heureDebutPreference,
          );
          if (d >= start && d <= end) {
            dates.push(d);
          }
        }
        cursor.setMonth(cursor.getMonth() + 6);
      }
      break;
    }

    // ------------------------------------------------------------------
    case "annuelle": {
      const timesPerYear = cs.frequenceParPeriode ?? 1;
      const cursor = new Date(start.getFullYear(), 0, 1);

      while (cursor <= end) {
        const yStart = new Date(cursor.getFullYear(), 0, 1);
        const yEnd = new Date(
          cursor.getFullYear(),
          11,
          31,
          23,
          59,
          59,
        );
        const yDuration = yEnd.getTime() - yStart.getTime();

        for (let i = 0; i < timesPerYear; i++) {
          const d = withTime(
            new Date(
              yStart.getTime() + (yDuration / timesPerYear) * i,
            ),
            cs.heureDebutPreference,
          );
          if (d >= start && d <= end) {
            dates.push(d);
          }
        }
        cursor.setFullYear(cursor.getFullYear() + 1);
      }
      break;
    }
  }

  return dates;
}

// ---------------------------------------------------------------------------
// 4. FENÊTRE GLISSANTE — POINT D'ENTRÉE PRINCIPAL
// ---------------------------------------------------------------------------

/**
 * Génère les occurrences manquantes pour un service client dans la fenêtre glissante.
 *
 * Idempotent : ne crée pas de doublon (clé : clientServiceId + siteId + dateDebutPrevue).
 *
 * Règles :
 *   - dateFinPrevue = dateDebutPrevue + dureeEstimeeMinutes si non null, sinon null
 *   - executionId = exécution gagnante au moment de la génération (figée)
 *   - Seules les occurrences status "planifiee" sont générées automatiquement
 */
export async function ensureOccurrencesWindow({
  clientServiceId,
  now,
  daysAhead = 90,
  tx,
}: {
  clientServiceId: string;
  now: Date;
  daysAhead?: number;
  tx?: DbOrTransaction;
}): Promise<{ created: number; skipped: number }> {
  const dbClient = tx ?? db;

  const [cs] = await dbClient
    .select()
    .from(clientServices)
    .where(eq(clientServices.id, clientServiceId));

  if (!cs || !cs.actif) return { created: 0, skipped: 0 };

  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + daysAhead);

  // Résolution du périmètre
  const effectiveSiteIds = await getEffectiveSitesForService({
    clientServiceId,
    entrepriseId: cs.entrepriseId,
    rootSiteId: cs.siteId,
    tx,
  });

  if (effectiveSiteIds.length === 0) return { created: 0, skipped: 0 };

  // Occurrences existantes dans la fenêtre pour construire le Set d'idempotence
  const existing = await dbClient
    .select({
      siteId: clientServiceOccurrences.siteId,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
    })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, clientServiceId),
        inArray(clientServiceOccurrences.siteId, effectiveSiteIds),
        gte(clientServiceOccurrences.dateDebutPrevue, now),
        lte(clientServiceOccurrences.dateDebutPrevue, windowEnd),
      ),
    );

  // Clé d'idempotence : "siteId|ISO8601"
  const existingKeys = new Set(
    existing
      .filter((o) => o.dateDebutPrevue !== null)
      .map((o) => `${o.siteId}|${o.dateDebutPrevue!.toISOString()}`),
  );

  const csForGen: ClientServiceForGen = {
    frequence: cs.frequence,
    frequenceParPeriode: cs.frequenceParPeriode,
    intervalleJours: cs.intervalleJours,
    dateDebut: cs.dateDebut,
    dateFin: cs.dateFin,
    joursPreference: cs.joursPreference as number[] | null,
    heureDebutPreference: cs.heureDebutPreference,
  };

  let created = 0;
  let skipped = 0;

  const toInsert: (typeof clientServiceOccurrences.$inferInsert)[] = [];

  for (const siteId of effectiveSiteIds) {
    const dates = generateOccurrenceDates(csForGen, now, windowEnd);

    for (const dateDebutPrevue of dates) {
      const key = `${siteId}|${dateDebutPrevue.toISOString()}`;

      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      // dateFinPrevue : null si dureeEstimeeMinutes non renseigné (règle métier)
      const dateFinPrevue =
        cs.dureeEstimeeMinutes !== null && cs.dureeEstimeeMinutes !== undefined
          ? new Date(
              dateDebutPrevue.getTime() + cs.dureeEstimeeMinutes * 60 * 1000,
            )
          : null;

      // Exécution gagnante figée au moment de la génération
      const executionId = await pickExecutionForOccurrence({
        clientServiceId,
        entrepriseId: cs.entrepriseId,
        siteId,
        targetDate: dateDebutPrevue,
        tx,
      });

      toInsert.push({
        clientServiceId,
        siteId,
        dateDebutPrevue,
        dateFinPrevue,
        executionId,
        statut: "planifiee",
      });

      // Prévenir les doublons au sein du même batch
      existingKeys.add(key);
      created++;
    }
  }

  if (toInsert.length > 0) {
    await dbClient.insert(clientServiceOccurrences).values(toInsert);
  }

  return { created, skipped };
}

// ---------------------------------------------------------------------------
// 5. RESET + RÉGÉNÉRATION (appelé lors d'une modification de configuration)
// ---------------------------------------------------------------------------

/**
 * À appeler quand la configuration d'un service client change :
 *   - modification du périmètre
 *   - modification ou ajout d'une exécution
 *   - changement de fréquence / dates / durée
 *
 * Supprime toutes les occurrences futures "planifiee" et régénère la fenêtre.
 * Les occurrences déjà "en_cours", "terminee", etc. ne sont pas touchées.
 */
export async function onClientServiceChanged({
  clientServiceId,
  now,
  daysAhead = 90,
}: {
  clientServiceId: string;
  now: Date;
  daysAhead?: number;
}): Promise<{ deleted: number; created: number }> {
  return await db.transaction(async (tx) => {
    // Récupère les IDs des occurrences futures planifiées
    const futurePlanifiees = await tx
      .select({ id: clientServiceOccurrences.id })
      .from(clientServiceOccurrences)
      .where(
        and(
          eq(clientServiceOccurrences.clientServiceId, clientServiceId),
          eq(clientServiceOccurrences.statut, "planifiee"),
          gte(clientServiceOccurrences.dateDebutPrevue, now),
        ),
      );

    if (futurePlanifiees.length > 0) {
      const ids = futurePlanifiees.map((o) => o.id);
      await tx
        .delete(clientServiceOccurrences)
        .where(inArray(clientServiceOccurrences.id, ids));
    }

    const { created } = await ensureOccurrencesWindow({
      clientServiceId,
      now,
      daysAhead,
      tx,
    });

    return { deleted: futurePlanifiees.length, created };
  });
}
