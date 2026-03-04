"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getEntreprisesPaginatedAction } from "@/server/actions/entreprisesActions";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type {
  EntrepriseWithDetails,
  RoleEntrepriseType,
} from "@/zod-schemas/entreprise.schema";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createEntreprisesColumns,
  entreprisesIdLabelMap,
} from "./createEntreprisesColumns";
import { EntrepriseFormDialog } from "./EntrepriseFormDialog";
import { EntreprisesFiltersDialog } from "./EntreprisesFiltersDialog";
import { EntreprisesGrid } from "./EntreprisesGrid";
import { EntreprisesSortDialog } from "./EntreprisesSortDialog";

type SearchParams = {
  search?: string;
  role?: string;
  orderBy?: string;
  orderDir?: string;
};

type FiltersType = {
  search?: string;
  role?: string;
};

type OrderByType = "nom" | "createdAt";

function toOrderBy(value: string | undefined): OrderByType {
  return value === "nom" || value === "createdAt" ? value : "nom";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" || value === "desc" ? value : "asc";
}

function toRoleOrUndefined(
  value: string | undefined,
): RoleEntrepriseType | undefined {
  if (value === "client" || value === "prestataire" || value === "plateforme") {
    return value;
  }
  return undefined;
}

type EntreprisesTableProps = {
  searchParams: SearchParams;
};

export function EntreprisesTable({ searchParams }: EntreprisesTableProps) {
  const posture = useAppStore((state) => state.postureActive);
  const entreprise = useAppStore((state) => state.entreprise);
  const router = useRouter();

  // View state persisted in localStorage
  const entrepriseView = useUiStore((state) => state.entrepriseView);
  const setEntrepriseView = useUiStore((state) => state.setEntrepriseView);

  // Data state
  const [entreprises, setEntreprises] = useState<EntrepriseWithDetails[]>([]);
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

  // Filters state (synchronisés depuis searchParams)
  const [filters, setFilters] = useState<FiltersType>({
    search: searchParams.search,
    role: searchParams.role,
  });

  const pageSize = 30;

  // Compter les filtres actifs
  const activeFiltersCount = [searchParams.search, searchParams.role].filter(
    Boolean,
  ).length;

  // Synchroniser filters avec searchParams quand ils changent
  useEffect(() => {
    setFilters({
      search: searchParams.search,
      role: searchParams.role,
    });
  }, [searchParams.search, searchParams.role]);

  // Initial load — objet searchParams entier comme dépendance (critique pour client-side nav)
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setIsError(false);

      try {
        const result = await getEntreprisesPaginatedAction({
          search: searchParams.search || undefined,
          role: toRoleOrUndefined(searchParams.role),
          orderBy: toOrderBy(searchParams.orderBy),
          orderDir: toOrderDir(searchParams.orderDir),
          page: 1,
          pageSize,
        });

        if (result?.serverError) {
          toast.error(result.serverError.message);
          setIsError(true);
        } else if (result?.data) {
          setEntreprises(result.data.entreprises ?? []);
          setTotal(result.data.total ?? 0);
          setHasMore(result.data.hasMore ?? false);
          setPage(1);
        }
      } catch {
        toast.error("Erreur lors du chargement des entreprises");
        setIsError(true);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
    // CRITIQUE: utiliser l'objet searchParams entier, pas les propriétés individuelles
    // Les propriétés individuelles (undefined) ne changent pas de référence → useEffect ne se re-déclenche pas
  }, [searchParams, posture, entreprise?.id]);

  // Reload (RESET pattern) — utilisé après création
  const loadEntreprises = useCallback(async () => {
    setLoading(true);
    setIsError(false);

    try {
      const result = await getEntreprisesPaginatedAction({
        search: searchParams.search || undefined,
        role: toRoleOrUndefined(searchParams.role),
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: 1,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data) {
        setEntreprises(result.data.entreprises ?? []);
        setTotal(result.data.total ?? 0);
        setHasMore(result.data.hasMore ?? false);
        setPage(1);
      }
    } catch {
      toast.error("Erreur lors du chargement des entreprises");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [
    searchParams.search,
    searchParams.role,
    searchParams.orderBy,
    searchParams.orderDir,
    pageSize,
  ]);

  // Load more — Infinite scroll (APPEND pattern)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isError) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await getEntreprisesPaginatedAction({
        search: searchParams.search || undefined,
        role: toRoleOrUndefined(searchParams.role),
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: nextPage,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data?.entreprises) {
        setEntreprises((prev) => [...prev, ...result.data!.entreprises]);
        setHasMore(result.data.hasMore ?? false);
        setPage(nextPage);
      }
    } catch {
      toast.error("Erreur lors du chargement de plus d'entreprises");
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    page,
    hasMore,
    isLoadingMore,
    isError,
    searchParams.search,
    searchParams.role,
    searchParams.orderBy,
    searchParams.orderDir,
    pageSize,
  ]);

  // Applique les filtres via router.replace() — cohérent avec TicketsTable
  const handleFiltersApply = (newFilters: FiltersType) => {
    setFilters(newFilters);

    const query: Record<string, string> = {};

    // Conserver les paramètres de tri
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;

    // Appliquer les nouveaux filtres
    if (newFilters.search) query.search = newFilters.search;
    if (newFilters.role) query.role = newFilters.role;

    router.replace({ pathname: "/app/entreprises", query }, { scroll: false });
  };

  const handleEntrepriseCreated = () => {
    loadEntreprises();
    setCreateDialogOpen(false);
  };

  // Navigation vers le détail avec préservation des filtres/tri
  const handleRowClick = (entreprise: EntrepriseWithDetails) => {
    const query: Record<string, string> = {};
    if (searchParams.search) query.search = searchParams.search;
    if (searchParams.role) query.role = searchParams.role;
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;

    router.push({
      pathname: "/app/entreprises/[entrepriseId]",
      params: { entrepriseId: entreprise.id },
      query,
    });
  };

  const columns = createEntreprisesColumns();

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header Actions */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        {/* View Toggle */}
        <div
          role="group"
          aria-label="Mode d'affichage"
          className="flex items-center"
        >
          <Button
            variant={entrepriseView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setEntrepriseView("list")}
            className="rounded-r-none border-r-0"
            aria-label="Vue liste"
            aria-pressed={entrepriseView === "list"}
          >
            <List aria-hidden="true" />
          </Button>
          <Button
            variant={entrepriseView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setEntrepriseView("grid")}
            className="rounded-l-none"
            aria-label="Vue grille"
            aria-pressed={entrepriseView === "grid"}
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
          {posture === "plateforme" && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle entreprise
            </Button>
          )}
        </div>
      </div>

      {/* View: Table ou Grid */}
      <div className="flex-1 overflow-hidden">
        {entrepriseView === "list" ? (
          <InfiniteDataTable<EntrepriseWithDetails>
            columns={columns}
            items={entreprises}
            total={total}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            idLabelMap={entreprisesIdLabelMap}
            onRowClick={handleRowClick}
          />
        ) : (
          <EntreprisesGrid
            entreprises={entreprises}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            onEntrepriseClick={handleRowClick}
          />
        )}
      </div>

      {/* Dialogs */}
      <EntrepriseFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleEntrepriseCreated}
      />

      <EntreprisesFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
      />

      <EntreprisesSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams}
      />
    </div>
  );
}
