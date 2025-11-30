"use client";
import { getSitesAction } from "@/actions/sitesActions";
import DataTable from "@/components/tables/DataTable";
import { getClientSites } from "@/lib/queries/clients/getClients";
import { SelectSiteType, SitesQueryBackendType } from "@/zod-schemas/site";
import { SortingState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sitesColumns } from "./sitesColumns";

type ClientSitesTableProps = {
  initialQuery: SitesQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getClientSites>>;
  idLabelMap: Map<string, string>;
  clientId: number;
};

const ClientSitesTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  clientId,
}: ClientSitesTableProps) => {
  const [query, setQuery] = useState<SitesQueryBackendType>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialData ? false : true,
  );
  const [isError, setIsError] = useState<boolean>(false);
  const [items, setItems] = useState<SelectSiteType[]>(initialData ?? []);
  const router = useRouter();
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
    let cancelled = false;
    const fetch = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const res = await getSitesAction(query);

        if (cancelled) return;

        if (res.serverError || res.validationErrors || !res.data) {
          console.error("Erreur lors de la récupération des sites:", res);
          setIsError(true);
          return;
        }
        setItems(res.data);
      } catch (error) {
        if (cancelled) return;
        console.error("Erreur lors de la récupération des sites:", error);
        setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <DataTable<SelectSiteType>
      columns={sitesColumns}
      items={items}
      isLoading={isLoading}
      isError={isError}
      sorting={sorting}
      setSorting={setSorting}
      idLabelMap={idLabelMap}
      onRowClick={(site) => router.push(`/client/${clientId}/sites/${site.id}`)}
    />
  );
};

export default ClientSitesTable;
