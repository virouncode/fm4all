"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getEntreprisesAction } from "@/server/actions/entreprisesActions";
import {
  getAccessibleSitesAction,
  getAllSitesForPlatformAction,
} from "@/server/actions/sitesActions";
import { getTicketsAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import {
  TicketPrioriteType,
  TicketStatutType,
  TicketTypeType,
} from "@/zod-schemas/enums";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createTicketsColumns,
  ticketsIdLabelMap,
} from "./createTicketsColumns";
import { TicketFormDialog } from "./TicketFormDialog";
import { TicketsFiltersDialog } from "./TicketsFiltersDialog";
import { TicketsGrid } from "./TicketsGrid";
import { TicketsSortDialog } from "./TicketsSortDialog";

type EntrepriseMinimal = { id: string; nom: string };

type SearchParams = {
  // Filtres
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
  proprietaireEntrepriseId?: string;
  demandeurEntrepriseId?: string;
  assigneEntrepriseId?: string;

  // Tri
  orderBy?: string;
  orderDir?: string;
};

type FiltersType = {
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
  proprietaireEntrepriseId?: string;
  assigneEntrepriseId?: string;
};

// Helpers pour conversion type-safe
function toEnumOrUndefined<T extends string>(
  value: string | undefined,
): T | undefined {
  return value && value !== "" ? (value as T) : undefined;
}

type OrderByType =
  | "createdAt"
  | "lastActivityAt"
  | "priorite"
  | "statut"
  | "titre"
  | "type"
  | "siteNom"
  | "proprietaireEntrepriseNom"
  | "demandeurEntrepriseNom"
  | "assigneEntrepriseNom";

function toOrderBy(value: string | undefined): OrderByType {
  const validValues: OrderByType[] = [
    "createdAt",
    "lastActivityAt",
    "priorite",
    "statut",
    "titre",
    "type",
    "siteNom",
    "proprietaireEntrepriseNom",
    "demandeurEntrepriseNom",
    "assigneEntrepriseNom",
  ];
  return value && validValues.includes(value as OrderByType)
    ? (value as OrderByType)
    : "lastActivityAt";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" || value === "desc" ? value : "desc";
}

type TicketsTableProps = {
  searchParams: SearchParams;
};

export function TicketsTable({ searchParams }: TicketsTableProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const router = useRouter();

  // View state from UI store (persisted in localStorage)
  const ticketView = useUiStore((state) => state.ticketView);
  const setTicketView = useUiStore((state) => state.setTicketView);

  // Data state
  const [tickets, setTickets] = useState<SelectTicketType[]>([]);
  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [entreprises, setEntreprises] = useState<EntrepriseMinimal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  // Filters for dialog - initialisés depuis searchParams
  const [filters, setFilters] = useState<FiltersType>({
    search: searchParams.search,
    statut: searchParams.statut,
    priorite: searchParams.priorite,
    type: searchParams.type,
    siteId: searchParams.siteId,
    proprietaireEntrepriseId: searchParams.proprietaireEntrepriseId,
    assigneEntrepriseId: searchParams.assigneEntrepriseId,
  });

  const pageSize = 30;

  // Compter les filtres actifs
  const activeFiltersCount = [
    searchParams.search,
    searchParams.statut,
    searchParams.priorite,
    searchParams.type,
    searchParams.siteId,
    searchParams.proprietaireEntrepriseId,
    searchParams.demandeurEntrepriseId,
    searchParams.assigneEntrepriseId,
  ].filter(Boolean).length;

  // Synchroniser filters avec searchParams quand ils changent
  useEffect(() => {
    setFilters({
      search: searchParams.search,
      statut: searchParams.statut,
      priorite: searchParams.priorite,
      type: searchParams.type,
      siteId: searchParams.siteId,
      proprietaireEntrepriseId: searchParams.proprietaireEntrepriseId,
      assigneEntrepriseId: searchParams.assigneEntrepriseId,
    });
  }, [
    searchParams.search,
    searchParams.statut,
    searchParams.priorite,
    searchParams.type,
    searchParams.siteId,
    searchParams.proprietaireEntrepriseId,
    searchParams.assigneEntrepriseId,
  ]);

  // Initial load: sites, entreprises, and tickets
  useEffect(() => {
    if (!entreprise?.id) return;

    async function loadInitialData() {
      if (!entreprise?.id) return;

      setLoading(true);
      setIsError(false);

      try {
        // En posture plateforme, charger TOUS les sites de tous les clients
        // Sinon, charger seulement les sites accessibles de l'entreprise courante
        const sitesPromise =
          posture === "plateforme"
            ? getAllSitesForPlatformAction({})
            : getAccessibleSitesAction({ entrepriseId: entreprise.id });

        const [sitesResult, entreprisesResult, ticketsResult] =
          await Promise.all([
            sitesPromise,
            getEntreprisesAction(),
            getTicketsAction({
              entrepriseId: entreprise.id,
              search: searchParams.search || undefined,
              statut: toEnumOrUndefined<TicketStatutType>(searchParams.statut),
              priorite: toEnumOrUndefined<TicketPrioriteType>(
                searchParams.priorite,
              ),
              type: toEnumOrUndefined<TicketTypeType>(searchParams.type),
              siteId: searchParams.siteId || undefined,
              proprietaireEntrepriseId:
                searchParams.proprietaireEntrepriseId || undefined,
              demandeurEntrepriseId:
                searchParams.demandeurEntrepriseId || undefined,
              assigneEntrepriseId:
                searchParams.assigneEntrepriseId || undefined,
              orderBy: toOrderBy(searchParams.orderBy),
              orderDir: toOrderDir(searchParams.orderDir),
              page: 1,
              pageSize,
            }),
          ]);

        if (sitesResult?.serverError) {
          toast.error(sitesResult.serverError.message);
        } else if (sitesResult?.data) {
          setSites(sitesResult.data);
        }

        if (entreprisesResult?.serverError) {
          toast.error(entreprisesResult.serverError.message);
        } else if (entreprisesResult?.data?.entreprises) {
          setEntreprises(entreprisesResult.data.entreprises);
        }

        if (ticketsResult?.serverError) {
          toast.error(ticketsResult.serverError.message);
          setIsError(true);
        } else if (ticketsResult?.data) {
          setTickets(ticketsResult.data.tickets || []);
          setTotal(ticketsResult.data.total || 0);
          setHasMore(ticketsResult.data.hasMore || false);
          setPage(1);
        }
      } catch {
        toast.error("Erreur lors du chargement des données");
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [entreprise?.id, posture, searchParams]);

  // Reload tickets when URL params change (RESET pattern)
  const loadTickets = useCallback(async () => {
    if (!entreprise?.id) return;

    setLoading(true);
    setIsError(false);

    try {
      const result = await getTicketsAction({
        entrepriseId: entreprise.id,
        search: searchParams.search || undefined,
        statut: toEnumOrUndefined<TicketStatutType>(searchParams.statut),
        priorite: toEnumOrUndefined<TicketPrioriteType>(searchParams.priorite),
        type: toEnumOrUndefined<TicketTypeType>(searchParams.type),
        siteId: searchParams.siteId || undefined,
        proprietaireEntrepriseId:
          searchParams.proprietaireEntrepriseId || undefined,
        demandeurEntrepriseId: searchParams.demandeurEntrepriseId || undefined,
        assigneEntrepriseId: searchParams.assigneEntrepriseId || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: 1,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data) {
        setTickets(result.data.tickets || []); // REPLACE
        setTotal(result.data.total || 0);
        setHasMore(result.data.hasMore || false);
        setPage(1);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tickets");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [
    entreprise?.id,
    searchParams.search,
    searchParams.statut,
    searchParams.priorite,
    searchParams.type,
    searchParams.siteId,
    searchParams.proprietaireEntrepriseId,
    searchParams.demandeurEntrepriseId,
    searchParams.assigneEntrepriseId,
    searchParams.orderBy,
    searchParams.orderDir,
    pageSize,
  ]);

  // Load more for infinite scroll (APPEND pattern)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isError || !entreprise?.id) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await getTicketsAction({
        entrepriseId: entreprise.id,
        search: searchParams.search || undefined,
        statut: toEnumOrUndefined<TicketStatutType>(searchParams.statut),
        priorite: toEnumOrUndefined<TicketPrioriteType>(searchParams.priorite),
        type: toEnumOrUndefined<TicketTypeType>(searchParams.type),
        siteId: searchParams.siteId || undefined,
        proprietaireEntrepriseId:
          searchParams.proprietaireEntrepriseId || undefined,
        demandeurEntrepriseId: searchParams.demandeurEntrepriseId || undefined,
        assigneEntrepriseId: searchParams.assigneEntrepriseId || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: nextPage,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data?.tickets) {
        const { tickets: newTickets, hasMore: hasMoreData } = result.data;
        setTickets((prev) => [...prev, ...newTickets]); // APPEND
        setHasMore(hasMoreData || false);
        setPage(nextPage);
      }
    } catch {
      toast.error("Erreur lors du chargement de plus de tickets");
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    page,
    hasMore,
    isLoadingMore,
    isError,
    entreprise?.id,
    searchParams.search,
    searchParams.statut,
    searchParams.priorite,
    searchParams.type,
    searchParams.siteId,
    searchParams.proprietaireEntrepriseId,
    searchParams.demandeurEntrepriseId,
    searchParams.assigneEntrepriseId,
    searchParams.orderBy,
    searchParams.orderDir,
    pageSize,
  ]);

  const handleFiltersApply = (newFilters: FiltersType) => {
    setFilters(newFilters);

    // Construire l'objet query avec les filtres et tri
    const query: Record<string, string> = {};

    // Garder les paramètres de tri existants
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;

    // Ajouter les nouveaux filtres (seulement si définis)
    if (newFilters.search) query.search = newFilters.search;
    if (newFilters.statut) query.statut = newFilters.statut;
    if (newFilters.priorite) query.priorite = newFilters.priorite;
    if (newFilters.type) query.type = newFilters.type;
    if (newFilters.siteId) query.siteId = newFilters.siteId;
    if (newFilters.proprietaireEntrepriseId) {
      query.proprietaireEntrepriseId = newFilters.proprietaireEntrepriseId;
    }
    if (newFilters.assigneEntrepriseId) {
      query.assigneEntrepriseId = newFilters.assigneEntrepriseId;
    }

    // Naviguer vers la nouvelle URL
    router.replace({ pathname: "/app/tickets", query }, { scroll: false });
  };

  const handleRowClick = (ticket: SelectTicketType) => {
    // Construire la query avec les searchParams actuels (filtres + tri)
    const query: Record<string, string> = {};
    if (searchParams.search) query.search = searchParams.search;
    if (searchParams.statut) query.statut = searchParams.statut;
    if (searchParams.priorite) query.priorite = searchParams.priorite;
    if (searchParams.type) query.type = searchParams.type;
    if (searchParams.siteId) query.siteId = searchParams.siteId;
    if (searchParams.proprietaireEntrepriseId)
      query.proprietaireEntrepriseId = searchParams.proprietaireEntrepriseId;
    if (searchParams.demandeurEntrepriseId)
      query.demandeurEntrepriseId = searchParams.demandeurEntrepriseId;
    if (searchParams.assigneEntrepriseId)
      query.assigneEntrepriseId = searchParams.assigneEntrepriseId;
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;

    router.push({
      pathname: "/app/tickets/[ticketId]",
      params: { ticketId: ticket.id },
      query,
    });
  };

  const handleTicketCreated = () => {
    loadTickets();
    setCreateDialogOpen(false);
  };

  const columns = createTicketsColumns({ sites, entreprises });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header Actions */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        {/* View Toggle */}
        <div role="group" aria-label="Mode d'affichage" className="flex items-center">
          <Button
            variant={ticketView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setTicketView("list")}
            className="rounded-r-none border-r-0"
            aria-label="Vue liste"
            aria-pressed={ticketView === "list"}
          >
            <List aria-hidden="true" />
          </Button>
          <Button
            variant={ticketView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setTicketView("grid")}
            className="rounded-l-none"
            aria-label="Vue grille"
            aria-pressed={ticketView === "grid"}
          >
            <Grid3x3 aria-hidden="true" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filtrer
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-4 w-4" />
            Trier
          </Button>
          {/* Bouton visible seulement si pas prestataire */}
          {posture !== "prestataire" && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau ticket
            </Button>
          )}
        </div>
      </div>

      {/* View: Table ou Grid */}
      <div className="flex-1 overflow-hidden">
        {ticketView === "list" ? (
          <InfiniteDataTable<SelectTicketType>
            columns={columns}
            items={tickets}
            total={total}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            idLabelMap={ticketsIdLabelMap}
            onRowClick={handleRowClick}
          />
        ) : (
          <TicketsGrid
            tickets={tickets}
            sites={sites}
            entreprises={entreprises}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            onTicketClick={handleRowClick}
          />
        )}
      </div>

      {/* Dialogs */}
      <TicketFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleTicketCreated}
      />

      <TicketsFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
      />

      <TicketsSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams}
      />
    </div>
  );
}
