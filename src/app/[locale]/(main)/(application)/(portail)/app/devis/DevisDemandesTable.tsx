"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getDevisDemandesAction } from "@/server/actions/devisDemandesActions";
import type { DevisDemandeAvecDetails } from "@/server/queries/devisDemandes.query";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type { DevisDemandeStatutType } from "@/zod-schemas/enums";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createDevisDemandesColumns,
  devisDemandesIdLabelMap,
} from "./createDevisDemandesColumns";
import { DevisDemandeFiltersDialog } from "./DevisDemandeFiltersDialog";
import { DevisDemandeFormDialog } from "./DevisDemandeFormDialog";
import { DevisDemandeGrid } from "./DevisDemandeGrid";
import { DevisDemandesSortDialog } from "./DevisDemandesSortDialog";

type SearchParamsType = {
  statut?: string;
  siteId?: string;
  clientId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type FiltersType = {
  search?: string;
  statut?: string;
  siteId?: string;
  clientId?: string;
  serviceId?: string;
};

type SortOptionType = {
  value: string;
  label: string;
};

type OrderByDemandeType =
  | "createdAt"
  | "titre"
  | "statut"
  | "updatedAt"
  | "siteNom"
  | "serviceNom"
  | "proprietaireEntrepriseNom";

function toOrderBy(value: string | undefined): OrderByDemandeType {
  const valid: OrderByDemandeType[] = [
    "createdAt",
    "titre",
    "statut",
    "updatedAt",
    "siteNom",
    "serviceNom",
    "proprietaireEntrepriseNom",
  ];
  return value && valid.includes(value as OrderByDemandeType)
    ? (value as OrderByDemandeType)
    : "createdAt";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" || value === "desc" ? value : "desc";
}

function toStatutDemande(
  value: string | undefined,
): DevisDemandeStatutType | undefined {
  const valid: DevisDemandeStatutType[] = [
    "ouverte",
    "en_cours",
    "cloturee",
    "annulee",
    "archivee",
  ];
  return value && valid.includes(value as DevisDemandeStatutType)
    ? (value as DevisDemandeStatutType)
    : undefined;
}

type DevisDemandesTableProps = {
  searchParams: SearchParamsType;
  showNewButton: boolean;
  showClientColumn: boolean;
  showDevisCount: boolean;
  posture: "client" | "prestataire" | "plateforme";
  sortOptions: SortOptionType[];
};

export function DevisDemandesTable({
  searchParams,
  showNewButton,
  showClientColumn,
  showDevisCount,
  posture,
  sortOptions,
}: DevisDemandesTableProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const router = useRouter();

  const DevisDemandeViewType = useUiStore(
    (state) => state.DevisDemandeViewType,
  );
  const setDevisDemandeViewType = useUiStore(
    (state) => state.setDevisDemandeViewType,
  );

  const [items, setItems] = useState<DevisDemandeAvecDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const pageSize = 30;

  const loadDemandes = useCallback(async () => {
    if (!entreprise?.id) return;
    setLoading(true);
    setIsError(false);

    try {
      const result = await getDevisDemandesAction({
        entrepriseId: entreprise.id,
        statut: toStatutDemande(searchParams.statut),
        siteId: searchParams.siteId || undefined,
        clientId: searchParams.clientId || undefined,
        serviceId: searchParams.serviceId || undefined,
        search: searchParams.search || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: 1,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
        return;
      }

      if (result?.data) {
        const { items: newItems, total: newTotal } = result.data;
        setItems(newItems);
        setTotal(newTotal);
        setHasMore(newItems.length < newTotal);
        setPage(1);
      }
    } catch {
      toast.error("Erreur lors du chargement des demandes");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [entreprise?.id, searchParams, pageSize]);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const loadMore = useCallback(async () => {
    if (!entreprise?.id || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const result = await getDevisDemandesAction({
        entrepriseId: entreprise.id,
        statut: toStatutDemande(searchParams.statut),
        siteId: searchParams.siteId || undefined,
        clientId: searchParams.clientId || undefined,
        serviceId: searchParams.serviceId || undefined,
        search: searchParams.search || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: nextPage,
        pageSize,
      });

      if (result?.data) {
        const { items: moreItems, total: moreTotal } = result.data;
        setItems((prev) => [...prev, ...moreItems]);
        setHasMore(items.length + moreItems.length < moreTotal);
        setPage(nextPage);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    entreprise?.id,
    searchParams,
    page,
    hasMore,
    isLoadingMore,
    items.length,
    pageSize,
  ]);

  const handleFiltersApply = useCallback(
    (filters: FiltersType) => {
      const query: Record<string, string> = { tab: "demandes" };
      if (filters.search) query.search = filters.search;
      if (filters.statut) query.statut = filters.statut;
      if (filters.siteId) query.siteId = filters.siteId;
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.serviceId) query.serviceId = filters.serviceId;
      if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
      if (searchParams.orderDir) query.orderDir = searchParams.orderDir;
      router.replace({ pathname: "/app/devis", query });
    },
    [searchParams.orderBy, searchParams.orderDir, router],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.search) count++;
    if (searchParams.statut) count++;
    if (searchParams.siteId) count++;
    if (searchParams.clientId) count++;
    if (searchParams.serviceId) count++;
    return count;
  }, [searchParams]);

  const currentFilters: FiltersType = {
    search: searchParams.search,
    statut: searchParams.statut,
    siteId: searchParams.siteId,
    clientId: searchParams.clientId,
    serviceId: searchParams.serviceId,
  };

  const handleRowClick = (row: DevisDemandeAvecDetails) => {
    router.push({
      pathname: "/app/devis/demandes/[demandeId]",
      params: { demandeId: row.id },
      query: { tab: "demandes" },
    });
  };

  const handleFormSuccess = (demande: DevisDemandeAvecDetails) => {
    setItems((prev) => [demande, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const columns = createDevisDemandesColumns({
    showClient: showClientColumn,
    showDevisCount,
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between">
        {/* Vue toggle — gauche */}
        <div className="flex items-center rounded-md border">
          <Button
            size="sm"
            variant={DevisDemandeViewType === "list" ? "default" : "ghost"}
            className="rounded-r-none border-r"
            onClick={() => setDevisDemandeViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={DevisDemandeViewType === "grid" ? "default" : "ghost"}
            className="rounded-l-none"
            onClick={() => setDevisDemandeViewType("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions — droite */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
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
            size="sm"
            variant="outline"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-4 w-4" />
            Trier
          </Button>

          {showNewButton && (
            <Button size="sm" onClick={() => setFormDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {DevisDemandeViewType === "grid" ? (
          <DevisDemandeGrid
            items={items}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            showClient={showClientColumn}
            showDevisCount={showDevisCount}
            onItemClick={handleRowClick}
          />
        ) : (
          <InfiniteDataTable<DevisDemandeAvecDetails>
            columns={columns}
            items={items}
            isLoading={loading}
            isError={isError}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            total={total}
            idLabelMap={devisDemandesIdLabelMap}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Dialogs */}
      <DevisDemandeFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode="create"
        onSuccess={handleFormSuccess}
      />

      <DevisDemandeFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={currentFilters}
        onApply={handleFiltersApply}
        posture={posture}
      />

      <DevisDemandesSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams as Record<string, string | undefined>}
        sortOptions={sortOptions}
      />
    </div>
  );
}
