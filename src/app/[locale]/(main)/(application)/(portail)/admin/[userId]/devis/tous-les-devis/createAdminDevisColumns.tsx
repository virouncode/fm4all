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
import { SelectClientType } from "@/zod-schemas/client";
import { SelectDevisType, SORTABLE_DEVIS_COLUMNS } from "@/zod-schemas/devis";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import { ColumnDef } from "@tanstack/react-table";

export const adminDevisIdLabelMap = new Map<
  keyof typeof SORTABLE_DEVIS_COLUMNS | "clientId",
  string
>([
  ["id", "ID"],
  ["clientId", "Client"],
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

export const createAdminDevisColumns = ({
  clients,
  sites,
  fournisseurs,
}: {
  clients: SelectClientType[];
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
}): ColumnDef<SelectDevisType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "clientId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("clientId", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) =>
      clients.find((c) => c.id === row.clientId)?.nomEntreprise || "-",
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("titre", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.titre,
  },
  {
    accessorKey: "typePrix",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("typePrix", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.typePrix, devisTypePrixCT),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("status", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => toCodeTableName(row.status, devisStatusCT),
  },
  {
    accessorKey: "fournisseurId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("fournisseurId", adminDevisIdLabelMap)}
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
        label={getColumnLabel("siteId", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => sites.find((s) => s.id === row.siteId)?.nomSite || "-",
  },
  {
    accessorKey: "totalOneShotHt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("totalOneShotHt", adminDevisIdLabelMap)}
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
        label={getColumnLabel("totalMensuelHt", adminDevisIdLabelMap)}
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
        label={getColumnLabel("totalInstallationHt", adminDevisIdLabelMap)}
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
        label={getColumnLabel("dateValidite", adminDevisIdLabelMap)}
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
        label={getColumnLabel("signedAt", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => (row.signedAt ? formatInTimezone(row.signedAt) : "-"),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("updatedAt", adminDevisIdLabelMap)}
      />
    ),
    accessorFn: (row) => formatInTimezone(row.updatedAt),
  },
];
