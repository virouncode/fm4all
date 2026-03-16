"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getDevisAction } from "@/server/actions/devisActions";
import type { DevisAvecDetails } from "@/server/queries/devis.query";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type { DevisStatutType } from "@/zod-schemas/enums";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createDevisColumns, devisIdLabelMap } from "./createDevisColumns";
import { DevisFiltersDialog } from "./DevisFiltersDialog";
import { DevisGrid } from "./DevisGrid";
import { DevisSortDialog } from "./DevisSortDialog";

type SearchParamsType = {
  statut?: string;
  siteId?: string;
  clientId?: string;
  emetteurId?: string;
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
  emetteurId?: string;
  serviceId?: string;
};

type SortOptionType = {
  value: string;
  label: string;
};

type OrderByType =
  | "createdAt"
  | "updatedAt"
  | "dateEmission"
  | "numero"
  | "titre"
  | "statut"
  | "validTo"
  | "siteNom"
  | "emetteurEntrepriseNom"
  | "proprietaireEntrepriseNom";

function toOrderBy(value: string | undefined): OrderByType {
  const validValues: OrderByType[] = [
    "createdAt",
    "updatedAt",
    "dateEmission",
    "numero",
    "titre",
    "statut",
    "validTo",
    "siteNom",
    "emetteurEntrepriseNom",
    "proprietaireEntrepriseNom",
  ];
  return value && validValues.includes(value as OrderByType)
    ? (value as OrderByType)
    : "createdAt";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" || value === "desc" ? value : "desc";
}

function toStatut(value: string | undefined): DevisStatutType | undefined {
  const valid: DevisStatutType[] = ["brouillon", "emis", "signe", "refuse"];
  return value && valid.includes(value as DevisStatutType)
    ? (value as DevisStatutType)
    : undefined;
}

type DevisTableProps = {
  searchParams: SearchParamsType;
  hideProprietaire: boolean;
  hideEmetteur: boolean;
  hideService?: boolean;
  canCreate: boolean;
  posture: "client" | "prestataire" | "plateforme";
  sortOptions: SortOptionType[];
};

export function DevisTable({
  searchParams,
  hideProprietaire,
  hideEmetteur,
  hideService = true,
  canCreate,
  posture,
  sortOptions,
}: DevisTableProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const router = useRouter();

  const DevisViewType = useUiStore((state) => state.DevisViewType);
  const setDevisViewType = useUiStore((state) => state.setDevisViewType);

  const [items, setItems] = useState<DevisAvecDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const pageSize = 30;

  const loadDevis = useCallback(async () => {
    if (!entreprise?.id) return;

    setLoading(true);
    setIsError(false);

    try {
      const result = await getDevisAction({
        entrepriseId: entreprise.id,
        statut: toStatut(searchParams.statut),
        siteId: searchParams.siteId || undefined,
        clientId: searchParams.clientId || undefined,
        emetteurId: searchParams.emetteurId || undefined,
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
      toast.error("Erreur lors du chargement des devis");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [entreprise?.id, searchParams, pageSize]);

  useEffect(() => {
    loadDevis();
  }, [loadDevis]);

  const loadMore = useCallback(async () => {
    if (!entreprise?.id || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const result = await getDevisAction({
        entrepriseId: entreprise.id,
        statut: toStatut(searchParams.statut),
        siteId: searchParams.siteId || undefined,
        clientId: searchParams.clientId || undefined,
        emetteurId: searchParams.emetteurId || undefined,
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
      const query: Record<string, string> = { tab: "propositions" };
      if (filters.search) query.search = filters.search;
      if (filters.statut) query.statut = filters.statut;
      if (filters.siteId) query.siteId = filters.siteId;
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.emetteurId) query.emetteurId = filters.emetteurId;
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
    if (searchParams.emetteurId) count++;
    if (searchParams.serviceId) count++;
    return count;
  }, [searchParams]);

  const currentFilters: FiltersType = {
    search: searchParams.search,
    statut: searchParams.statut,
    siteId: searchParams.siteId,
    clientId: searchParams.clientId,
    emetteurId: searchParams.emetteurId,
    serviceId: searchParams.serviceId,
  };

  const columns = createDevisColumns({
    hideProprietaire,
    hideEmetteur,
    hideService,
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between">
        {/* Vue toggle — gauche */}
        <div className="flex items-center rounded-md border">
          <Button
            size="sm"
            variant={DevisViewType === "list" ? "default" : "ghost"}
            className="rounded-r-none border-r"
            onClick={() => setDevisViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={DevisViewType === "grid" ? "default" : "ghost"}
            className="rounded-l-none"
            onClick={() => setDevisViewType("grid")}
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

          {canCreate && (
            <Button size="sm" onClick={() => router.push("/app/devis/nouveau")}>
              <Plus className="h-4 w-4" />
              Nouveau devis
            </Button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {DevisViewType === "grid" ? (
          <DevisGrid
            items={items}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            hideProprietaire={hideProprietaire}
            hideEmetteur={hideEmetteur}
            onItemClick={(item) =>
              router.push({
                pathname: "/app/devis/[devisId]",
                params: { devisId: item.id },
                query: { tab: "propositions" },
              })
            }
          />
        ) : (
          <InfiniteDataTable<DevisAvecDetails>
            columns={columns}
            items={items}
            isLoading={loading}
            isError={isError}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            total={total}
            idLabelMap={devisIdLabelMap}
            onRowClick={(row) => {
              router.push({
                pathname: "/app/devis/[devisId]",
                params: { devisId: row.id },
                query: { tab: "propositions" },
              });
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <DevisFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={currentFilters}
        onApply={handleFiltersApply}
        posture={posture}
      />
      <DevisSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams as Record<string, string | undefined>}
        sortOptions={sortOptions}
      />
    </div>
  );
}
