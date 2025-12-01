"use client";
import DataTable from "@/components/tables/DataTable";
import { SelectSiteType } from "@/zod-schemas/site";
import { useRouter } from "next/navigation";
import { sitesColumns } from "./sitesColumns";

type ClientSitesTableProps = {
  items: SelectSiteType[];
  idLabelMap: Map<string, string>;
  clientId: number;
};

const ClientSitesTable = ({
  items,
  idLabelMap,
  clientId,
}: ClientSitesTableProps) => {
  const router = useRouter();

  return (
    <DataTable<SelectSiteType>
      columns={sitesColumns}
      items={items}
      idLabelMap={idLabelMap}
      onRowClick={(site) => router.push(`/client/${clientId}/sites/${site.id}`)}
    />
  );
};

export default ClientSitesTable;
