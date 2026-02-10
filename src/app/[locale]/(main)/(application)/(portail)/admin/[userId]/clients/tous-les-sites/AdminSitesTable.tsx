"use client";

import { getAllSitesAction } from "@/actions/sitesActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getAllSitesWithPagination } from "@/server/queries_a_classer/sites/getSites";
import { SelectClientType } from "@/zod-schemas/client.schema";
import { AdminSitesQueryBackendType, SelectSiteType } from "@/zod-schemas/site";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminSitesColumns } from "./createAdminSitesColumns";

type AdminSitesTableProps = {
  initialQuery: AdminSitesQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getAllSitesWithPagination>>;
  idLabelMap: Map<string, string>;
  userId: string;
  clients: SelectClientType[];
};

const AdminSitesTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  userId,
  clients,
}: AdminSitesTableProps) => {
  const router = useRouter();
  const t = useTranslations("DevisPage.locaux.locauxForm");

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectSiteType[]>(
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

      const res = await getAllSitesAction({
        ...initialQuery,
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error("Erreur lors du chargement de plus de sites:", res);
        setIsError(true);
        return;
      }

      const data = res.data;

      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (error) {
      console.error("Erreur lors du chargement de plus de sites:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const columns = useMemo(
    () => createAdminSitesColumns({ clients, t }),
    [clients, t],
  );

  const handleRowClick = (site: SelectSiteType) => {
    const siteId = site.id;
    const clientId = site.clientId;
    const redirectUrl = `/admin/${userId}/clients/${clientId}/sites/${siteId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectSiteType>
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

export default AdminSitesTable;
