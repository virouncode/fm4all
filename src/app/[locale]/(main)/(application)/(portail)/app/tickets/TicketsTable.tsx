"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { getEntreprisesAction } from "@/server/actions/entreprisesActions";
import { getTicketsAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  TicketPrioriteType,
  TicketStatutType,
  TicketTypeType,
} from "@/zod-schemas/enums";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { Filter, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createTicketsColumns,
  ticketsIdLabelMap,
} from "./createTicketsColumns";
import { TicketFormDialog } from "./TicketFormDialog";
import { TicketsFiltersDialog } from "./TicketsFiltersDialog";

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

  // Filters for dialog
  const [filters, setFilters] = useState<FiltersType>({});

  const pageSize = 30;

  // Initial load: sites, entreprises, and tickets
  useEffect(() => {
    if (!entreprise?.id) return;

    async function loadInitialData() {
      if (!entreprise?.id) return;

      setLoading(true);
      setIsError(false);

      try {
        const [sitesResult, entreprisesResult, ticketsResult] =
          await Promise.all([
            getAccessibleSitesAction({ entrepriseId: entreprise.id }),
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
  ]);

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
        priorite: toEnumOrUndefined<TicketPrioriteType>(
          searchParams.priorite,
        ),
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
        priorite: toEnumOrUndefined<TicketPrioriteType>(
          searchParams.priorite,
        ),
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
    // TODO: Update URL with new filters
  };

  const handleTicketCreated = () => {
    loadTickets();
    setCreateDialogOpen(false);
  };

  const columns = createTicketsColumns({ sites, entreprises });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersDialogOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filtrer
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* Infinite Data Table */}
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
      />

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
        sites={sites}
        onApply={handleFiltersApply}
      />
    </div>
  );
}
