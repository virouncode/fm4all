import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectClientType } from "@/zod-schemas/client";
import { ColumnDef } from "@tanstack/react-table";

export const adminClientsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["prospectId", "ID Prospect"],
  ["nomEntreprise", "Nom de l'entreprise"],
  ["siret", "SIRET"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const createAdminClientsColumns = (): ColumnDef<SelectClientType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "prospectId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("prospectId", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.prospectId,
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value ? value.toString() : "-";
    },
  },
  {
    accessorKey: "nomEntreprise",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomEntreprise", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomEntreprise,
  },
  {
    accessorKey: "siret",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("siret", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.siret,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ?? "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("updatedAt", adminClientsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
];
