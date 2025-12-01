"use client";
import DataTable from "@/components/tables/DataTable";
import { SelectUserType } from "@/zod-schemas/user";
import { useRouter } from "next/navigation";
import { clientUsersColumns } from "./clientUsersColumns";

type ClientUsersTableProps = {
  items: SelectUserType[];
  idLabelMap: Map<string, string>;
  clientId: number;
};

const ClientUsersTable = ({
  items,
  idLabelMap,
  clientId,
}: ClientUsersTableProps) => {
  const router = useRouter();

  return (
    <DataTable<SelectUserType>
      columns={clientUsersColumns}
      items={items}
      idLabelMap={idLabelMap}
      onRowClick={(user) =>
        router.push(`/client/${clientId}/compte/mon-equipe/${user.id}`)
      }
    />
  );
};

export default ClientUsersTable;
