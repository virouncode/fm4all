"use client";

import { getAllInterventionsAction } from "@/actions/interventionsActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { getAllInterventions } from "@/server/queries_a_classer/interventions/getInterventions";
import { SelectClientType } from "@/zod-schemas/client.schema";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  AdminInterventionsQueryBackendType,
  SelectInterventionType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdminInterventionsColumns } from "./createAdminInterventionsColumns";

type AdminInterventionsTableProps = {
  initialQuery: AdminInterventionsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getAllInterventions>>;
  idLabelMap: Map<string, string>;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  userId: string;
};

const AdminInterventionsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clients,
  sites,
  fournisseurs,
  userId,
}: AdminInterventionsTableProps) => {
  const router = useRouter();

  // --- DATA STATE ---

  const [items, setItems] = useState<SelectInterventionType[]>(
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

      const res = await getAllInterventionsAction({
        ...initialQuery,
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error(
          "Erreur lors du chargement de plus d'interventions:",
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
        "Erreur lors du chargement de plus d'interventions:",
        error,
      );
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (intervention: SelectInterventionType) => {
    const interventionId = intervention.id;
    const redirectUrl = `/admin/${userId}/interventions/${interventionId}`;
    router.push(redirectUrl);
  };

  return (
    <InfiniteDataTable<SelectInterventionType>
      columns={createAdminInterventionsColumns({
        clients,
        sites,
        fournisseurs,
      })}
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

export default AdminInterventionsTable;
