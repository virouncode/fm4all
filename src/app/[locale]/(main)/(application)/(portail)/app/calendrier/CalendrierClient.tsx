"use client";

import { Button } from "@/components/ui/button";
import {
  getCalendarEventsAction,
  getCalendarFilterOptionsAction,
  getCalendarSitesForFilterAction,
} from "@/server/actions/calendrierActions";
import { useAppStore } from "@/stores/application/appStore";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import { useRouter } from "@/i18n/navigation";
import { Calendar, CalendarClock, LayoutGrid, List } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilterMultiSelect } from "./FilterMultiSelect";

// ==================== TYPES ====================

type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listMonth";
type OptionType = { id: string; nom: string };

// ==================== COMPONENT ====================

export function CalendrierClient() {
  const router = useRouter();
  const entreprise = useAppStore((s) => s.entreprise);
  const posture = useAppStore((s) => s.postureActive);
  const calendarRef = useRef<FullCalendar>(null);

  const [currentView, setCurrentView] = useState<ViewType>("dayGridMonth");

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

  const changeView = useCallback((view: ViewType) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  }, []);

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

  const isClient = posture === "client";
  const isPlateforme = posture === "plateforme";
  const isPrestataire = posture === "prestataire";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar : vues + filtres */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Boutons de vue */}
        <div className="flex gap-1">
          <Button
            variant={currentView === "dayGridMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => changeView("dayGridMonth")}
          >
            <LayoutGrid className="h-4 w-4" />
            Mois
          </Button>
          <Button
            variant={currentView === "timeGridWeek" ? "default" : "outline"}
            size="sm"
            onClick={() => changeView("timeGridWeek")}
          >
            <Calendar className="h-4 w-4" />
            Semaine
          </Button>
          <Button
            variant={currentView === "timeGridDay" ? "default" : "outline"}
            size="sm"
            onClick={() => changeView("timeGridDay")}
          >
            <CalendarClock className="h-4 w-4" />
            Jour
          </Button>
          <Button
            variant={currentView === "listMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => changeView("listMonth")}
          >
            <List className="h-4 w-4" />
            Liste
          </Button>
        </div>

        {/* Filtres multi-select */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Prestataires — client et plateforme uniquement */}
          {(isClient || isPlateforme) && prestataires.length > 0 && (
            <FilterMultiSelect
              label="Prestataires"
              options={prestataires.map((p) => ({ id: p.id, label: p.nom }))}
              selectedIds={selectedPrestataireIds}
              onChange={setSelectedPrestataireIds}
            />
          )}

          {/* Clients — prestataire uniquement */}
          {isPrestataire && clients.length > 0 && (
            <FilterMultiSelect
              label="Clients"
              options={clients.map((c) => ({ id: c.id, label: c.nom }))}
              selectedIds={selectedClientIds}
              onChange={handleClientChange}
            />
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
          Virtuelle
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
          Planifiée
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
          En cours
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
          Terminée
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          Non honorée
        </span>
      </div>

      {/* Calendrier */}
      <div className="overflow-hidden rounded-lg border">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          locale={frLocale}
          events={fetchEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="auto"
          eventClick={(info) => {
            const { type, occurrenceId, prestationId } =
              info.event.extendedProps as {
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
          nowIndicator
          weekNumbers
          weekText="S"
          firstDay={1}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          listDayFormat={{ weekday: "long", month: "long", day: "numeric" }}
          noEventsContent="Aucune intervention sur cette période"
        />
      </div>
    </div>
  );
}
