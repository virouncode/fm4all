"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getFacturesAction } from "@/server/actions/facturesActions";
import type { FactureAvecDetails } from "@/server/queries/factures.query";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import type {
  FactureModeCommercialSnapshotType,
  FactureStatutType,
} from "@/zod-schemas/enums";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createFacturesColumns,
  facturesIdLabelMap,
} from "./createFacturesColumns";
import { FacturesFiltersDialog } from "./FacturesFiltersDialog";
import { FacturesGrid } from "./FacturesGrid";
import { FacturesSortDialog } from "./FacturesSortDialog";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  modeCommercialSnapshot?: string;
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
  modeCommercialSnapshot?: string;
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
  | "dateEcheance"
  | "numero"
  | "titre"
  | "statut"
  | "montantTtc"
  | "siteNom"
  | "emetteurEntrepriseNom"
  | "destinataireEntrepriseNom";

function toOrderBy(value: string | undefined): OrderByType {
  const validValues: OrderByType[] = [
    "createdAt",
    "updatedAt",
    "dateEmission",
    "dateEcheance",
    "numero",
    "titre",
    "statut",
    "montantTtc",
    "siteNom",
    "emetteurEntrepriseNom",
    "destinataireEntrepriseNom",
  ];
  return value && validValues.includes(value as OrderByType)
    ? (value as OrderByType)
    : "createdAt";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" || value === "desc" ? value : "desc";
}

function toStatut(value: string | undefined): FactureStatutType | undefined {
  const valid: FactureStatutType[] = [
    "brouillon",
    "emise",
    "litige",
    "annulee",
  ];
  return value && valid.includes(value as FactureStatutType)
    ? (value as FactureStatutType)
    : undefined;
}

function toModeCommercial(
  value: string | undefined,
): FactureModeCommercialSnapshotType | undefined {
  const valid: FactureModeCommercialSnapshotType[] = [
    "direct",
    "intermediaire",
  ];
  return value && valid.includes(value as FactureModeCommercialSnapshotType)
    ? (value as FactureModeCommercialSnapshotType)
    : undefined;
}

type FacturesTableProps = {
  tabType: "emises" | "recues";
  searchParams: SearchParamsType;
  hideEmetteur: boolean;
  hideDestinataire: boolean;
  canCreate: boolean;
  posture: "client" | "prestataire" | "plateforme";
  sortOptions: SortOptionType[];
};

export function FacturesTable({
  tabType,
  searchParams,
  hideEmetteur,
  hideDestinataire,
  canCreate,
  posture,
  sortOptions,
}: FacturesTableProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const router = useRouter();

  const FactureViewType = useUiStore((state) => state.FactureViewType);
  const setFactureViewType = useUiStore((state) => state.setFactureViewType);

  const [items, setItems] = useState<FactureAvecDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const pageSize = 30;

  const loadFactures = useCallback(async () => {
    if (!entreprise?.id) return;

    setLoading(true);
    setIsError(false);

    try {
      const result = await getFacturesAction({
        entrepriseId: entreprise.id,
        tabType,
        statut: toStatut(searchParams.statut),
        modeCommercialSnapshot: toModeCommercial(
          searchParams.modeCommercialSnapshot,
        ),
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
      toast.error("Erreur lors du chargement des factures");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [entreprise?.id, tabType, searchParams, pageSize]);

  useEffect(() => {
    loadFactures();
  }, [loadFactures]);

  const loadMore = useCallback(async () => {
    if (!entreprise?.id || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const result = await getFacturesAction({
        entrepriseId: entreprise.id,
        tabType,
        statut: toStatut(searchParams.statut),
        modeCommercialSnapshot: toModeCommercial(
          searchParams.modeCommercialSnapshot,
        ),
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
    tabType,
    searchParams,
    page,
    hasMore,
    isLoadingMore,
    items.length,
    pageSize,
  ]);

  const handleFiltersApply = useCallback(
    (filters: FiltersType) => {
      const query: Record<string, string> = { tab: tabType };
      if (filters.search) query.search = filters.search;
      if (filters.statut) query.statut = filters.statut;
      if (filters.modeCommercialSnapshot)
        query.modeCommercialSnapshot = filters.modeCommercialSnapshot;
      if (filters.siteId) query.siteId = filters.siteId;
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.emetteurId) query.emetteurId = filters.emetteurId;
      if (filters.serviceId) query.serviceId = filters.serviceId;
      if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
      if (searchParams.orderDir) query.orderDir = searchParams.orderDir;
      router.replace({ pathname: "/app/factures", query });
    },
    [tabType, searchParams.orderBy, searchParams.orderDir, router],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.search) count++;
    if (searchParams.statut) count++;
    if (searchParams.modeCommercialSnapshot) count++;
    if (searchParams.siteId) count++;
    if (searchParams.clientId) count++;
    if (searchParams.emetteurId) count++;
    if (searchParams.serviceId) count++;
    return count;
  }, [searchParams]);

  const currentFilters: FiltersType = {
    search: searchParams.search,
    statut: searchParams.statut,
    modeCommercialSnapshot: searchParams.modeCommercialSnapshot,
    siteId: searchParams.siteId,
    clientId: searchParams.clientId,
    emetteurId: searchParams.emetteurId,
    serviceId: searchParams.serviceId,
  };

  const columns = createFacturesColumns({ hideEmetteur, hideDestinataire });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between">
        {/* Vue toggle — gauche */}
        <div className="flex items-center rounded-md border">
          <Button
            size="sm"
            variant={FactureViewType === "list" ? "default" : "ghost"}
            className="rounded-r-none border-r"
            onClick={() => setFactureViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={FactureViewType === "grid" ? "default" : "ghost"}
            className="rounded-l-none"
            onClick={() => setFactureViewType("grid")}
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
            <Button
              size="sm"
              onClick={() => router.push("/app/factures/nouveau")}
            >
              <Plus className="h-4 w-4" />
              Nouvelle facture
            </Button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {FactureViewType === "grid" ? (
          <FacturesGrid
            items={items}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            hideEmetteur={hideEmetteur}
            hideDestinataire={hideDestinataire}
            onItemClick={(item) =>
              router.push({
                pathname: "/app/factures/[factureId]",
                params: { factureId: item.id },
              })
            }
          />
        ) : (
          <InfiniteDataTable<FactureAvecDetails>
            columns={columns}
            items={items}
            isLoading={loading}
            isError={isError}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            total={total}
            idLabelMap={facturesIdLabelMap}
            onRowClick={(row) => {
              router.push({
                pathname: "/app/factures/[factureId]",
                params: { factureId: row.id },
              });
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <FacturesFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={currentFilters}
        onApply={handleFiltersApply}
        posture={posture}
        tabType={tabType}
      />
      <FacturesSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams as Record<string, string | undefined>}
        sortOptions={sortOptions}
        tabType={tabType}
      />
    </div>
  );
}
