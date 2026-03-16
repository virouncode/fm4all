"use server";

import { db } from "@/db";
import { entreprises, serviceEntreprises } from "@/db/schema/entreprises";
import {
  clientServiceExceptionsRecurrence,
  clientServiceExecutions,
  clientServiceOccurrences,
  clientServiceReglesRecurrence,
  clientServices,
  services,
} from "@/db/schema/services";
import { sites } from "@/db/schema/sites";
import { userPrestataireSiteAttributions } from "@/db/schema/users";
import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getSession } from "@/server/auth/get-session";
import { getClientPrestataires, getMesClients } from "@/server/queries/clientServiceExecutions.query";
import { getEntreprisesClientes } from "@/server/queries/entreprises.query";
import {
  getAccessibleSitesByUser,
  getSitesByEntrepriseId,
} from "@/server/queries/sites.query";
import {
  getUserClientAdhesion,
  getUserPrestataireAdhesion,
  hasAccessToEntreprise,
} from "@/server/queries/userAdhesions.query";
import { getActivePosture } from "@/server/utils/permissions.utils";
import { and, asc, eq, gte, inArray, isNotNull, lte } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { rrulestr } from "rrule";
import { z } from "zod";

// ==================== TYPES ====================

export type CalendarEventItemType = {
  id: string;
  title: string;
  start: string;
  end?: string;
  color: string;
  extendedProps: {
    type: "virtual" | "materialized";
    occurrenceId?: string;
    statut?: string;
    regleId?: string;
    prestationId: string;
    serviceNom: string;
    siteNom?: string;
    famillePlanification: string;
    dateDebutOriginale?: string;
  };
};

export type SiteParClientType = {
  clientId: string;
  clientNom: string;
  sites: { id: string; nom: string }[];
};

export type CalendarFilterOptionsType = {
  sites: { id: string; nom: string }[];
  /** Sites groupés par client — peuplé pour posture prestataire/plateforme */
  sitesParClient: SiteParClientType[];
  services: { id: string; nom: string }[];
  /** Vide pour posture prestataire */
  prestataires: { id: string; nom: string }[];
  clients: { id: string; nom: string }[];
  /** IDs des sites pré-sélectionnés au chargement */
  defaultSiteIds: string[];
  /** true si l'utilisateur est admin dans son entreprise pour cette posture */
  isAdmin: boolean;
};

// ==================== CONSTANTS ====================

const OCCURRENCE_STATUT_COLORS: Record<string, string> = {
  planifiee: "#94a3b8",
  en_cours: "#3b82f6",
  terminee: "#22c55e",
  non_honoree: "#ef4444",
  annulee: "#d1d5db",
  non_applicable: "#d1d5db",
};

const VIRTUAL_COLOR = "#6366f1";

// ==================== HELPERS ====================

function formatDtstartForRrule(date: Date): string {
  return date.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}

// ==================== SCHEMAS ====================

const getCalendarEventsSchema = z.object({
  start: z.string().min(1, "Date de début requise"),
  end: z.string().min(1, "Date de fin requise"),
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
  siteIds: z.array(z.uuid()).optional(),
  serviceIds: z.array(z.uuid()).optional(),
  /** Filtre sur les entreprises prestataires — pertinent seulement en posture client/plateforme */
  prestataireIds: z.array(z.uuid()).optional(),
  /** Filtre sur les clients — pertinent seulement en posture prestataire */
  clientIds: z.array(z.uuid()).optional(),
});

const getCalendarFilterOptionsSchema = z.object({
  entrepriseId: z.uuid("ID de l'entreprise invalide"),
});

const getCalendarSitesForFilterSchema = z.object({
  /** IDs des entreprises clientes dont on veut les sites */
  clientEntrepriseIds: z.array(z.uuid()).min(1),
});

// ==================== ACTION: FILTER OPTIONS ====================

/**
 * Retourne les options disponibles pour les filtres du calendrier.
 *
 * - sites     : périmètre de l'utilisateur selon posture/rôle (via fonctions existantes)
 * - services  : services contractés visibles pour cette posture
 * - prestataires : entreprises prestataires actives (client/plateforme → getClientPrestataires)
 * - clients   : entreprises clientes liées (prestataire → getMesClients)
 * - defaultSiteIds : pré-sélection = tous les sites disponibles (sauf plateforme)
 * - isAdmin   : true si l'utilisateur est admin dans son entreprise pour cette posture
 */
export const getCalendarFilterOptionsAction = actionClient
  .metadata({ actionName: "getCalendarFilterOptionsAction" })
  .inputSchema(getCalendarFilterOptionsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const hasAccess = await hasAccessToEntreprise(
      session.user.id,
      parsedInput.entrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé à cette entreprise.");

    const posture = await getActivePosture();
    const userId = session.user.id;

    // ── isAdmin ────────────────────────────────────────────────────────────
    let isAdmin = false;
    if (posture === "plateforme") {
      isAdmin = true;
    } else if (posture === "client") {
      const adhesion = await getUserClientAdhesion({
        userId,
        entrepriseId: parsedInput.entrepriseId,
      });
      isAdmin = adhesion?.role === "admin";
    } else {
      const adhesion = await getUserPrestataireAdhesion({ userId });
      isAdmin = adhesion?.role === "admin";
    }

    // ── Sites ──────────────────────────────────────────────────────────────
    // Client      : getAccessibleSitesByUser (admin → tous, non-admin → attribués + sous-sites)
    // Plateforme  : vide initialement — chargé dynamiquement à la sélection de clients
    // Prestataire admin    : tous les sites client où il a des exécutions actives, groupés par client
    // Prestataire non-admin : ses sites attribués uniquement, groupés par client

    let sitesRows: { id: string; nom: string }[];
    let sitesParClient: SiteParClientType[] = [];

    if (posture === "client") {
      const siteList = await getAccessibleSitesByUser({
        userId,
        entrepriseId: parsedInput.entrepriseId,
      });
      sitesRows = siteList.map((s) => ({ id: s.id, nom: s.nom }));
    } else if (posture === "plateforme") {
      // Pas de sites initiaux — chargés dynamiquement quand des clients sont sélectionnés
      sitesRows = [];
    } else if (isAdmin) {
      // Prestataire admin : tous les sites client où il a des exécutions actives
      const rows = await db
        .selectDistinct({
          id: sites.id,
          nom: sites.nom,
          clientEntrepriseId: clientServices.entrepriseId,
          clientNom: entreprises.nom,
        })
        .from(clientServices)
        .innerJoin(sites, eq(sites.id, clientServices.siteId))
        .innerJoin(entreprises, eq(entreprises.id, clientServices.entrepriseId))
        .innerJoin(
          clientServiceExecutions,
          and(
            eq(clientServiceExecutions.clientServiceId, clientServices.id),
            eq(clientServiceExecutions.actif, true),
          ),
        )
        .innerJoin(
          serviceEntreprises,
          eq(
            serviceEntreprises.id,
            clientServiceExecutions.serviceEntrepriseId,
          ),
        )
        .where(
          and(
            eq(serviceEntreprises.entrepriseId, parsedInput.entrepriseId),
            eq(clientServices.statut, "actif"),
          ),
        )
        .orderBy(asc(entreprises.nom), asc(sites.nom));
      sitesRows = rows.map((r) => ({ id: r.id, nom: r.nom }));
      // Grouper par client
      const grouped = new Map<string, SiteParClientType>();
      for (const row of rows) {
        if (!grouped.has(row.clientEntrepriseId)) {
          grouped.set(row.clientEntrepriseId, {
            clientId: row.clientEntrepriseId,
            clientNom: row.clientNom,
            sites: [],
          });
        }
        grouped.get(row.clientEntrepriseId)!.sites.push({ id: row.id, nom: row.nom });
      }
      sitesParClient = Array.from(grouped.values());
    } else {
      // Prestataire non-admin : sites attribués uniquement (toutes entreprises clientes)
      const rows = await db
        .selectDistinct({
          id: sites.id,
          nom: sites.nom,
          clientEntrepriseId: sites.entrepriseId,
          clientNom: entreprises.nom,
        })
        .from(userPrestataireSiteAttributions)
        .innerJoin(sites, eq(sites.id, userPrestataireSiteAttributions.siteId))
        .innerJoin(entreprises, eq(entreprises.id, sites.entrepriseId))
        .where(eq(userPrestataireSiteAttributions.userId, userId))
        .orderBy(asc(entreprises.nom), asc(sites.nom));
      sitesRows = rows.map((r) => ({ id: r.id, nom: r.nom }));
      // Grouper par client
      const grouped = new Map<string, SiteParClientType>();
      for (const row of rows) {
        if (!grouped.has(row.clientEntrepriseId)) {
          grouped.set(row.clientEntrepriseId, {
            clientId: row.clientEntrepriseId,
            clientNom: row.clientNom,
            sites: [],
          });
        }
        grouped.get(row.clientEntrepriseId)!.sites.push({ id: row.id, nom: row.nom });
      }
      sitesParClient = Array.from(grouped.values());
    }

    // ── Services ───────────────────────────────────────────────────────────
    // Client      : services des prestations actives de l'entreprise
    // Prestataire : services des prestations où il a une exécution active
    // Plateforme  : tous les services du catalogue

    let servicesRows: { id: string; nom: string }[];

    if (posture === "client") {
      servicesRows = await db
        .selectDistinct({ id: services.id, nom: services.nom })
        .from(clientServices)
        .innerJoin(services, eq(services.id, clientServices.serviceId))
        .where(
          and(
            eq(clientServices.entrepriseId, parsedInput.entrepriseId),
            eq(clientServices.statut, "actif"),
          ),
        )
        .orderBy(asc(services.nom));
    } else if (posture === "prestataire") {
      // Services proposés par le prestataire (catalogue direct via serviceEntreprises)
      servicesRows = await db
        .selectDistinct({ id: services.id, nom: services.nom })
        .from(serviceEntreprises)
        .innerJoin(services, eq(services.id, serviceEntreprises.serviceId))
        .where(
          and(
            eq(serviceEntreprises.entrepriseId, parsedInput.entrepriseId),
            eq(serviceEntreprises.actif, true),
          ),
        )
        .orderBy(asc(services.nom));
    } else {
      // Plateforme : tous les services du catalogue
      servicesRows = await db
        .select({ id: services.id, nom: services.nom })
        .from(services)
        .orderBy(asc(services.nom));
    }

    // ── Prestataires (client/plateforme uniquement) ────────────────────────
    // Utilise getClientPrestataires qui retourne les prestataires avec exécutions actives

    const prestatairesRows: { id: string; nom: string }[] =
      posture !== "prestataire"
        ? await getClientPrestataires(parsedInput.entrepriseId)
        : [];

    // ── Clients (prestataire + plateforme) ────────────────────────────────
    // Prestataire → ses clients (via exécutions/relations)
    // Plateforme  → toutes les entreprises clientes

    let clientsRows: { id: string; nom: string }[] = [];
    if (posture === "prestataire") {
      const mesClients = await getMesClients(parsedInput.entrepriseId);
      clientsRows = mesClients.map((c) => ({ id: c.id, nom: c.nom }));
    } else if (posture === "plateforme") {
      clientsRows = await getEntreprisesClientes();
    }

    // ── DefaultSiteIds ────────────────────────────────────────────────────
    // Plateforme → pas de pré-sélection (voit tout sans filtre par défaut)
    // Client + Prestataire → pré-sélectionner tout le périmètre disponible

    const defaultSiteIds =
      posture !== "plateforme" ? sitesRows.map((s) => s.id) : [];

    return {
      sites: sitesRows,
      sitesParClient,
      services: servicesRows,
      prestataires: prestatairesRows,
      clients: clientsRows,
      defaultSiteIds,
      isAdmin,
    } satisfies CalendarFilterOptionsType;
  });

// ==================== ACTION: SITES FOR FILTER (DYNAMIC) ====================

/**
 * Retourne les sites d'une ou plusieurs entreprises clientes, groupés par client.
 * Utilisé pour le rechargement dynamique des sites quand la sélection de clients change.
 * - Prestataire non-admin : uniquement ses sites attribués parmi les sites des clients
 * - Prestataire admin / Plateforme : tous les sites des clients sélectionnés
 */
export const getCalendarSitesForFilterAction = actionClient
  .metadata({ actionName: "getCalendarSitesForFilterAction" })
  .inputSchema(getCalendarSitesForFilterSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const posture = await getActivePosture();
    const userId = session.user.id;

    // Noms des entreprises clientes
    const clientEntreprises = await db
      .select({ id: entreprises.id, nom: entreprises.nom })
      .from(entreprises)
      .where(inArray(entreprises.id, parsedInput.clientEntrepriseIds));

    let sitesParClient: SiteParClientType[];

    if (posture === "prestataire") {
      const adhesion = await getUserPrestataireAdhesion({ userId });
      const isAdmin = adhesion?.role === "admin";

      if (!isAdmin) {
        // Non-admin : uniquement les sites attribués parmi ceux des clients sélectionnés
        const rows = await db
          .selectDistinct({
            id: sites.id,
            nom: sites.nom,
            clientEntrepriseId: sites.entrepriseId,
          })
          .from(userPrestataireSiteAttributions)
          .innerJoin(sites, eq(sites.id, userPrestataireSiteAttributions.siteId))
          .where(
            and(
              eq(userPrestataireSiteAttributions.userId, userId),
              inArray(sites.entrepriseId, parsedInput.clientEntrepriseIds),
            ),
          )
          .orderBy(asc(sites.nom));

        sitesParClient = parsedInput.clientEntrepriseIds
          .map((clientId) => ({
            clientId,
            clientNom:
              clientEntreprises.find((c) => c.id === clientId)?.nom ?? clientId,
            sites: rows
              .filter((r) => r.clientEntrepriseId === clientId)
              .map((r) => ({ id: r.id, nom: r.nom })),
          }))
          .filter((g) => g.sites.length > 0);
      } else {
        // Admin : tous les sites des clients sélectionnés
        const results = await Promise.all(
          parsedInput.clientEntrepriseIds.map(async (clientId) => ({
            clientId,
            clientNom:
              clientEntreprises.find((c) => c.id === clientId)?.nom ?? clientId,
            sites: (await getSitesByEntrepriseId(clientId)).map((s) => ({
              id: s.id,
              nom: s.nom,
            })),
          })),
        );
        sitesParClient = results.filter((g) => g.sites.length > 0);
      }
    } else {
      // Plateforme : tous les sites des clients sélectionnés
      const results = await Promise.all(
        parsedInput.clientEntrepriseIds.map(async (clientId) => ({
          clientId,
          clientNom:
            clientEntreprises.find((c) => c.id === clientId)?.nom ?? clientId,
          sites: (await getSitesByEntrepriseId(clientId)).map((s) => ({
            id: s.id,
            nom: s.nom,
          })),
        })),
      );
      sitesParClient = results.filter((g) => g.sites.length > 0);
    }

    return { sitesParClient };
  });

// ==================== ACTION: CALENDAR EVENTS ====================

/**
 * Retourne les événements FullCalendar pour la fenêtre demandée.
 *
 * Fusion de deux sources :
 *   1. Occurrences matérialisées (DB) — prioritaires, statut réel
 *   2. Occurrences virtuelles calculées depuis les RRULE actives —
 *      affichées uniquement pour les dates sans occurrence matérialisée
 *
 * Filtres optionnels : siteIds, serviceIds, prestataireIds (client/plateforme),
 *   clientIds (prestataire).
 * Si siteIds est non vide, les events virtuels sont masqués (pas de site sur les règles).
 *
 * Posture-aware :
 *   - client / plateforme : toutes les prestations actives de l'entreprise
 *   - prestataire : prestations où le prestataire a une exécution active
 */
export const getCalendarEventsAction = actionClient
  .metadata({ actionName: "getCalendarEventsAction" })
  .inputSchema(getCalendarEventsSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) throw errors.unauthorized();

    const hasAccess = await hasAccessToEntreprise(
      session.user.id,
      parsedInput.entrepriseId,
    );
    if (!hasAccess) throw errors.forbidden("Accès refusé à cette entreprise.");

    const windowStart = new Date(parsedInput.start);
    const windowEnd = new Date(parsedInput.end);
    const posture = await getActivePosture();

    const hasSiteFilter = !!parsedInput.siteIds?.length;
    const hasServiceFilter = !!parsedInput.serviceIds?.length;
    const hasPrestataireFilter = !!parsedInput.prestataireIds?.length;
    const hasClientFilter = !!parsedInput.clientIds?.length;

    // ── 1. Prestations actives (posture-aware) ──────────────────────────────

    type PrestationRowType = {
      id: string;
      entrepriseId: string;
      famillePlanification: string;
      serviceNom: string;
      siteNom: string;
    };

    const prestationColumns = {
      id: clientServices.id,
      entrepriseId: clientServices.entrepriseId,
      famillePlanification: clientServices.famillePlanification,
      serviceNom: services.nom,
      siteNom: sites.nom,
    };

    let prestations: PrestationRowType[];

    if (posture === "prestataire") {
      prestations = await db
        .selectDistinct(prestationColumns)
        .from(clientServices)
        .innerJoin(services, eq(services.id, clientServices.serviceId))
        .innerJoin(sites, eq(sites.id, clientServices.siteId))
        .innerJoin(
          clientServiceExecutions,
          eq(clientServiceExecutions.clientServiceId, clientServices.id),
        )
        .innerJoin(
          serviceEntreprises,
          eq(
            serviceEntreprises.id,
            clientServiceExecutions.serviceEntrepriseId,
          ),
        )
        .where(
          and(
            eq(serviceEntreprises.entrepriseId, parsedInput.entrepriseId),
            eq(clientServices.statut, "actif"),
            eq(clientServiceExecutions.actif, true),
            isNotNull(clientServiceExecutions.serviceEntrepriseId),
            hasServiceFilter
              ? inArray(clientServices.serviceId, parsedInput.serviceIds!)
              : undefined,
            hasClientFilter
              ? inArray(clientServices.entrepriseId, parsedInput.clientIds!)
              : undefined,
          ),
        );
    } else if (hasPrestataireFilter) {
      // Client/plateforme avec filtre prestataire → JOIN exécutions nécessaire
      prestations = await db
        .selectDistinct(prestationColumns)
        .from(clientServices)
        .innerJoin(services, eq(services.id, clientServices.serviceId))
        .innerJoin(sites, eq(sites.id, clientServices.siteId))
        .innerJoin(
          clientServiceExecutions,
          and(
            eq(clientServiceExecutions.clientServiceId, clientServices.id),
            eq(clientServiceExecutions.actif, true),
          ),
        )
        .innerJoin(
          serviceEntreprises,
          eq(
            serviceEntreprises.id,
            clientServiceExecutions.serviceEntrepriseId,
          ),
        )
        .where(
          and(
            eq(clientServices.entrepriseId, parsedInput.entrepriseId),
            eq(clientServices.statut, "actif"),
            hasServiceFilter
              ? inArray(clientServices.serviceId, parsedInput.serviceIds!)
              : undefined,
            inArray(
              serviceEntreprises.entrepriseId,
              parsedInput.prestataireIds!,
            ),
          ),
        );
    } else {
      // Client/plateforme sans filtre prestataire — exige au moins une exécution active
      prestations = await db
        .selectDistinct(prestationColumns)
        .from(clientServices)
        .innerJoin(services, eq(services.id, clientServices.serviceId))
        .innerJoin(sites, eq(sites.id, clientServices.siteId))
        .innerJoin(
          clientServiceExecutions,
          and(
            eq(clientServiceExecutions.clientServiceId, clientServices.id),
            eq(clientServiceExecutions.actif, true),
          ),
        )
        .where(
          and(
            eq(clientServices.entrepriseId, parsedInput.entrepriseId),
            eq(clientServices.statut, "actif"),
            hasServiceFilter
              ? inArray(clientServices.serviceId, parsedInput.serviceIds!)
              : undefined,
          ),
        );
    }

    if (prestations.length === 0) return { events: [] as CalendarEventItemType[] };

    const prestationIds = prestations.map((p) => p.id);
    const prestationMap = new Map(prestations.map((p) => [p.id, p]));
    const events: CalendarEventItemType[] = [];

    // ── 2. Occurrences matérialisées dans la fenêtre ────────────────────────

    const materializedRows = await db
      .select({
        id: clientServiceOccurrences.id,
        clientServiceId: clientServiceOccurrences.clientServiceId,
        regleRecurrenceId: clientServiceOccurrences.regleRecurrenceId,
        dateDebutOriginale: clientServiceOccurrences.dateDebutOriginale,
        dateDebutPrevue: clientServiceOccurrences.dateDebutPrevue,
        dateFinPrevue: clientServiceOccurrences.dateFinPrevue,
        statut: clientServiceOccurrences.statut,
        siteNom: sites.nom,
      })
      .from(clientServiceOccurrences)
      .innerJoin(sites, eq(sites.id, clientServiceOccurrences.siteId))
      .where(
        and(
          inArray(clientServiceOccurrences.clientServiceId, prestationIds),
          gte(clientServiceOccurrences.dateDebutPrevue, windowStart),
          lte(clientServiceOccurrences.dateDebutPrevue, windowEnd),
          hasSiteFilter
            ? inArray(clientServiceOccurrences.siteId, parsedInput.siteIds!)
            : undefined,
        ),
      );

    // Clé de déduplication : regleRecurrenceId|dateDebutOriginale ISO
    const materializedByRegleDate = new Set(
      materializedRows
        .filter((o) => o.regleRecurrenceId && o.dateDebutOriginale)
        .map(
          (o) => `${o.regleRecurrenceId}|${o.dateDebutOriginale!.toISOString()}`,
        ),
    );

    for (const occ of materializedRows) {
      if (!occ.dateDebutPrevue) continue;
      const prestation = prestationMap.get(occ.clientServiceId);
      if (!prestation) continue;

      const color = OCCURRENCE_STATUT_COLORS[occ.statut] ?? "#94a3b8";
      events.push({
        id: `occ-${occ.id}`,
        title: `${prestation.serviceNom}${occ.siteNom ? ` — ${occ.siteNom}` : ""}`,
        start: occ.dateDebutPrevue.toISOString(),
        end: occ.dateFinPrevue?.toISOString(),
        color,
        extendedProps: {
          type: "materialized",
          occurrenceId: occ.id,
          statut: occ.statut,
          regleId: occ.regleRecurrenceId ?? undefined,
          prestationId: occ.clientServiceId,
          serviceNom: prestation.serviceNom,
          siteNom: occ.siteNom,
          famillePlanification: prestation.famillePlanification,
          dateDebutOriginale: occ.dateDebutOriginale?.toISOString(),
        },
      });
    }

    // ── 3. Événements virtuels depuis les RRULE ─────────────────────────────
    // Masqués si un filtre siteIds est actif (les règles n'ont pas de site spécifique)

    if (!hasSiteFilter) {
      const recurrenceAutoIds = prestations
        .filter((p) => p.famillePlanification === "recurrence_auto")
        .map((p) => p.id);

      if (recurrenceAutoIds.length > 0) {
        const regles = await db
          .select()
          .from(clientServiceReglesRecurrence)
          .where(
            and(
              inArray(
                clientServiceReglesRecurrence.clientServiceId,
                recurrenceAutoIds,
              ),
              eq(clientServiceReglesRecurrence.actif, true),
            ),
          );

        // Exceptions "supprimee" dans la fenêtre
        const exceptions = await db
          .select({
            regleRecurrenceId:
              clientServiceExceptionsRecurrence.regleRecurrenceId,
            dateOriginale: clientServiceExceptionsRecurrence.dateOriginale,
          })
          .from(clientServiceExceptionsRecurrence)
          .where(
            and(
              inArray(
                clientServiceExceptionsRecurrence.clientServiceId,
                recurrenceAutoIds,
              ),
              eq(clientServiceExceptionsRecurrence.typeException, "supprimee"),
              gte(clientServiceExceptionsRecurrence.dateOriginale, windowStart),
              lte(clientServiceExceptionsRecurrence.dateOriginale, windowEnd),
            ),
          );

        const suppressedKeys = new Set(
          exceptions
            .filter((e) => e.regleRecurrenceId)
            .map(
              (e) =>
                `${e.regleRecurrenceId}|${e.dateOriginale.toISOString()}`,
            ),
        );

        for (const regle of regles) {
          const prestation = prestationMap.get(regle.clientServiceId);
          if (!prestation) continue;

          let rrule: ReturnType<typeof rrulestr>;
          try {
            const fullStr = `DTSTART:${formatDtstartForRrule(regle.dtstartLocal)}\n${regle.regleRrule}`;
            rrule = rrulestr(fullStr);
          } catch {
            continue;
          }

          const dates = rrule.between(windowStart, windowEnd, true);

          for (const date of dates) {
            const dateIso = date.toISOString();

            if (suppressedKeys.has(`${regle.id}|${dateIso}`)) continue;
            if (materializedByRegleDate.has(`${regle.id}|${dateIso}`)) continue;

            const dateFinPrevue =
              regle.dureePrevueMinutes != null
                ? new Date(date.getTime() + regle.dureePrevueMinutes * 60 * 1000)
                : null;

            events.push({
              id: `virtual-${regle.id}-${date.getTime()}`,
              title: regle.libelle ?? prestation.serviceNom,
              start: dateIso,
              end: dateFinPrevue?.toISOString(),
              color: VIRTUAL_COLOR,
              extendedProps: {
                type: "virtual",
                regleId: regle.id,
                prestationId: regle.clientServiceId,
                serviceNom: prestation.serviceNom,
                famillePlanification: prestation.famillePlanification,
              },
            });
          }
        }
      }
    }

    return { events };
  });
