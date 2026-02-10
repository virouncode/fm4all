"use client";

import { getAllFournisseursAction } from "@/actions/fournisseurAction";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getAllFournisseursWithPagination } from "@/server/queries_a_classer/fournisseurs/getFournisseurs";
import {
  AdminFournisseursQueryBackendType,
  SelectFournisseurType,
} from "@/zod-schemas/fournisseur";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminFournisseursColumns } from "./createAdminFournisseursColumns";

type AdminFournisseursTableProps = {
  initialQuery: AdminFournisseursQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getAllFournisseursWithPagination>>;
  idLabelMap: Map<string, string>;
  userId: string;
};

const AdminFournisseursTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  userId,
}: AdminFournisseursTableProps) => {
  const router = useRouter();

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectFournisseurType[]>(
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

      const res = await getAllFournisseursAction({
        ...initialQuery,
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error(
          "Erreur lors du chargement de plus de fournisseurs:",
          res,
        );
        setIsError(true);
        return;
      }

      const data = res.data;

      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de plus de fournisseurs:",
        error,
      );
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const columns = useMemo(() => createAdminFournisseursColumns(), []);

  const handleRowClick = (fournisseur: SelectFournisseurType) => {
    const fournisseurId = fournisseur.id;
    const redirectUrl = `/admin/${userId}/fournisseurs/${fournisseurId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectFournisseurType>
      columns={columns}
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

export default AdminFournisseursTable;
