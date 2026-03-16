"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEventItemType } from "@/server/actions/calendrierActions";
import {
  getCalendarEventsAction,
  getCalendarFilterOptionsAction,
  getCalendarSitesForFilterAction,
} from "@/server/actions/calendrierActions";
import {
  dragOccurrenceAction,
  resizeOccurrenceAction,
} from "@/server/actions/clientServiceOccurrencesActions";
import { toast } from "sonner";
import { useAppStore } from "@/stores/application/appStore";
import type {
  CalendarSlotDurationType,
  CalendarViewType,
} from "@/stores/ui/uiStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type { EventContentArg, EventInput } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import luxon3Plugin from "@fullcalendar/luxon3";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { fr } from "date-fns/locale";
import { CalendarCheck, CalendarIcon, Clock, Repeat2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilterMultiSelect } from "./FilterMultiSelect";
import { OccurrenceDetailDialog } from "./OccurrenceDetailDialog";
import { OccurrenceEditScopeDialog } from "./OccurrenceEditScopeDialog";
import "./fullcalendar-overrides.css";

// ==================== TYPES ====================

type OptionType = { id: string; nom: string };

/** Groupe de sites par client, pour l'affichage groupé dans FilterMultiSelect */
type SiteGroupType = { groupLabel: string; options: { id: string; label: string }[] };

type PendingEditType = {
  type: "drag" | "resize";
  occurrenceId: string;
  hasRule: boolean;
  newStart: string;
  newEnd?: string;
  revert: () => void;
};

// ==================== OPTIONS TEMPS ====================

const START_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${String(i).padStart(2, "0")}:00:00`,
  label: `${String(i).padStart(2, "0")}H`,
}));

const END_HOUR_OPTIONS = [
  ...Array.from({ length: 23 }, (_, i) => ({
    value: `${String(i + 1).padStart(2, "0")}:00:00`,
    label: `${String(i + 1).padStart(2, "0")}H`,
  })),
  { value: "24:00:00", label: "24H" },
];

const DURATION_OPTIONS = [
  { value: "00:15:00", label: "15 min" },
  { value: "00:30:00", label: "30 min" },
  { value: "01:00:00", label: "1h" },
];

// ==================== SCROLL SESSION ====================

let sessionScrollTop = 0;

// ==================== HELPERS ====================

type EventExtendedPropsType = CalendarEventItemType["extendedProps"];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatEventTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ==================== STATUT BADGE (list view) ====================

const STATUT_LIST_CONFIG: Record<string, { label: string; className: string }> = {
  planifiee:      { label: "Planifiée",       className: "bg-slate-100 text-slate-600 border-slate-200" },
  en_cours:       { label: "En cours",        className: "bg-blue-50 text-blue-700 border-blue-200" },
  terminee:       { label: "Terminée",        className: "bg-green-50 text-green-700 border-green-200" },
  non_honoree:    { label: "Non honorée",     className: "bg-red-50 text-red-700 border-red-200" },
  annulee:        { label: "Annulée",         className: "bg-gray-100 text-gray-500 border-gray-200" },
  non_applicable: { label: "Non applicable",  className: "bg-gray-100 text-gray-500 border-gray-200" },
};

// ==================== EVENT CONTENT ====================

function CalendarEventContent({ info }: { info: EventContentArg }) {
  const { serviceNom, siteNom, siteAdresse, prestataireNom, regleId, statut } =
    info.event.extendedProps as EventExtendedPropsType;
  const start = info.event.start;
  const end = info.event.end;
  const viewType = info.view.type;

  const timeStr = start
    ? `${formatEventTime(start)}${end ? ` – ${formatEventTime(end)}` : ""}`
    : "";

  if (viewType === "timeGridWeek" || viewType === "timeGridDay") {
    return (
      <div className="flex h-full flex-col overflow-hidden px-1.5 py-1 leading-tight">
        <div className="flex items-center gap-1 text-xs font-semibold">
          <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{timeStr}</span>
          {regleId && (
            <Repeat2 className="ml-auto h-3 w-3 flex-shrink-0 opacity-60" aria-hidden="true" />
          )}
        </div>
        <div className="mt-0.5 truncate text-xs">
          <span className="font-medium">{serviceNom}</span>
          {prestataireNom && (
            <span className="opacity-60"> · {prestataireNom}</span>
          )}
        </div>
        {siteNom && (
          <div className="truncate text-xs opacity-60">{siteNom}</div>
        )}
      </div>
    );
  }

  if (viewType === "dayGridMonth") {
    return (
      <span className="truncate px-1 text-xs font-medium leading-none">
        {serviceNom}
      </span>
    );
  }

  // listMonth — plus d'espace disponible : 2 lignes + badge statut
  const statutListCfg = statut ? STATUT_LIST_CONFIG[statut] : null;
  const locationStr = [siteNom, siteAdresse].filter(Boolean).join(" — ");

  return (
    <div className="flex flex-1 items-center justify-between gap-6 py-0.5">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          {regleId && (
            <Repeat2 className="h-3 w-3 shrink-0 opacity-50" aria-hidden="true" />
          )}
          <span className="text-sm font-medium">{serviceNom}</span>
          {prestataireNom && (
            <span className="text-xs text-muted-foreground">· {prestataireNom}</span>
          )}
        </div>
        {locationStr && (
          <div className="truncate text-xs text-muted-foreground">{locationStr}</div>
        )}
      </div>
      {statutListCfg && (
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statutListCfg.className}`}
        >
          {statutListCfg.label}
        </span>
      )}
    </div>
  );
}

// ==================== COMPONENT ====================

export function CalendrierClient() {
  const entreprise = useAppStore((s) => s.entreprise);
  const posture = useAppStore((s) => s.postureActive);
  const calendarRef = useRef<FullCalendar>(null);

  // Sélections multi-filtres
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPrestataireIds, setSelectedPrestataireIds] = useState<
    string[]
  >([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  // Options disponibles dans les dropdowns
  const [sites, setSites] = useState<OptionType[]>([]);
  const [services, setServices] = useState<OptionType[]>([]);
  const [prestataires, setPrestataires] = useState<OptionType[]>([]);
  const [clients, setClients] = useState<OptionType[]>([]);

  /** Sites groupés par client — actif en posture prestataire/plateforme */
  const [siteGroups, setSiteGroups] = useState<SiteGroupType[]>([]);

  // true si l'utilisateur est admin dans son entreprise pour la posture active
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEditType | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailEventProps, setDetailEventProps] = useState<
    (EventExtendedPropsType & { start: string; end?: string }) | null
  >(null);
  /** Ref toujours à jour — lue dans eventDidMount pour éviter les closures périmées */
  const selectedEventIdRef = useRef<string | null>(null);
  selectedEventIdRef.current = selectedEventId;
  /** Map eventId → { el, color } pour mettre à jour le background selon la sélection */
  const eventElsRef = useRef<Map<string, { el: HTMLElement; color: string }>>(
    new Map(),
  );
  // Référence aux sites initiaux (tous) pour restaurer après reset du filtre clients
  const allSitesRef = useRef<OptionType[]>([]);
  const initialSiteGroupsRef = useRef<SiteGroupType[]>([]);

  // Charge les options + restaure les sélections persistées
  useEffect(() => {
    if (!entreprise?.id) return;

    // Reset immédiat pour éviter l'affichage de données périmées
    setSelectedSiteIds([]);
    setSelectedServiceIds([]);
    setSelectedPrestataireIds([]);
    setSelectedClientIds([]);
    setSites([]);
    setSiteGroups([]);
    setServices([]);
    setPrestataires([]);
    setClients([]);

    const entrepriseId = entreprise.id;
    let cancelled = false;

    async function init() {
      const result = await getCalendarFilterOptionsAction({ entrepriseId });
      if (cancelled || !result?.data) return;

      const {
        sites: s,
        sitesParClient,
        services: svc,
        prestataires: p,
        clients: c,
        defaultSiteIds,
        isAdmin: admin,
      } = result.data;

      setServices(svc);
      setPrestataires(p);
      setClients(c);
      setIsAdmin(admin);

      // ── Sélection clients ───────────────────────────────────────────────
      // Posture client : on force l'id de l'entreprise (pas de filtre client dans l'UI)
      // Posture prestataire / plateforme : restaurer depuis le store (intersecté avec les disponibles)
      let clientIds: string[];
      if (posture === "client") {
        clientIds = [entrepriseId];
      } else {
        const persisted = useUiStore.getState().CalendarSelectedClientIds;
        clientIds = persisted.filter((id) => c.some((cl) => cl.id === id));
      }
      setSelectedClientIds(clientIds);

      // ── Sites ───────────────────────────────────────────────────────────
      // Pour prestataire/plateforme, les sites dépendent des clients sélectionnés
      const toGroups = (list: typeof sitesParClient) =>
        list.map((g) => ({
          groupLabel: g.clientNom,
          options: g.sites.map((sv) => ({ id: sv.id, label: sv.nom })),
        }));

      let resolvedSites: OptionType[] = s;
      let resolvedGroups: SiteGroupType[] = toGroups(sitesParClient);

      if (posture !== "client" && clientIds.length > 0) {
        if (posture === "prestataire") {
          // Filtrer les groupes initiaux aux clients sélectionnés (pas d'appel serveur)
          resolvedGroups = toGroups(
            sitesParClient.filter((g) => clientIds.includes(g.clientId)),
          );
          resolvedSites = resolvedGroups.flatMap((g) =>
            g.options.map((o) => ({ id: o.id, nom: o.label })),
          );
        } else {
          // Plateforme : charger les sites des clients sélectionnés
          const sitesResult = await getCalendarSitesForFilterAction({
            clientEntrepriseIds: clientIds,
          });
          if (!cancelled && sitesResult?.data?.sitesParClient) {
            resolvedGroups = toGroups(sitesResult.data.sitesParClient);
            resolvedSites = resolvedGroups.flatMap((g) =>
              g.options.map((o) => ({ id: o.id, nom: o.label })),
            );
          }
        }
      }

      allSitesRef.current = s;
      initialSiteGroupsRef.current = resolvedGroups;
      setSites(resolvedSites);
      setSiteGroups(resolvedGroups);

      // ── Sélection sites ─────────────────────────────────────────────────
      const availableSiteIds = resolvedSites.map((sv) => sv.id);
      const persistedSiteIds = useUiStore.getState().CalendarSelectedSiteIds;
      const validSiteIds = persistedSiteIds.filter((id) =>
        availableSiteIds.includes(id),
      );
      // Posture client sans sélection persistée → pré-sélectionner tout (defaultSiteIds)
      setSelectedSiteIds(
        validSiteIds.length > 0
          ? validSiteIds
          : posture === "client"
            ? defaultSiteIds
            : [],
      );

      // ── Sélection services ──────────────────────────────────────────────
      const persistedServiceIds =
        useUiStore.getState().CalendarSelectedServiceIds;
      setSelectedServiceIds(
        persistedServiceIds.filter((id) => svc.some((sv) => sv.id === id)),
      );
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [entreprise?.id, posture]);

  // Sync des sélections vers le store persisté (hors posture client pour les clients)
  useEffect(() => {
    if (posture !== "client") {
      useUiStore.getState().setCalendarSelectedClientIds(selectedClientIds);
    }
  }, [selectedClientIds, posture]);

  useEffect(() => {
    useUiStore.getState().setCalendarSelectedSiteIds(selectedSiteIds);
  }, [selectedSiteIds]);

  useEffect(() => {
    useUiStore.getState().setCalendarSelectedServiceIds(selectedServiceIds);
  }, [selectedServiceIds]);

  // Met à jour le style de tous les events selon la sélection courante (iCal style)
  useEffect(() => {
    eventElsRef.current.forEach(({ el, color }, id) => {
      const isSelected = id === selectedEventId;
      const inner = el.querySelector<HTMLElement>(".fc-event-main");
      if (isSelected) {
        el.style.backgroundColor = color;
        el.style.border = "none";
        el.style.color = "white";
        if (inner) inner.style.color = "white";
      } else {
        el.style.backgroundColor = hexToRgba(color, 0.13);
        el.style.border = "none";
        el.style.borderLeft = `3px solid ${color}`;
        el.style.color = "";
        if (inner) inner.style.color = "";
      }
    });
  }, [selectedEventId]);

  // Ref toujours à jour — lu dans fetchEvents pour éviter les closures périmées
  const filtersRef = useRef({
    selectedSiteIds,
    selectedServiceIds,
    selectedPrestataireIds,
    selectedClientIds,
    entrepriseId: entreprise?.id,
  });
  filtersRef.current = {
    selectedSiteIds,
    selectedServiceIds,
    selectedPrestataireIds,
    selectedClientIds,
    entrepriseId: entreprise?.id,
  };

  // Déclenche un re-fetch FullCalendar à chaque changement de filtre
  useEffect(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, [
    selectedSiteIds,
    selectedServiceIds,
    selectedPrestataireIds,
    selectedClientIds,
    entreprise?.id,
  ]);

  // Référence stable : FullCalendar ne re-monte pas la source d'événements
  const fetchEvents = useCallback(
    async (fetchInfo: { start: Date; end: Date }): Promise<EventInput[]> => {
      const {
        entrepriseId,
        selectedSiteIds,
        selectedServiceIds,
        selectedPrestataireIds,
        selectedClientIds,
      } = filtersRef.current;
      if (!entrepriseId) return [];

      const result = await getCalendarEventsAction({
        start: fetchInfo.start.toISOString(),
        end: fetchInfo.end.toISOString(),
        entrepriseId,
        siteIds: selectedSiteIds.length ? selectedSiteIds : undefined,
        serviceIds: selectedServiceIds.length ? selectedServiceIds : undefined,
        prestataireIds: selectedPrestataireIds.length
          ? selectedPrestataireIds
          : undefined,
        clientIds: selectedClientIds.length ? selectedClientIds : undefined,
      });

      return (result?.data?.events ?? []) as EventInput[];
    },
    [],
  );

  // Changement de client : recharge les sites groupés par client
  const handleClientChange = useCallback(
    async (ids: string[]) => {
      setSelectedClientIds(ids);
      setSelectedSiteIds([]);

      if (ids.length === 0) {
        // Aucun client sélectionné → restaurer les sites initiaux
        setSiteGroups(initialSiteGroupsRef.current);
        setSites(allSitesRef.current);
      } else {
        const result = await getCalendarSitesForFilterAction({
          clientEntrepriseIds: ids,
        });
        if (result?.data?.sitesParClient) {
          const groups = result.data.sitesParClient.map((g) => ({
            groupLabel: g.clientNom,
            options: g.sites.map((s) => ({ id: s.id, label: s.nom })),
          }));
          setSiteGroups(groups);
          setSites(
            groups.flatMap((g) =>
              g.options.map((o) => ({ id: o.id, nom: o.label })),
            ),
          );
        }
      }
    },
    [],
  );

  const calendarView = useUiStore((s) => s.CalendarViewType);
  const calendarCurrentDate = useUiStore((s) => s.CalendarCurrentDate);
  const slotMinTime = useUiStore((s) => s.CalendarSlotMinTime);
  const slotMaxTime = useUiStore((s) => s.CalendarSlotMaxTime);
  const slotDuration = useUiStore((s) => s.CalendarSlotDuration);
  const setCalendarViewType = useUiStore((s) => s.setCalendarViewType);
  const setCalendarCurrentDate = useUiStore((s) => s.setCalendarCurrentDate);
  const setCalendarSlotMinTime = useUiStore((s) => s.setCalendarSlotMinTime);
  const setCalendarSlotMaxTime = useUiStore((s) => s.setCalendarSlotMaxTime);
  const setCalendarSlotDuration = useUiStore((s) => s.setCalendarSlotDuration);

  const handleSlotMinTimeChange = (value: string) => {
    setCalendarSlotMinTime(value);
    if (slotMaxTime <= value) {
      const nextValid = END_HOUR_OPTIONS.find((o) => o.value > value);
      if (nextValid) setCalendarSlotMaxTime(nextValid.value);
    }
  };

  // Sync la vue FC quand le store rehydrate (initialView est one-shot au montage)
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api || api.view.type === calendarView) return;
    api.changeView(calendarView);
  }, [calendarView]);

  // Nettoie le listener de scroll au démontage
  useEffect(() => {
    const cleanup = scrollCleanupRef.current;
    return () => {
      cleanup?.();
    };
  }, []);

  const scrollCleanupRef = useRef<(() => void) | null>(null);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const handleDatePick = (date: Date | undefined) => {
    if (!date) return;
    setPickerDate(date);
    calendarRef.current?.getApi().gotoDate(date);
    setDatePickerOpen(false);
  };

  const handleConfirmScope = async (scope: "occurrence" | "suivantes") => {
    if (!pendingEdit || !entreprise?.id) return;
    try {
      if (pendingEdit.type === "drag") {
        const result = await dragOccurrenceAction({
          occurrenceId: pendingEdit.occurrenceId,
          entrepriseId: entreprise.id,
          newStart: pendingEdit.newStart,
          newEnd: pendingEdit.newEnd,
          scope,
        });
        if (result?.serverError) {
          toast.error(result.serverError.message);
          pendingEdit.revert();
        } else {
          if (result?.data?.warningNoExecution) {
            toast.warning("Aucune occurrence générée — aucun prestataire actif sur cette période.");
          }
          calendarRef.current?.getApi().refetchEvents();
        }
      } else {
        const result = await resizeOccurrenceAction({
          occurrenceId: pendingEdit.occurrenceId,
          entrepriseId: entreprise.id,
          newEnd: pendingEdit.newEnd!,
          scope,
        });
        if (result?.serverError) {
          toast.error(result.serverError.message);
          pendingEdit.revert();
        } else {
          if (result?.data?.warningNoExecution) {
            toast.warning("Aucune occurrence générée — aucun prestataire actif sur cette période.");
          }
          calendarRef.current?.getApi().refetchEvents();
        }
      }
    } finally {
      setPendingEdit(null);
    }
  };

  const handleCancelEdit = () => {
    pendingEdit?.revert();
    setPendingEdit(null);
  };

  const isClient = posture === "client";
  const isPlateforme = posture === "plateforme";
  const isPrestataire = posture === "prestataire";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Barre de filtres + contrôles de vue */}
      <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border px-3 py-2">
        {/* Filtres multi-select */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {(isPrestataire || isPlateforme) && clients.length > 0 && (
            <FilterMultiSelect
              label="Clients"
              options={clients.map((c) => ({ id: c.id, label: c.nom }))}
              selectedIds={selectedClientIds}
              onChange={handleClientChange}
            />
          )}
          <FilterMultiSelect
            label="Sites"
            options={siteGroups.length === 0 ? sites.map((s) => ({ id: s.id, label: s.nom })) : undefined}
            groupedOptions={siteGroups.length > 0 ? siteGroups : undefined}
            selectedIds={selectedSiteIds}
            onChange={setSelectedSiteIds}
          />
          <FilterMultiSelect
            label="Services"
            options={services.map((s) => ({ id: s.id, label: s.nom }))}
            selectedIds={selectedServiceIds}
            onChange={setSelectedServiceIds}
          />
          {(isClient || isPlateforme) && prestataires.length > 0 && (
            <FilterMultiSelect
              label="Prestataires"
              options={prestataires.map((p) => ({ id: p.id, label: p.nom }))}
              selectedIds={selectedPrestataireIds}
              onChange={setSelectedPrestataireIds}
            />
          )}
        </div>

        {/* Séparateur */}
        <div className="bg-border h-5 w-px flex-shrink-0" />

        {/* Plage horaire */}
        <div className="text-muted-foreground flex flex-shrink-0 items-center gap-1.5 text-xs">
          <span>De</span>
          <Select value={slotMinTime} onValueChange={handleSlotMinTimeChange}>
            <SelectTrigger className="h-8 w-18 text-xs" title="Heure de début">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-0 w-18">
              {START_HOUR_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>à</span>
          <Select value={slotMaxTime} onValueChange={setCalendarSlotMaxTime}>
            <SelectTrigger className="h-8 w-18 text-xs" title="Heure de fin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-0 w-18">
              {END_HOUR_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-xs"
                  disabled={o.value <= slotMinTime}
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Séparateur */}
        <div className="bg-border h-5 w-px flex-shrink-0" />

        {/* Durée des slots */}
        <span className="text-muted-foreground flex-shrink-0 text-xs">
          Intervalle
        </span>
        <Select
          value={slotDuration}
          onValueChange={(v) =>
            setCalendarSlotDuration(v as CalendarSlotDurationType)
          }
        >
          <SelectTrigger className="h-8 w-22 flex-shrink-0 text-xs" title="Intervalle des créneaux">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Séparateur */}
        <div className="bg-border h-5 w-px flex-shrink-0" />

        {/* Timezone */}
        <span
          className="text-muted-foreground flex-shrink-0 text-xs"
          title="Les horaires sont affichés en heure de Paris (Europe/Paris)"
        >
          🕐 Europe/Paris
        </span>

        {/* Séparateur */}
        <div className="bg-border h-5 w-px flex-shrink-0" />

        {/* Indicateur chargement events */}
        <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
          {eventsLoading ? (
            <Spinner className="text-primary" />
          ) : (
            <CalendarCheck className="text-muted-foreground h-4 w-4" />
          )}
        </div>

        {/* Séparateur */}
        <div className="bg-border h-5 w-px flex-shrink-0" />

        {/* Raccourci date */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              aria-label="Aller à une date"
              title="Aller à une date"
            >
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={pickerDate}
              onSelect={handleDatePick}
              defaultMonth={pickerDate}
              locale={fr}
              captionLayout="dropdown"
              startMonth={new Date(2015, 0)}
              endMonth={new Date(2040, 11)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Message si aucun client sélectionné (prestataire / plateforme) */}
      {(isPrestataire || isPlateforme) && selectedClientIds.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30">
          <CalendarIcon className="text-muted-foreground/40 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Sélectionnez un ou plusieurs clients pour afficher le calendrier.
          </p>
        </div>
      ) : (
      /* Calendrier */
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
            luxon3Plugin,
          ]}
          initialView={calendarView}
          initialDate={calendarCurrentDate || undefined}
          datesSet={(info) => {
            setCalendarViewType(info.view.type as CalendarViewType);
            setCalendarCurrentDate(info.startStr);
          }}
          viewDidMount={() => {
            requestAnimationFrame(() => {
              const scroller = document.querySelector<HTMLElement>(
                ".fc-scroller-liquid-absolute",
              );
              if (!scroller) return;
              if (sessionScrollTop > 0) {
                scroller.scrollTop = sessionScrollTop;
              }
              scrollCleanupRef.current?.();
              const handleScroll = () => {
                sessionScrollTop = scroller.scrollTop;
              };
              scroller.addEventListener("scroll", handleScroll, {
                passive: true,
              });
              scrollCleanupRef.current = () =>
                scroller.removeEventListener("scroll", handleScroll);
            });
          }}
          locale={frLocale}
          events={fetchEvents}
          loading={(isLoading) => setEventsLoading(isLoading)}
          headerToolbar={{
            left: "title",
            center: "timeGridDay,timeGridWeek,dayGridMonth,listMonth",
            right: "prev,today,next",
          }}
          buttonText={{
            day: "Jour",
            week: "Semaine",
            month: "Mois",
            list: "Liste",
          }}
          views={{
            dayGridMonth: {
              dayMaxEventRows: 4,
              moreLinkClick: "popover",
            },
          }}
          height="100%"
          stickyHeaderDates
          timeZone="Europe/Paris"
          editable={isAdmin}
          eventResizableFromStart={isAdmin}
          eventAllow={(_, draggedEvent) => {
            if (!draggedEvent) return false;
            const { type, statut } = draggedEvent.extendedProps as {
              type?: string;
              statut?: string;
            };
            return type === "materialized" && statut === "planifiee";
          }}
          eventDrop={(info) => {
            const { type, statut, occurrenceId, regleId } =
              info.event.extendedProps as {
                type?: string;
                statut?: string;
                occurrenceId?: string;
                regleId?: string;
              };
            if (
              type !== "materialized" ||
              statut !== "planifiee" ||
              !occurrenceId
            ) {
              info.revert();
              return;
            }
            if (!regleId) {
              dragOccurrenceAction({
                occurrenceId,
                entrepriseId: entreprise!.id,
                newStart: info.event.startStr,
                newEnd: info.event.endStr || undefined,
                scope: "occurrence",
              }).then((result) => {
                if (result?.serverError) {
                  toast.error(result.serverError.message);
                  info.revert();
                } else {
                  calendarRef.current?.getApi().refetchEvents();
                }
              });
              return;
            }
            setPendingEdit({
              type: "drag",
              occurrenceId,
              hasRule: true,
              newStart: info.event.startStr,
              newEnd: info.event.endStr || undefined,
              revert: info.revert,
            });
          }}
          eventResize={(info) => {
            const { type, statut, occurrenceId, regleId } =
              info.event.extendedProps as {
                type?: string;
                statut?: string;
                occurrenceId?: string;
                regleId?: string;
              };
            if (
              type !== "materialized" ||
              statut !== "planifiee" ||
              !occurrenceId
            ) {
              info.revert();
              return;
            }
            if (!regleId) {
              resizeOccurrenceAction({
                occurrenceId,
                entrepriseId: entreprise!.id,
                newEnd: info.event.endStr,
                scope: "occurrence",
              }).then((result) => {
                if (result?.serverError) {
                  toast.error(result.serverError.message);
                  info.revert();
                } else {
                  calendarRef.current?.getApi().refetchEvents();
                }
              });
              return;
            }
            setPendingEdit({
              type: "resize",
              occurrenceId,
              hasRule: true,
              newStart: info.event.startStr,
              newEnd: info.event.endStr || undefined,
              revert: info.revert,
            });
          }}
          dateClick={() => {
            setSelectedEventId(null);
          }}
          eventClick={(info) => {
            const eventId = info.event.id;
            if (selectedEventId === eventId) {
              setDetailEventProps({
                ...(info.event.extendedProps as EventExtendedPropsType),
                start: info.event.startStr,
                end: info.event.endStr || undefined,
              });
            } else {
              setSelectedEventId(eventId);
            }
          }}
          eventContent={(info) => <CalendarEventContent info={info} />}
          eventDidMount={(info) => {
            const { statut } = info.event.extendedProps as EventExtendedPropsType;
            const color = info.event.backgroundColor;
            if (info.view.type !== "listMonth") {
              const isSelected = info.event.id === selectedEventIdRef.current;
              const inner = info.el.querySelector<HTMLElement>(".fc-event-main");
              if (isSelected) {
                info.el.style.backgroundColor = color;
                info.el.style.border = "none";
                info.el.style.color = "white";
                if (inner) inner.style.color = "white";
              } else {
                info.el.style.backgroundColor = hexToRgba(color, 0.13);
                info.el.style.border = "none";
                info.el.style.borderLeft = `3px solid ${color}`;
              }
              info.el.style.cursor = "pointer";
              eventElsRef.current.set(info.event.id, { el: info.el, color });
            } else {
              info.el.style.cursor = "pointer";
            }
            if (statut === "annulee" || statut === "non_applicable") {
              info.el.style.opacity = "0.5";
              info.el.style.textDecoration = "line-through";
            }
          }}
          eventWillUnmount={(info) => {
            eventElsRef.current.delete(info.event.id);
          }}
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: "2-digit", hour12: false }}
          allDaySlot={false}
          slotEventOverlap={false}
          nowIndicator
          weekNumbers
          weekText="S"
          firstDay={1}
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration={slotDuration}
          listDayFormat={{ weekday: "long", month: "long", day: "numeric" }}
          noEventsContent="Aucune intervention sur cette période"
        />
      </div>
      )}

      <OccurrenceDetailDialog
        open={detailEventProps !== null}
        onOpenChange={(open) => { if (!open) setDetailEventProps(null); }}
        eventProps={detailEventProps}
      />
      <OccurrenceEditScopeDialog
        open={pendingEdit !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelEdit();
        }}
        type={pendingEdit?.type ?? "drag"}
        onConfirm={handleConfirmScope}
        onCancel={handleCancelEdit}
      />
    </div>
  );
}
