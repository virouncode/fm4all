"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { DevisAvecDetails } from "@/server/queries/devis.query";
import { getDevisAction } from "@/server/actions/devisActions";
import { useAppStore } from "@/stores/application/appStore";
import type { DevisStatutType } from "@/zod-schemas/enums";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createDevisColumns, devisIdLabelMap } from "./createDevisColumns";

type SearchParamsType = {
  statut?: string;
  siteId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type OrderByType =
  | "createdAt"
  | "dateEmission"
  | "numero"
  | "titre"
  | "statut"
  | "validTo";

function toOrderBy(value: string | undefined): OrderByType {
  const validValues: OrderByType[] = [
    "createdAt",
    "dateEmission",
    "numero",
    "titre",
    "statut",
    "validTo",
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
};

export function DevisTable({ searchParams }: DevisTableProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const router = useRouter();

  const [items, setItems] = useState<DevisAvecDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

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
  }, [entreprise?.id, searchParams, page, hasMore, isLoadingMore, items.length, pageSize]);

  const columns = createDevisColumns();

  const canCreate = posture === "prestataire";

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header actions */}
      <div className="flex flex-shrink-0 items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {loading ? "Chargement…" : `${total} devis`}
        </p>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button
              size="sm"
              onClick={() => router.push("/app/devis/nouveau")}
            >
              <Plus className="h-4 w-4" />
              Nouveau devis
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
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
              });
            }}
          />
      </div>
    </div>
  );
}
