"use client";
import DataTable from "@/components/tables/DataTable";
import { SelectDevisType } from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { useRouter } from "next/navigation";
import { createDevisColumns } from "./createDevisColumns";

type DevisTableProps = {
  items: SelectDevisType[];
  idLabelMap: Map<string, string>;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

const DevisTable = ({
  items,
  idLabelMap,
  clientId,
  sites,
  fournisseurs,
}: DevisTableProps) => {
  const router = useRouter();

  return (
    <DataTable<SelectDevisType>
      columns={createDevisColumns({ sites, fournisseurs })}
      items={items}
      idLabelMap={idLabelMap}
      onRowClick={(devis) =>
        router.push(`/client/${clientId}/devis/mes-devis/${devis.id}`)
      }
    />
  );
};

export default DevisTable;
