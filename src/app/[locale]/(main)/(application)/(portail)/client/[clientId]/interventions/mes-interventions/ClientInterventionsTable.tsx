"use client";

import { getInterventionsAction } from "@/actions/interventionsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getInterventions } from "@/lib/queries/interventions/getInterventions";
import {
  InterventionsQueryBackendType,
  SelectInterventionType,
} from "@/zod-schemas/intervention";
import { SortingState } from "@tanstack/react-table";
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
  // query "courante" côté client
  const [query, setQuery] =
    useState<InterventionsQueryBackendType>(initialQuery);
  const router = useRouter();
  // data
  const [items, setItems] = useState<SelectInterventionType[]>(
    initialData?.items ?? [],
  );
  const [total, setTotal] = useState<number>(initialData?.total ?? 0);
  const [hasMore, setHasMore] = useState<boolean>(
    initialData?.hasMore ?? false,
  );
  const [page, setPage] = useState<number>(
    initialData?.page ?? query.page ?? 1,
  );

  // états
  const [isLoading, setIsLoading] = useState<boolean>(
    initialData ? false : true,
  );
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // sorting TanStack <-> orderBy/orderDir
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!query.orderBy) return [];
    return [
      {
        id: query.orderBy,
        desc: query.orderDir === "desc",
      },
    ];
  });

  useEffect(() => {
    setQuery(initialQuery);
    setItems(initialData?.items ?? []);
    setTotal(initialData?.total ?? 0);
    setHasMore(initialData?.hasMore ?? false);
    setPage(initialData?.page ?? initialQuery.page ?? 1);
    setIsLoading(false);
    setIsError(false);
    // on ne touche pas à sorting ici, ou tu peux aussi le recalculer si tu veux
  }, [initialQuery, initialData]);

  const handleSortingChange: typeof setSorting = (updater) => {
    setSorting((prev) => {
      const nextSorting =
        typeof updater === "function" ? updater(prev) : updater;

      const first = nextSorting[0];

      if (first) {
        const newOrderBy = first.id as InterventionsQueryBackendType["orderBy"];
        const newOrderDir = first.desc ? "desc" : "asc";

        // on met à jour la query locale (sans fetch ici)
        setQuery((prevQuery) => ({
          ...prevQuery,
          orderBy: newOrderBy,
          orderDir: newOrderDir,
          page: 1,
        }));
      }

      return nextSorting;
    });
  };
  useEffect(() => {
    // optionnel : si tu veux éviter un refetch initial quand initialData est déjà là,
    // tu peux ajouter un guard avec un useRef pour skipper le premier run.

    let cancelled = false;

    const fetch = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const res = await getInterventionsAction(query);

        if (cancelled) return;

        if (res.serverError || res.validationErrors || !res.data) {
          console.error("Error fetching interventions:", res);
          setIsError(true);
          return;
        }

        const data = res.data;

        setItems(data.items);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(data.page);
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching interventions:", error);
        setIsError(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [query.orderBy, query.orderDir, query.page]);

  // infinite scroll : charger la page suivante
  const loadMore = useCallback(async () => {
    if (isLoadingMore) return;
    if (!hasMore) return;

    try {
      setIsLoadingMore(true);
      setIsError(false);

      const nextPage = page + 1;

      const result = await getInterventionsAction({
        ...query,
        page: nextPage,
      });
      setItems((prev) => [...prev, ...(result.data?.items ?? [])]);
      setTotal(result.data?.total ?? 0);
      setHasMore(result.data?.hasMore ?? false);
      setPage(result.data?.page ?? 1);
    } catch (error) {
      console.error("Error loading more interventions:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, query]);

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
      sorting={sorting}
      setSorting={handleSortingChange}
      idLabelMap={memoIdLabelMap}
      total={total}
      onRowClick={handleRowClick}
    />
  );
};

export default ClientInterventionsTable;
