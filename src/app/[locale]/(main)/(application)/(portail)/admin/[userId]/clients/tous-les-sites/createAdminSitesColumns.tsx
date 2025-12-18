import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectSiteType } from "@/zod-schemas/site";
import { ColumnDef } from "@tanstack/react-table";

export const adminSitesIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["clientId", "Client"],
  ["nomSite", "Nom du site"],
  ["adresseLigne1", "Adresse ligne 1"],
  ["adresseLigne2", "Adresse ligne 2"],
  ["codePostal", "Code postal"],
  ["ville", "Ville"],
  ["surface", "Surface (m²)"],
  ["effectif", "Effectif"],
  ["typeBatiment", "Type de bâtiment"],
  ["typeOccupation", "Type d'occupation"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

type CreateAdminSitesColumnsParams = {
  clients: SelectClientType[];
  t: (key: string) => string;
};

export const createAdminSitesColumns = ({
  clients,
  t,
}: CreateAdminSitesColumnsParams): ColumnDef<SelectSiteType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("clientId", adminSitesIdLabelMap)}
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
    accessorKey: "nomSite",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomSite", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomSite,
  },
  {
    accessorKey: "adresseLigne1",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("adresseLigne1", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.adresseLigne1,
  },
  {
    accessorKey: "adresseLigne2",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("adresseLigne2", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.adresseLigne2,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ?? "-";
    },
  },
  {
    accessorKey: "codePostal",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("codePostal", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.codePostal,
  },
  {
    accessorKey: "ville",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("ville", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.ville,
  },
  {
    accessorKey: "surface",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("surface", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.surface,
  },
  {
    accessorKey: "effectif",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("effectif", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.effectif,
  },
  {
    accessorKey: "typeBatiment",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typeBatiment", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.typeBatiment,
    cell: ({ getValue }) => {
      const code = getValue() as string;
      const item = typeBatimentCT.find((tb) => tb.code === code);
      return item ? t(item.name) : code;
    },
  },
  {
    accessorKey: "typeOccupation",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typeOccupation", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.typeOccupation,
    cell: ({ getValue }) => {
      const code = getValue() as string;
      const item = typeOccupationCT.find((to) => to.code === code);
      return item ? t(item.name) : code;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", adminSitesIdLabelMap)}
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
        label={getColumnLabel("updatedAt", adminSitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
];
