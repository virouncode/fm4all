"use client";

import { Button } from "@/components/ui/button";
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
import { useRouter } from "@/i18n/navigation";
import {
  getCalendarEventsAction,
  getCalendarFilterOptionsAction,
  getCalendarSitesForFilterAction,
} from "@/server/actions/calendrierActions";
import { useAppStore } from "@/stores/application/appStore";
import type {
  CalendarSlotDurationType,
  CalendarViewType,
} from "@/stores/ui/uiStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type { EventInput } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilterMultiSelect } from "./FilterMultiSelect";
import "./fullcalendar-overrides.css";

// ==================== TYPES ====================

type OptionType = { id: string; nom: string };

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

// ==================== COMPONENT ====================

export function CalendrierClient() {
  const router = useRouter();
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

  // true si l'utilisateur est admin dans son entreprise pour la posture active
  const [isAdmin, setIsAdmin] = useState(false);
  // Référence aux sites initiaux (tous) pour restaurer après reset du filtre clients
  const allSitesRef = useRef<OptionType[]>([]);

  // Charge les options + pré-sélectionne les sites attribués
  useEffect(() => {
    if (!entreprise?.id) return;

    // Reset des sélections précédentes lors d'un changement de posture/entreprise
    setSelectedSiteIds([]);
    setSelectedServiceIds([]);
    setSelectedPrestataireIds([]);
    setSelectedClientIds([]);
    setSites([]);
    setServices([]);
    setPrestataires([]);
    setClients([]);

    getCalendarFilterOptionsAction({ entrepriseId: entreprise.id }).then(
      (result) => {
        if (result?.data) {
          const {
            sites: s,
            services: svc,
            prestataires: p,
            clients: c,
            defaultSiteIds,
            isAdmin: admin,
          } = result.data;
          setSites(s);
          allSitesRef.current = s;
          setServices(svc);
          setPrestataires(p);
          setClients(c);
          setSelectedSiteIds(defaultSiteIds);
          setIsAdmin(admin);
        }
      },
    );
  }, [entreprise?.id, posture]);

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

  // Changement de client (admin prestataire) : recharge dynamiquement les sites disponibles
  const handleClientChange = useCallback(
    async (ids: string[]) => {
      setSelectedClientIds(ids);
      setSelectedSiteIds([]);

      if (isAdmin && posture === "prestataire") {
        if (ids.length === 0) {
          // Aucun client sélectionné → restaurer tous les sites d'exécution
          setSites(allSitesRef.current);
        } else {
          const result = await getCalendarSitesForFilterAction({
            clientEntrepriseIds: ids,
          });
          if (result?.data) {
            setSites(result.data.sites);
          }
        }
      }
    },
    [isAdmin, posture],
  );

  const calendarView = useUiStore((s) => s.CalendarViewType);
  const slotMinTime = useUiStore((s) => s.CalendarSlotMinTime);
  const slotMaxTime = useUiStore((s) => s.CalendarSlotMaxTime);
  const slotDuration = useUiStore((s) => s.CalendarSlotDuration);
  const setCalendarViewType = useUiStore((s) => s.setCalendarViewType);
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

  const isClient = posture === "client";
  const isPlateforme = posture === "plateforme";
  const isPrestataire = posture === "prestataire";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Barre de filtres + contrôles de vue */}
      <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border px-3 py-2">
        {/* Filtres multi-select */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <FilterMultiSelect
            label="Sites"
            options={sites.map((s) => ({ id: s.id, label: s.nom }))}
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
          {isPrestataire && clients.length > 0 && (
            <FilterMultiSelect
              label="Clients"
              options={clients.map((c) => ({ id: c.id, label: c.nom }))}
              selectedIds={selectedClientIds}
              onChange={handleClientChange}
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

      {/* Calendrier */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView={calendarView}
          datesSet={(info) =>
            setCalendarViewType(info.view.type as CalendarViewType)
          }
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
          height="100%"
          stickyHeaderDates
          eventClick={(info) => {
            const { type, occurrenceId, prestationId } = info.event
              .extendedProps as {
              type: string;
              occurrenceId?: string;
              prestationId?: string;
            };
            if (type === "materialized" && occurrenceId && prestationId) {
              router.push({
                pathname:
                  "/app/prestations/[prestationId]/occurrences/[occurrenceId]",
                params: { prestationId, occurrenceId },
              });
            }
          }}
          eventDidMount={(info) => {
            const { statut } = info.event.extendedProps as {
              statut?: string;
            };
            if (statut === "annulee" || statut === "non_applicable") {
              info.el.style.opacity = "0.4";
              info.el.style.textDecoration = "line-through";
            }
          }}
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: "2-digit", hour12: false }}
          allDaySlot={false}
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
    </div>
  );
}
