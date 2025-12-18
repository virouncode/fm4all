import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import {
  interventionStatusCT,
  interventionTypeCT,
  toCodeTableName,
} from "@/constants/codeTables";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectInterventionType } from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { ColumnDef } from "@tanstack/react-table";

export const adminInterventionsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["clientId", "Client"],
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

type CreateAdminInterventionsColumnsParams = {
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

export const createAdminInterventionsColumns = ({
  clients,
  sites,
  fournisseurs,
}: CreateAdminInterventionsColumnsParams): ColumnDef<SelectInterventionType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("clientId", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.clientId,
    cell: ({ getValue }) => {
      const clientId = getValue() as number;
      const client = clients.find((c) => c.id === clientId);
      return client?.nomEntreprise ?? clientId.toString();
    },
  },
  {
    accessorKey: "ticketId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("ticketId", adminInterventionsIdLabelMap)}
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
        label={getColumnLabel("dateDebutPrevue", adminInterventionsIdLabelMap)}
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
        label={getColumnLabel("dateFinPrevue", adminInterventionsIdLabelMap)}
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
        label={getColumnLabel("siteId", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.siteId,
    cell: ({ getValue }) => {
      const siteId = getValue() as number;
      const site = sites.find((s) => s.id === siteId);
      return site?.nomSite ?? siteId.toString();
    },
  },
  {
    accessorKey: "fournisseurId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("fournisseurId", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.fournisseurId,
    cell: ({ getValue }) => {
      const fournisseurId = getValue() as number;
      const fournisseur = fournisseurs.find((f) => f.id === fournisseurId);
      return fournisseur?.nomFournisseur ?? fournisseurId.toString();
    },
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("titre", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.titre,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("type", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.type, interventionTypeCT),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("status", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.status, interventionStatusCT),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", adminInterventionsIdLabelMap)}
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
        label={getColumnLabel("updatedAt", adminInterventionsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
];
