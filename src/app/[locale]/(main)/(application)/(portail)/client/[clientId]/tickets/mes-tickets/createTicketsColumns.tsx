import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import {
  ticketCategorieCT,
  ticketPrioriteCT,
  ticketStatusCT,
  ticketTypeCT,
  toCodeTableName,
} from "@/constants/codeTables";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { SelectTicketType } from "@/zod-schemas/ticket";
import { ColumnDef } from "@tanstack/react-table";

export const ticketsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
  ["categorie", "Catégorie"],
  ["priorite", "Priorité"],
  ["status", "État"],
  ["type", "Type"],
  ["siteId", "Site"],
  ["fournisseurId", "Prestataire"],
  ["titre", "Titre"],
  ["dateCloture", "Date de clôture"],
  ["description", "Description"],
]);

export const createTicketsColumns = ({
  sites,
  fournisseurs,
}: {
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
}): ColumnDef<SelectTicketType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("titre", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.titre,
  },
  {
    accessorKey: "categorie",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("categorie", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.categorie, ticketCategorieCT),
  },
  {
    accessorKey: "priorite",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("priorite", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.priorite, ticketPrioriteCT),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("status", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.status, ticketStatusCT),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("type", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.type, ticketTypeCT),
  },
  {
    accessorKey: "siteId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("siteId", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => sites.find((s) => s.id === row.siteId)?.nomSite || "-",
  },
  {
    accessorKey: "fournisseurId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("fournisseurId", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      fournisseurs.find((f) => f.id === row.fournisseurId)?.nomFournisseur ||
      "-",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", ticketsIdLabelMap)}
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
        label={getColumnLabel("updatedAt", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },

  {
    accessorKey: "dateCloture",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("dateCloture", ticketsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.dateCloture,
    cell: ({ getValue }) => {
      const value = getValue() as Date | null;
      return value ? formatInTimezone(value) : "—";
    },
  },
];
