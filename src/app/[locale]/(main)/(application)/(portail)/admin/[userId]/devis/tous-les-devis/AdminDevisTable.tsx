"use client";

import DataTable from "@/components/tables/DataTable";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectDevisType } from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { useRouter } from "next/navigation";
import { createAdminDevisColumns } from "./createAdminDevisColumns";

type AdminDevisTableProps = {
  items: SelectDevisType[];
  idLabelMap: Map<string, string>;
  userId: string;
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

const AdminDevisTable = ({
  items,
  idLabelMap,
  userId,
  clients,
  sites,
  fournisseurs,
}: AdminDevisTableProps) => {
  const router = useRouter();

  return (
    <DataTable<SelectDevisType>
      columns={createAdminDevisColumns({ clients, sites, fournisseurs })}
      items={items}
      idLabelMap={idLabelMap}
      onRowClick={(devis) =>
        router.push(`/admin/${userId}/devis/tous-les-devis/${devis.id}`)
      }
    />
  );
};

export default AdminDevisTable;
