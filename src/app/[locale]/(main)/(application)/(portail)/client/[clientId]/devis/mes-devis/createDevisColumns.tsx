import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import {
  devisStatusCT,
  devisTypePrixCT,
  toCodeTableName,
} from "@/constants/codeTables";
import { RATIO } from "@/constants/constants";
import { formatInTimezone } from "@/lib/utils/formatDates";
import { formatNumber } from "@/lib/utils/formatNumber";
import { SelectDevisType, SORTABLE_DEVIS_COLUMNS } from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { ColumnDef } from "@tanstack/react-table";

export const devisIdLabelMap = new Map<
  keyof typeof SORTABLE_DEVIS_COLUMNS,
  string
>([
  ["id", "ID"],
  ["titre", "Titre"],
  ["typePrix", "Type"],
  ["status", "Etat"],
  ["fournisseurId", "Prestataire"],
  ["siteId", "Site"],
  ["totalOneShotHt", "Total One Shot HT"],
  ["totalMensuelHt", "Total Mensuel HT"],
  ["totalInstallationHt", "Total Installation HT"],
  ["dateValidite", "Date de validité"],
  ["signedAt", "Date de signature"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const createDevisColumns = ({
  sites,
  fournisseurs,
}: {
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
}): ColumnDef<SelectDevisType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("titre", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.titre,
  },
  {
    accessorKey: "typePrix",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typePrix", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.typePrix, devisTypePrixCT),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("status", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.status, devisStatusCT),
  },
  {
    accessorKey: "fournisseurId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("fournisseurId", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      fournisseurs.find((f) => f.id === row.fournisseurId)?.nomFournisseur ||
      "-",
  },
  {
    accessorKey: "siteId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("siteId", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => sites.find((s) => s.id === row.siteId)?.nomSite || "-",
  },
  {
    accessorKey: "totalOneShotHt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("totalOneShotHt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      row.totalOneShotHt ? formatNumber(row.totalOneShotHt / RATIO) : "-",
  },
  {
    accessorKey: "totalMensuelHt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("totalMensuelHt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      row.totalMensuelHt ? formatNumber(row.totalMensuelHt / RATIO) : "-",
  },
  {
    accessorKey: "totalInstallationHt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("totalInstallationHt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      row.totalInstallationHt
        ? formatNumber(row.totalInstallationHt / RATIO)
        : "-",
  },
  {
    accessorKey: "dateValidite",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("dateValidite", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      row.dateValidite ? formatInTimezone(row.dateValidite) : "-",
  },
  {
    accessorKey: "signedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("signedAt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => (row.signedAt ? formatInTimezone(row.signedAt) : "-"),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("updatedAt", devisIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.updatedAt),
  },
];
