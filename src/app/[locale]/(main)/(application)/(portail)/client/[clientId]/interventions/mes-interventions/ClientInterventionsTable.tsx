"use client";

import { getInterventionsAction } from "@/actions/interventionsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getInterventions } from "@/lib/queries/interventions/getInterventions";
import {
  InterventionsQueryBackendType,
  SelectInterventionType,
} from "@/zod-schemas/intervention";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { interventionsColumns } from "./interventionsColumns";

type ClientInterventionsTableProps = {
  initialQuery: InterventionsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getInterventions>>;
  idLabelMap: Map<string, string>;
  clientId: number;
};
const ClientInterventionsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clientId,
}: ClientInterventionsTableProps) => {
  const router = useRouter();
  // data
  const [items, setItems] = useState<SelectInterventionType[]>(
    initialData?.items ?? [],
  );
  const [total, setTotal] = useState<number>(initialData?.total ?? 0);
  const [hasMore, setHasMore] = useState<boolean>(
    initialData?.hasMore ?? false,
  );
  const [page, setPage] = useState<number>(initialData?.page ?? 1);

  // états
  const [isLoading, setIsLoading] = useState<boolean>(
    initialData ? false : true,
  );
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Quand l'URL change (filtres / tri), le serveur renvoie un NOUVEL `initialData`
  // => on reset la liste et la page
  useEffect(() => {
    if (!initialData) return;
    setItems(initialData?.items ?? []);
    setTotal(initialData?.total ?? 0);
    setHasMore(initialData?.hasMore ?? false);
    setPage(initialData?.page ?? 1);
    setIsLoading(false);
    setIsError(false);
  }, [initialData]);

  // --- INFINITE SCROLL: CHARGER LA PAGE SUIVANTE ---

  // infinite scroll : charger la page suivante
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      setIsError(false);

      const nextPage = page + 1;

      const res = await getInterventionsAction({
        ...initialQuery,
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
      console.error("Error loading more interventions:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (intervention: SelectInterventionType) => {
    const interventionId = intervention.id;
    router.push(`/client/${clientId}/interventions/${interventionId}`);
  };

  return (
    <InfiniteDataTable<SelectInterventionType>
      columns={interventionsColumns}
      items={items}
      isLoading={isLoading}
      isError={isError}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      idLabelMap={memoIdLabelMap}
      total={total}
      onRowClick={handleRowClick}
    />
  );
};

export default ClientInterventionsTable;
