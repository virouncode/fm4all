import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import {
  interventionStatusCT,
  interventionTypeCT,
  toCodeTableName,
} from "@/constants/codeTables";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectInterventionType } from "@/zod-schemas/intervention";
import { ColumnDef } from "@tanstack/react-table";

export const interventionsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["ticketId", "Ticket ID"],
  ["dateDebutPrevue", "Date de début prévue"],
  ["dateFinPrevue", "Date de fin prévue"],
  ["siteId", "Site"],
  ["fournisseurId", "Prestataire"],
  ["titre", "Titre"],
  ["description", "Description"],
  ["type", "Type"],
  ["status", "État"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const interventionsColumns: ColumnDef<SelectInterventionType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "ticketId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("ticketId", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.ticketId,
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value ? value.toString() : "-";
    },
  },
  {
    accessorKey: "dateDebutPrevue",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("dateDebutPrevue", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.dateDebutPrevue,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
  {
    accessorKey: "dateFinPrevue",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("dateFinPrevue", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.dateFinPrevue,
    cell: ({ getValue }) => {
      const value = getValue() as Date | null;
      return value ? formatInTimezone(value) : "-";
    },
  },
  {
    accessorKey: "siteId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("siteId", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.siteId,
  },
  {
    accessorKey: "fournisseurId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("fournisseurId", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.fournisseurId,
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("titre", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.titre,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("type", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.type, interventionTypeCT),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("status", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.status, interventionStatusCT),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", interventionsIdLabelMap)}
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
        label={getColumnLabel("updatedAt", interventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
];
