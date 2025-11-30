"use client";

import { getTicketsAction } from "@/actions/ticketsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getTickets } from "@/lib/queries/tickets/getTickets";
import {
  TicketsQueryBackendType,
  type SelectTicketType,
} from "@/zod-schemas/ticket";
import type { SortingState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ticketsColumns } from "./ticketsColumns";

type TicketsTableProps = {
  initialQuery: TicketsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getTickets>>;
  idLabelMap: Map<string, string>;
  clientId: number;
};

const TicketsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clientId,
}: TicketsTableProps) => {
  // query "courante" côté client
  const [query, setQuery] = useState<TicketsQueryBackendType>(initialQuery);
  const router = useRouter();
  // data
  const [items, setItems] = useState<SelectTicketType[]>(
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

  // callback pour changer le tri (clic sur header tanstack)
  const handleSortingChange: typeof setSorting = (updater) => {
    setSorting((prev) => {
      const nextSorting =
        typeof updater === "function" ? updater(prev) : updater;

      const first = nextSorting[0];

      if (first) {
        const newOrderBy = first.id as TicketsQueryBackendType["orderBy"];
        const newOrderDir = first.desc ? "desc" : "asc";

        // ⚠️ ici : on ne fait QUE mettre à jour la query
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
    // si tu veux éviter un refetch initial inutile tu peux ajouter un guard ici

    let cancelled = false;

    const fetch = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const res = await getTicketsAction(query);

        if (cancelled) return;

        if (res.serverError || res.validationErrors || !res.data) {
          console.error("Erreur lors de la récupération des tickets:", res);
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
        console.error("Erreur lors de la récupération des tickets:", error);
        setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
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

      const result = await getTicketsAction({
        ...query,
        page: nextPage,
      });
      setItems((prev) => [...prev, ...(result.data?.items ?? [])]);
      setTotal(result.data?.total ?? 0);
      setHasMore(result.data?.hasMore ?? false);
      setPage(result.data?.page ?? 1);
    } catch (error) {
      console.error("Erreur lors du chargement de plus de tickets:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, query]);

  // idLabelMap déjà passé en props
  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (ticket: SelectTicketType) => {
    const ticketId = ticket.id;
    router.push(`/client/${clientId}/tickets/${ticketId}`);
  };

  return (
    <InfiniteDataTable<SelectTicketType>
      columns={ticketsColumns}
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

export default TicketsTable;
