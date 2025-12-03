"use client";
import DataTable from "@/components/tables/DataTable";
import { SelectSiteType } from "@/zod-schemas/site";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createSitesColumns } from "./sitesColumns";

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
  const t = useTranslations("DevisPage.locaux.locauxForm");

  return (
    <DataTable<SelectSiteType>
      columns={createSitesColumns(t)}
      items={items}
      idLabelMap={idLabelMap}
      onRowClick={(site) => router.push(`/client/${clientId}/sites/${site.id}`)}
    />
  );
};

export default ClientSitesTable;
