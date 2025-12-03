import { getColumnLabel } from "@/components/tables/getColumnLabel";
import LastNameCell from "@/components/tables/LastNameCell";
import { SortableHeader } from "@/components/tables/SortableHeader";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectUserType } from "@/zod-schemas/user";
import { ColumnDef } from "@tanstack/react-table";

export const clientUsersIdLabelMap = new Map<string, string>([
  ["lastName", "Nom"],
  ["firstName", "Prénom"],
  ["email", "Email"],
  ["phone", "N° de téléphone"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const clientUsersColumns: ColumnDef<SelectUserType>[] = [
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("lastName", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.lastName,
    cell: LastNameCell,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("firstName", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.firstName,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("email", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.email,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("phone", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.phone,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("updatedAt", clientUsersIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.updatedAt),
  },
];
