import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import {
  toCodeTableName,
  typeBatimentCT,
  typeOccupationCT,
} from "@/constants/codeTables";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { SelectSiteType, SORTABLE_SITES_COLUMNS } from "@/zod-schemas/site";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

export const sitesIdLabelMap = new Map<
  keyof typeof SORTABLE_SITES_COLUMNS,
  string
>([
  ["id", "ID"],
  ["nomSite", "Nom du site"],
  ["codePostal", "Code postal"],
  ["ville", "Ville"],
  ["surface", "Surface (m²)"],
  ["effectif", "Effectif"],
  ["typeBatiment", "Type de bâtiment"],
  ["typeOccupation", "Type d'occupation"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const createSitesColumns = (
  t: ReturnType<typeof useTranslations>,
): ColumnDef<SelectSiteType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "nomSite",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomSite", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomSite,
  },
  {
    accessorKey: "codePostal",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("codePostal", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.codePostal,
  },
  {
    accessorKey: "ville",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("ville", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.ville,
  },
  {
    accessorKey: "surface",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("surface", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.surface,
  },
  {
    accessorKey: "effectif",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("effectif", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.effectif,
  },
  {
    accessorKey: "typeBatiment",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typeBatiment", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => t(toCodeTableName(row.typeBatiment, typeBatimentCT)),
  },
  {
    accessorKey: "typeOccupation",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typeOccupation", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      t(toCodeTableName(row.typeOccupation, typeOccupationCT)),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", sitesIdLabelMap)}
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
        label={getColumnLabel("updatedAt", sitesIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date;
      return formatInTimezone(value);
    },
  },
];
