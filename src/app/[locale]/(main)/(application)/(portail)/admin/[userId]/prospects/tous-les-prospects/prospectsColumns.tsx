import { getColumnLabel } from "@/components/tables/getColumnLabel";
import { SortableHeader } from "@/components/tables/SortableHeader";
import { formatInTimezone, formatIsoInTimezone } from "@/lib/utils/formatDates";
import { SelectProspectType } from "@/zod-schemas/prospect";
import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";

export const prospectsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["nomEntreprise", "Nom de l'entreprise"],
  ["siret", "SIRET"],
  ["nomContact", "Nom du contact"],
  ["prenomContact", "Prénom du contact"],
  ["emailContact", "Email du contact"],
  ["phoneContact", "N° tél du contact"],
  ["prenomSignataire", "Prénom du signataire"],
  ["nomSignataire", "Nom du signataire"],
  ["emailSignataire", "Email du signataire"],
  ["codePostal", "Code postal"],
  ["ville", "Ville"],
  ["dateDeDemarrage", "Date de démarrage"],
  ["createdAt", "Date de création"],
  ["updatedAt", "Dernière mise à jour"],
]);

export const prospectsColumns: ColumnDef<SelectProspectType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("id", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.id,
  },
  {
    accessorKey: "nomEntreprise",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomEntreprise", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomEntreprise ?? "—",
  },
  {
    accessorKey: "siret",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("siret", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.siret ?? "—",
  },
  {
    accessorKey: "nomContact",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomContact", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomContact ?? "—",
  },
  {
    accessorKey: "prenomContact",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("prenomContact", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.prenomContact ?? "—",
  },
  {
    accessorKey: "emailContact",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("emailContact", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.emailContact ?? "—",
  },
  {
    accessorKey: "phoneContact",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("phoneContact", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.phoneContact ?? "-",
  },
  {
    accessorKey: "nomSignataire",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("nomSignataire", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.nomSignataire ?? "—",
  },
  {
    accessorKey: "prenomSignataire",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("prenomSignataire", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.prenomSignataire ?? "—",
  },

  {
    accessorKey: "codePostal",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("codePostal", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.codePostal,
  },
  {
    accessorKey: "ville",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("ville", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.ville,
  },
  {
    accessorKey: "dateDeDemarrage",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("dateDeDemarrage", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.dateDeDemarrage,
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? formatIsoInTimezone(value, DateTime.DATE_SHORT) : "—";
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("createdAt", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.createdAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date | null;
      return value ? formatInTimezone(value) : "—";
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label={getColumnLabel("updatedAt", prospectsIdLabelMap)}
      />
    ),
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => {
      const value = getValue() as Date | null;
      return value ? formatInTimezone(value) : "—";
    },
  },
];
