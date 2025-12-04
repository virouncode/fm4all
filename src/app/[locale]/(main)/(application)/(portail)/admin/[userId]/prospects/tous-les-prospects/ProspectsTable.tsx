"use client";

import { getProspectsAction } from "@/actions/prospectActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getProspects } from "@/lib/queries/prospects/getProspects";

import {
  ProspectsQueryBackendType,
  SelectProspectType,
} from "@/zod-schemas/prospect";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prospectsColumns } from "./prospectsColumns";

type ProspectsTableProps = {
  initialQuery: ProspectsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getProspects>>;
  idLabelMap: Map<string, string>;
  onRowClick?: (prospect: SelectProspectType) => void;
};

const ProspectsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  onRowClick,
}: ProspectsTableProps) => {
  const router = useRouter();
  const { userId } = useParams();

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectProspectType[]>(
    initialData?.items ?? [],
  );
  const [total, setTotal] = useState<number>(initialData?.total ?? 0);
  const [hasMore, setHasMore] = useState<boolean>(
    initialData?.hasMore ?? false,
  );
  const [page, setPage] = useState<number>(initialData?.page ?? 1);

  // --- ÉTATS DE CHARGEMENT / ERREUR ---

  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Quand l'URL change (filtres / tri), le serveur renvoie un NOUVEL `initialData`
  // => on reset la liste et la page
  useEffect(() => {
    if (!initialData) return;
    setItems(initialData.items ?? []);
    setTotal(initialData.total ?? 0);
    setHasMore(initialData.hasMore ?? false);
    setPage(initialData.page ?? 1);
    setIsLoading(false);
    setIsError(false);
  }, [initialData]);

  // --- INFINITE SCROLL: CHARGER LA PAGE SUIVANTE ---

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      setIsError(false);

      const nextPage = page + 1;

      const res = await getProspectsAction({
        ...initialQuery, // filtres + tri courants (dérivés de l'URL)
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error("Erreur lors du chargement de plus de tickets:", res);
        setIsError(true);
        return;
      }

      const data = res.data;

      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (error) {
      console.error("Erreur lors du chargement de plus de tickets:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (prospect: SelectProspectType) => {
    if (onRowClick) {
      onRowClick(prospect);
      return;
    }
    const prospectId = prospect.id;
    router.push(`/admin/${userId}/prospects/${prospectId}`);
  };

  return (
    <InfiniteDataTable<SelectProspectType>
      columns={prospectsColumns}
      items={items}
      isLoading={isLoading}
      isError={isError}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      // pas de tri client: tri géré par l'URL + SSR
      idLabelMap={memoIdLabelMap}
      total={total}
      onRowClick={handleRowClick}
    />
  );
};

export default ProspectsTable;
