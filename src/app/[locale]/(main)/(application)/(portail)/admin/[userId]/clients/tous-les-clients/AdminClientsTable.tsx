"use client";

import { getAllClientsAction } from "@/actions/clientAction";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getAllClientsWithPagination } from "@/server/queries_a_classer/clients/getClients";
import {
  ClientsQueryBackendType,
  SelectClientType,
} from "@/zod-schemas/client.schema";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminClientsColumns } from "./createAdminClientsColumns";

type AdminClientsTableProps = {
  initialQuery: ClientsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getAllClientsWithPagination>>;
  idLabelMap: Map<string, string>;
  userId: string;
};

const AdminClientsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  userId,
}: AdminClientsTableProps) => {
  const router = useRouter();

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectClientType[]>(
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

      const res = await getAllClientsAction({
        ...initialQuery,
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error("Erreur lors du chargement de plus de clients:", res);
        setIsError(true);
        return;
      }

      const data = res.data;

      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (error) {
      console.error("Erreur lors du chargement de plus de clients:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (client: SelectClientType) => {
    const clientId = client.id;
    const redirectUrl = `/admin/${userId}/clients/${clientId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectClientType>
      columns={createAdminClientsColumns()}
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

export default AdminClientsTable;
