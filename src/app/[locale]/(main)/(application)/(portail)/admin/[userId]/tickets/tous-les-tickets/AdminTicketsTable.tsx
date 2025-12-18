"use client";

import {
  getAllDevisTicketsAction,
  getAllTicketsAction,
} from "@/actions/ticketsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getAllTickets } from "@/lib/queries/tickets/getTickets";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  AdminTicketsQueryBackendType,
  type SelectTicketType,
} from "@/zod-schemas/ticket";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminTicketsColumns } from "./createAdminTicketsColumns";

type AdminTicketsTableProps = {
  initialQuery: AdminTicketsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getAllTickets>>;
  idLabelMap: Map<string, string>;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  userId: string;
  isDevisTickets?: boolean;
};

const AdminTicketsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clients,
  sites,
  fournisseurs,
  userId,
  isDevisTickets = false,
}: AdminTicketsTableProps) => {
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

      // Utiliser la bonne action selon le type de tickets
      const action = isDevisTickets
        ? getAllDevisTicketsAction
        : getAllTicketsAction;

      const res = await action({
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
      console.error("Erreur lors du chargement de plus de tickets:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery, isDevisTickets]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (ticket: SelectTicketType) => {
    const ticketId = ticket.id;
    // Rediriger vers la page devis ou tickets selon le type
    const redirectUrl = isDevisTickets
      ? `/admin/${userId}/devis/demande/${ticketId}`
      : `/admin/${userId}/tickets/${ticketId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectTicketType>
      columns={createAdminTicketsColumns({ clients, sites, fournisseurs })}
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

export default AdminTicketsTable;
