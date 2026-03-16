import { db } from "@/db";
import {
  clientServiceExceptionsRecurrence,
  clientServiceExecutionPrix,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServicePerimetre,
  clientServicePrixAppliques,
  clientServiceReglesRecurrence,
  clientServices,
  occurrenceTaches,
  tacheListeItems,
} from "@/db/schema/services";
import { sitesArborescence } from "@/db/schema/sites";
import type {
  ModeAncragePeriodeType,
  PeriodeQuotaType,
} from "@/zod-schemas/clientServiceReglesRecurrence.schema";
import {
  and,
  asc,
  count,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lte,
  or,
} from "drizzle-orm";
import { rrulestr } from "rrule";
import "server-only";

type DbOrTransactionType =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

// ---------------------------------------------------------------------------
// 0. QUOTA — CALCUL DE LA PÉRIODE COURANTE
// ---------------------------------------------------------------------------

/**
 * Avance une date d'une période (sans muter l'original).
 */
function addPeriod(date: Date, periode: PeriodeQuotaType): Date {
  const d = new Date(date);
  switch (periode) {
    case "semaine":
      d.setDate(d.getDate() + 7);
      break;
    case "mois":
      d.setMonth(d.getMonth() + 1);
      break;
    case "trimestre":
      d.setMonth(d.getMonth() + 3);
      break;
    case "semestre":
      d.setMonth(d.getMonth() + 6);
      break;
    case "annee":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}

/**
 * Calcule les bornes [debut, fin[ de la période quota courante.
 *
 * Mode "contrat" : périodes démarrant depuis dateAncragePeriode, de durée periodeQuota.
 * Mode "civil"   : périodes calées sur le calendrier civil (semaine ISO, mois, trimestre…).
 *
 * @param dateAncragePeriode  Date au format "YYYY-MM-DD"
 * @param periodeQuota        Durée d'une période
 * @param modeAncragePeriode  Ancrage contrat ou civil
 * @param today               Date de référence (défaut : maintenant)
 * @returns { debut, fin } — fin est le dernier milliseconde inclus dans la période
 */
export function computeQuotaPeriode(
  dateAncragePeriode: string,
  periodeQuota: PeriodeQuotaType,
  modeAncragePeriode: ModeAncragePeriodeType,
  today: Date = new Date(),
): { debut: Date; fin: Date } {
  if (modeAncragePeriode === "civil") {
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    switch (periodeQuota) {
      case "semaine": {
        // Semaine ISO : lundi → dimanche
        const day = today.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const debut = new Date(today);
        debut.setDate(today.getDate() + mondayOffset);
        debut.setHours(0, 0, 0, 0);
        const fin = new Date(debut);
        fin.setDate(debut.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        return { debut, fin };
      }
      case "mois": {
        const debut = new Date(year, month, 1, 0, 0, 0, 0);
        const fin = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return { debut, fin };
      }
      case "trimestre": {
        const quarterStart = Math.floor(month / 3) * 3;
        const debut = new Date(year, quarterStart, 1, 0, 0, 0, 0);
        const fin = new Date(year, quarterStart + 3, 0, 23, 59, 59, 999);
        return { debut, fin };
      }
      case "semestre": {
        const semStart = month < 6 ? 0 : 6;
        const debut = new Date(year, semStart, 1, 0, 0, 0, 0);
        const fin = new Date(year, semStart + 6, 0, 23, 59, 59, 999);
        return { debut, fin };
      }
      case "annee": {
        const debut = new Date(year, 0, 1, 0, 0, 0, 0);
        const fin = new Date(year, 11, 31, 23, 59, 59, 999);
        return { debut, fin };
      }
    }
  }

  // Mode "contrat" : itération depuis l'ancrage
  const anchor = new Date(dateAncragePeriode + "T00:00:00");

  // Si today est avant l'ancrage, la première période n'a pas encore commencé
  if (today < anchor) {
    const fin = new Date(addPeriod(anchor, periodeQuota).getTime() - 1);
    return { debut: anchor, fin };
  }

  let periodStart = new Date(anchor);
  let periodEnd = addPeriod(periodStart, periodeQuota);

  while (periodEnd <= today) {
    periodStart = periodEnd;
    periodEnd = addPeriod(periodStart, periodeQuota);
  }

  return { debut: periodStart, fin: new Date(periodEnd.getTime() - 1) };
}

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
  tx?: DbOrTransactionType;
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
  async function resolveRows(rows: typeof perimetreRows): Promise<Set<string>> {
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

  // Filtrer aux feuilles uniquement.
  // Une intervention se fait sur un lieu physique terminal (feuille), jamais sur
  // un nœud intermédiaire (conteneur abstrait type "Siège Paris").
  const allSiteIds = Array.from(includedSiteIds);
  if (allSiteIds.length === 0) return [];

  // Les nœuds ayant au moins un descendant PARMI les sites retenus sont des non-feuilles.
  // Double inArray : ancêtre ET descendant doivent être dans allSiteIds.
  // Ainsi un site sélectionné seul (scope=self) reste une feuille même s'il a des
  // enfants dans l'arbre global.
  const nonLeafRows = await dbClient
    .selectDistinct({ ancetreId: sitesArborescence.ancetreId })
    .from(sitesArborescence)
    .where(
      and(
        eq(sitesArborescence.entrepriseId, entrepriseId),
        inArray(sitesArborescence.ancetreId, allSiteIds),
        inArray(sitesArborescence.descendantId, allSiteIds),
        gt(sitesArborescence.profondeur, 0),
      ),
    );

  const nonLeaves = new Set(nonLeafRows.map((r) => r.ancetreId));
  return allSiteIds.filter((id) => !nonLeaves.has(id));
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
  tx?: DbOrTransactionType;
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
      dateDebutValidite: clientServiceExecutions.dateDebutValidite,
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

  // Tri déterministe : priorité DESC, puis dateDebutValidite DESC (la plus récente gagne en cas d'ex-æquo)
  candidates.sort((a, b) => {
    const pDiff = (b.priorite ?? 0) - (a.priorite ?? 0);
    if (pDiff !== 0) return pDiff;
    return b.dateDebutValidite.getTime() - a.dateDebutValidite.getTime();
  });
  return candidates[0].id;
}

// ---------------------------------------------------------------------------
// 3. GÉNÉRATION DES DATES VIA RRULE
// ---------------------------------------------------------------------------

type GeneratedOccurrenceType = {
  regleRecurrenceId: string;
  dateDebutOriginale: Date;
  dateDebutPrevue: Date;
  dateFinPrevue: Date | null;
};

/**
 * Formate une date JS en chaîne DTSTART compatible rrule : "YYYYMMDDTHHMMSSZ"
 */
function formatDtstartForRrule(date: Date): string {
  return date.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}

/**
 * Génère les occurrences dans une fenêtre temporelle à partir des règles RRULE
 * actives d'un service client.
 *
 * Algorithme :
 *   1. Charge les clientServiceReglesRecurrence actives (triées par ordre)
 *   2. Charge les clientServiceExceptionsRecurrence de type "supprimee"
 *   3. Pour chaque règle : RRule.between(windowStart, windowEnd) → dates
 *   4. Exclut les dates supprimées par une exception
 *   5. dateFinPrevue = dateDebutPrevue + dureePrevueMinutes si non null
 */
async function generateDatesFromRrules(
  clientServiceId: string,
  windowStart: Date,
  windowEnd: Date,
  tx?: DbOrTransactionType,
): Promise<GeneratedOccurrenceType[]> {
  const dbClient = tx ?? db;

  // 1. Règles actives
  const regles = await dbClient
    .select()
    .from(clientServiceReglesRecurrence)
    .where(
      and(
        eq(clientServiceReglesRecurrence.clientServiceId, clientServiceId),
        eq(clientServiceReglesRecurrence.actif, true),
      ),
    )
    .orderBy(asc(clientServiceReglesRecurrence.ordre));

  if (regles.length === 0) return [];

  // 2. Exceptions de type "supprimee" pour ce service
  const exceptions = await dbClient
    .select({
      regleRecurrenceId: clientServiceExceptionsRecurrence.regleRecurrenceId,
      dateOriginale: clientServiceExceptionsRecurrence.dateOriginale,
      typeException: clientServiceExceptionsRecurrence.typeException,
    })
    .from(clientServiceExceptionsRecurrence)
    .where(
      eq(clientServiceExceptionsRecurrence.clientServiceId, clientServiceId),
    );

  // Clé d'exclusion rapide : "regleId|dateISO"
  const suppressedKeys = new Set<string>();
  for (const exc of exceptions) {
    if (exc.typeException === "supprimee" && exc.regleRecurrenceId) {
      suppressedKeys.add(
        `${exc.regleRecurrenceId}|${exc.dateOriginale.toISOString()}`,
      );
    }
  }

  const results: GeneratedOccurrenceType[] = [];

  // 3. Génération par règle
  for (const regle of regles) {
    let rrule: ReturnType<typeof rrulestr>;
    try {
      const fullStr = `DTSTART:${formatDtstartForRrule(regle.dtstartLocal)}\n${regle.regleRrule}`;
      rrule = rrulestr(fullStr);
    } catch {
      // Règle malformée → skip silencieux (le validator UI empêche ça normalement)
      continue;
    }

    const dates = rrule.between(windowStart, windowEnd, true);

    for (const date of dates) {
      const key = `${regle.id}|${date.toISOString()}`;
      if (suppressedKeys.has(key)) continue;

      const dateFinPrevue =
        regle.dureePrevueMinutes !== null &&
        regle.dureePrevueMinutes !== undefined
          ? new Date(date.getTime() + regle.dureePrevueMinutes * 60 * 1000)
          : null;

      results.push({
        regleRecurrenceId: regle.id,
        dateDebutOriginale: date,
        dateDebutPrevue: date,
        dateFinPrevue,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 4. SNAPSHOT DES TÂCHES
// ---------------------------------------------------------------------------

/**
 * Copie les items actifs d'un pack de tâches dans une occurrence (snapshot immuable).
 * Appelé immédiatement après la création de chaque occurrence si un pack est résolu.
 */
export async function snapshotOccurrenceTaches({
  occurrenceId,
  tacheListeTemplateId,
  tx,
}: {
  occurrenceId: string;
  tacheListeTemplateId: string;
  tx?: DbOrTransactionType;
}) {
  const dbClient = tx ?? db;

  const items = await dbClient
    .select()
    .from(tacheListeItems)
    .where(
      and(
        eq(tacheListeItems.listeTemplateId, tacheListeTemplateId),
        eq(tacheListeItems.actif, true),
      ),
    )
    .orderBy(asc(tacheListeItems.ordre));

  if (items.length === 0) return;

  await dbClient.insert(occurrenceTaches).values(
    items.map((item) => ({
      occurrenceId,
      listeItemId: item.id,
      ordre: item.ordre,
      titre: item.titre,
      description: item.description,
      statut: "a_faire" as const,
    })),
  );
}

// ---------------------------------------------------------------------------
// 5. FENÊTRE GLISSANTE — POINT D'ENTRÉE PRINCIPAL
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
  daysAhead = 7,
  tx,
}: {
  clientServiceId: string;
  now: Date;
  daysAhead?: number;
  tx?: DbOrTransactionType;
}): Promise<{ created: number; skipped: number }> {
  const dbClient = tx ?? db;

  const [cs] = await dbClient
    .select()
    .from(clientServices)
    .where(eq(clientServices.id, clientServiceId));

  // Génération uniquement si actif + recurrence_auto
  if (
    !cs ||
    cs.statut !== "actif" ||
    cs.famillePlanification !== "recurrence_auto"
  ) {
    return { created: 0, skipped: 0 };
  }

  // Borne basse : max(now, prestation.dateDebut) — ne génère pas avant le début contractuel
  const windowStart =
    cs.dateDebut && cs.dateDebut > now ? cs.dateDebut : new Date(now);

  // Borne haute : min(now+daysAhead, prestation.dateFin) — ne génère pas après la fin contractuelle
  const rawWindowEnd = new Date(now);
  rawWindowEnd.setDate(rawWindowEnd.getDate() + daysAhead);
  const windowEnd =
    cs.dateFin && cs.dateFin < rawWindowEnd ? cs.dateFin : rawWindowEnd;

  // Fenêtre vide → rien à générer
  if (windowStart >= windowEnd) return { created: 0, skipped: 0 };

  // Résolution du périmètre
  const effectiveSiteIds = await getEffectiveSitesForService({
    clientServiceId,
    entrepriseId: cs.entrepriseId,
    rootSiteId: cs.siteId,
    tx,
  });

  if (effectiveSiteIds.length === 0) return { created: 0, skipped: 0 };

  // Génération des dates depuis les règles RRULE (fenêtre bornée par dateDebut/dateFin)
  const generated = await generateDatesFromRrules(
    clientServiceId,
    windowStart,
    windowEnd,
    tx,
  );

  if (generated.length === 0) return { created: 0, skipped: 0 };

  // Occurrences existantes issues d'une règle dans la fenêtre (clé d'idempotence)
  const existing = await dbClient
    .select({
      regleRecurrenceId: clientServiceOccurrences.regleRecurrenceId,
      siteId: clientServiceOccurrences.siteId,
      dateDebutOriginale: clientServiceOccurrences.dateDebutOriginale,
    })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, clientServiceId),
        eq(clientServiceOccurrences.typeSource, "regle_recurrence"),
        inArray(clientServiceOccurrences.siteId, effectiveSiteIds),
        gte(clientServiceOccurrences.dateDebutOriginale, windowStart),
        lte(clientServiceOccurrences.dateDebutOriginale, windowEnd),
      ),
    );

  // Clé d'idempotence : "regleId|siteId|dateOriginaleISO"
  const existingKeys = new Set(
    existing
      .filter((o) => o.regleRecurrenceId && o.dateDebutOriginale)
      .map(
        (o) =>
          `${o.regleRecurrenceId}|${o.siteId}|${o.dateDebutOriginale!.toISOString()}`,
      ),
  );

  let created = 0;
  let skipped = 0;

  const toInsert: (typeof clientServiceOccurrences.$inferInsert)[] = [];

  for (const siteId of effectiveSiteIds) {
    for (const gen of generated) {
      const key = `${gen.regleRecurrenceId}|${siteId}|${gen.dateDebutOriginale.toISOString()}`;

      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      // Exécution gagnante résolue à la génération (optimiste — gel définitif au passage → en_cours)
      const executionId = await pickExecutionForOccurrence({
        clientServiceId,
        entrepriseId: cs.entrepriseId,
        siteId,
        targetDate: gen.dateDebutPrevue,
        tx,
      });

      // Aucune exécution active → occurrence orpheline → skip
      if (executionId === null) continue;

      toInsert.push({
        clientServiceId,
        siteId,
        typeSource: "regle_recurrence",
        regleRecurrenceId: gen.regleRecurrenceId,
        dateDebutOriginale: gen.dateDebutOriginale,
        dateDebutPrevue: gen.dateDebutPrevue,
        dateFinPrevue: gen.dateFinPrevue,
        executionId,
        statut: "planifiee",
      });

      existingKeys.add(key);
      created++;
    }
  }

  // Tâches NON snapshotées ici — snapshot réservé au cron J-1 ou au passage → en_cours
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
  daysAhead = 7,
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

// ---------------------------------------------------------------------------
// 6. BACKFILL — Assigne une exécution aux occurrences non assignées
// ---------------------------------------------------------------------------

/**
 * Parcourt les occurrences futures planifiées sans exécution (executionId = null)
 * et tente de leur assigner une exécution gagnante.
 *
 * À appeler après l'ajout ou l'activation d'une exécution.
 * N'est utile que si statut = actif + modePlanning = planifie.
 */
export async function backfillOccurrencesWithExecution({
  clientServiceId,
  now,
  tx,
}: {
  clientServiceId: string;
  now: Date;
  tx?: DbOrTransactionType;
}): Promise<{ updated: number }> {
  const dbClient = tx ?? db;

  const [cs] = await dbClient
    .select()
    .from(clientServices)
    .where(eq(clientServices.id, clientServiceId));

  if (
    !cs ||
    cs.statut !== "actif" ||
    cs.famillePlanification !== "recurrence_auto"
  ) {
    return { updated: 0 };
  }

  // Récupère les occurrences futures planifiées sans exécution
  const unassigned = await dbClient
    .select({
      id: clientServiceOccurrences.id,
      siteId: clientServiceOccurrences.siteId,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
    })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, clientServiceId),
        eq(clientServiceOccurrences.statut, "planifiee"),
        isNull(clientServiceOccurrences.executionId),
        gte(clientServiceOccurrences.dateDebutPrevue, now),
      ),
    );

  let updated = 0;

  for (const occ of unassigned) {
    if (!occ.dateDebutPrevue) continue;

    const executionId = await pickExecutionForOccurrence({
      clientServiceId,
      entrepriseId: cs.entrepriseId,
      siteId: occ.siteId,
      targetDate: occ.dateDebutPrevue,
      tx,
    });

    if (executionId) {
      await dbClient
        .update(clientServiceOccurrences)
        .set({ executionId })
        .where(eq(clientServiceOccurrences.id, occ.id));
      updated++;
    }
  }

  return { updated };
}

// ---------------------------------------------------------------------------
// 7. TRANSITIONS STATUT PRESTATION — Nettoyage des occurrences
// ---------------------------------------------------------------------------

/**
 * actif → en_pause :
 * Supprime les occurrences futures planifiées.
 * Elles seront régénérées automatiquement au retour à actif (onClientServiceChanged).
 */
export async function deleteFuturePlanifieeOccurrences({
  clientServiceId,
  now,
  tx,
}: {
  clientServiceId: string;
  now: Date;
  tx?: DbOrTransactionType;
}): Promise<{ deleted: number }> {
  const dbClient = tx ?? db;

  const toDelete = await dbClient
    .select({ id: clientServiceOccurrences.id })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, clientServiceId),
        eq(clientServiceOccurrences.statut, "planifiee"),
        gte(clientServiceOccurrences.dateDebutPrevue, now),
      ),
    );

  if (toDelete.length > 0) {
    await dbClient.delete(clientServiceOccurrences).where(
      inArray(
        clientServiceOccurrences.id,
        toDelete.map((o) => o.id),
      ),
    );
  }

  return { deleted: toDelete.length };
}

/**
 * actif/en_pause → termine :
 * Annule les occurrences futures planifiées (statut → annulee).
 * Conserve l'historique pour audit et analytics.
 */
export async function cancelFuturePlanifieeOccurrences({
  clientServiceId,
  now,
  tx,
}: {
  clientServiceId: string;
  now: Date;
  tx?: DbOrTransactionType;
}): Promise<{ cancelled: number }> {
  const dbClient = tx ?? db;

  const toCancel = await dbClient
    .select({ id: clientServiceOccurrences.id })
    .from(clientServiceOccurrences)
    .where(
      and(
        eq(clientServiceOccurrences.clientServiceId, clientServiceId),
        eq(clientServiceOccurrences.statut, "planifiee"),
        gte(clientServiceOccurrences.dateDebutPrevue, now),
      ),
    );

  if (toCancel.length > 0) {
    await dbClient
      .update(clientServiceOccurrences)
      .set({ statut: "annulee", updatedAt: new Date() })
      .where(
        inArray(
          clientServiceOccurrences.id,
          toCancel.map((o) => o.id),
        ),
      );
  }

  return { cancelled: toCancel.length };
}

// ---------------------------------------------------------------------------
// 6. SNAPSHOT PRIX APPLIQUÉS — Facturation
// ---------------------------------------------------------------------------

/**
 * Calcule les bornes de la période d'abonnement selon la périodicité de facturation.
 */
function toISODate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function calculateSubscriptionPeriod(
  refDate: Date,
  periodeFacturation: "semaine" | "mois" | "annee",
): { periodeStart: string; periodeEnd: string } {
  const d = new Date(refDate);

  if (periodeFacturation === "semaine") {
    // Semaine ISO : lundi → dimanche
    const dow = d.getDay(); // 0=dim, 1=lun, ..., 6=sam
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { periodeStart: toISODate(monday), periodeEnd: toISODate(sunday) };
  }

  if (periodeFacturation === "mois") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { periodeStart: toISODate(start), periodeEnd: toISODate(end) };
  }

  // annee
  const start = new Date(d.getFullYear(), 0, 1);
  const end = new Date(d.getFullYear(), 11, 31);
  return { periodeStart: toISODate(start), periodeEnd: toISODate(end) };
}

/**
 * Insère les lignes de prix appliqués pour une occurrence qui vient d'être clôturée.
 *
 * Règles :
 *   - par_occurrence / frais_livraison : 1 ligne par occurrence (onConflictDoNothing)
 *   - abonnement : 1 ligne par période (onConflictDoNothing → pas de double-facturation)
 *   - installation : 1 ligne unique toute la vie de l'exécution (skip si déjà présent)
 *
 * Appelée dans updateOccurrenceStatutAction lorsque newStatut === "terminee".
 */
export async function insertPrixAppliquesForOccurrence({
  occurrenceId,
  tx,
}: {
  occurrenceId: string;
  tx?: DbOrTransactionType;
}): Promise<void> {
  const dbClient = tx ?? db;

  // 1. Charger l'occurrence
  const [occurrence] = await dbClient
    .select({
      id: clientServiceOccurrences.id,
      clientServiceId: clientServiceOccurrences.clientServiceId,
      executionId: clientServiceOccurrences.executionId,
      dateDebutReelle: clientServiceOccurrences.dateDebutReelle,
      dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
    })
    .from(clientServiceOccurrences)
    .where(eq(clientServiceOccurrences.id, occurrenceId))
    .limit(1);

  // Si aucune exécution assignée, rien à facturer
  if (!occurrence || !occurrence.executionId) return;

  // Date de référence pour la période
  const refDate = occurrence.dateDebutReelle ?? occurrence.dateDebutPrevue;
  if (!refDate) return;

  // 2. Récupérer les prix actifs de l'exécution
  const prixActifs = await dbClient
    .select()
    .from(clientServiceExecutionPrix)
    .where(
      and(
        eq(clientServiceExecutionPrix.executionId, occurrence.executionId),
        eq(clientServiceExecutionPrix.actif, true),
      ),
    );

  if (prixActifs.length === 0) return;

  // 3. Insérer une ligne par prix selon la règle
  for (const prix of prixActifs) {
    if (
      prix.typePrix === "par_occurrence" ||
      prix.typePrix === "frais_livraison"
    ) {
      // 1 ligne par occurrence — anti-doublon via unique(executionPrixId, occurrenceId)
      await dbClient
        .insert(clientServicePrixAppliques)
        .values({
          executionPrixId: prix.id,
          clientServiceId: occurrence.clientServiceId,
          executionId: occurrence.executionId,
          occurrenceId: occurrence.id,
          typePrix: prix.typePrix,
          montantHtSnapshot: prix.montantHt,
          coutPrestataireHtSnapshot: prix.coutPrestataireHt,
          margePourcentSnapshot: prix.margePourcent,
        })
        .onConflictDoNothing();
    } else if (prix.typePrix === "abonnement" && prix.periodeFacturation) {
      // 1 ligne par période — anti-doublon via unique(executionPrixId, periodeStart)
      const { periodeStart, periodeEnd } = calculateSubscriptionPeriod(
        refDate,
        prix.periodeFacturation,
      );

      await dbClient
        .insert(clientServicePrixAppliques)
        .values({
          executionPrixId: prix.id,
          clientServiceId: occurrence.clientServiceId,
          executionId: occurrence.executionId,
          occurrenceId: null, // abonnement n'est pas lié à 1 occurrence précise
          typePrix: prix.typePrix,
          montantHtSnapshot: prix.montantHt,
          coutPrestataireHtSnapshot: prix.coutPrestataireHt,
          margePourcentSnapshot: prix.margePourcent,
          periodeStart: periodeStart,
          periodeEnd: periodeEnd,
        })
        .onConflictDoNothing();
    } else if (prix.typePrix === "installation") {
      // 1 seule ligne toute la vie — vérifier si déjà une ligne pour ce prix
      const [existing] = await dbClient
        .select({ nb: count() })
        .from(clientServicePrixAppliques)
        .where(eq(clientServicePrixAppliques.executionPrixId, prix.id));

      if ((existing?.nb ?? 0) === 0) {
        await dbClient
          .insert(clientServicePrixAppliques)
          .values({
            executionPrixId: prix.id,
            clientServiceId: occurrence.clientServiceId,
            executionId: occurrence.executionId,
            occurrenceId: occurrence.id,
            typePrix: prix.typePrix,
            montantHtSnapshot: prix.montantHt,
            coutPrestataireHtSnapshot: prix.coutPrestataireHt,
            margePourcentSnapshot: prix.margePourcent,
          })
          .onConflictDoNothing();
      }
    }
  }
}
