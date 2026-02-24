"use client";

import { getTicketsAction } from "@/server/actions/ticketsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getTickets } from "@/server/queries_a_classer/tickets/getTickets";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  TicketsQueryBackendType,
  type SelectTicketType,
} from "@/zod-schemas/ticket";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createTicketsColumns } from "./createTicketsColumns";

type TicketsTableProps = {
  initialQuery: TicketsQueryBackendType; // filtres + orderBy/orderDir, SANS se soucier de page dans l'URL
  initialData?: Awaited<ReturnType<typeof getTickets>>; // SSR: { items, total, hasMore, page }
  idLabelMap: Map<string, string>;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  isDevisTickets?: boolean;
};

const TicketsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clientId,
  sites,
  fournisseurs,
  isDevisTickets = false,
}: TicketsTableProps) => {
  const router = useRouter();

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectTicketType[]>(
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

      const res = await getTicketsAction({
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

  const handleRowClick = (ticket: SelectTicketType) => {
    const ticketId = ticket.id;
    const redirectUrl = isDevisTickets
      ? `/client/${clientId}/devis/demande/${ticketId}`
      : `/client/${clientId}/tickets/${ticketId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectTicketType>
      columns={createTicketsColumns({ sites, fournisseurs })}
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
      initialHiddenColumns={isDevisTickets ? ["type"] : []}
    />
  );
};

export default TicketsTable;
