"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import type { FactureAvecDetails } from "@/server/queries/factures.query";
import type { FactureStatutType } from "@/zod-schemas/enums";
import { ColumnDef } from "@tanstack/react-table";
import { formatFactureDate, formatMontantTtc, getFactureStatutBadge } from "./helpers";

export const facturesIdLabelMap = new Map<string, string>([
  ["numero", "Numéro"],
  ["titre", "Titre"],
  ["statut", "Statut"],
  ["emetteurEntrepriseNom", "Émetteur"],
  ["destinataireEntrepriseNom", "Client"],
  ["siteNom", "Site"],
  ["dateEmission", "Émis le"],
  ["dateEcheance", "Échéance"],
  ["montantTtc", "Montant TTC"],
  ["createdAt", "Créé le"],
  ["updatedAt", "Modifié le"],
]);

export const createFacturesColumns = ({
  hideEmetteur = false,
  hideDestinataire = false,
}: {
  hideEmetteur?: boolean;
  hideDestinataire?: boolean;
} = {}): ColumnDef<FactureAvecDetails>[] => {
  const cols: (ColumnDef<FactureAvecDetails> | false)[] = [
    {
      accessorKey: "numero",
      header: ({ column }) => (
        <SortableHeader column={column} label="Numéro" className="w-32" />
      ),
      cell: ({ getValue }) => {
        const numero = getValue() as string | null;
        return (
          <span className="font-mono text-xs font-medium">
            {numero ?? (
              <span className="text-muted-foreground italic">Brouillon</span>
            )}
          </span>
        );
      },
      size: 130,
    },
    {
      accessorKey: "titre",
      header: ({ column }) => <SortableHeader column={column} label="Titre" />,
      cell: ({ getValue }) => (
        <span className="line-clamp-1 font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "statut",
      header: ({ column }) => (
        <SortableHeader column={column} label="Statut" className="w-28" />
      ),
      cell: ({ getValue }) => {
        const statut = getValue() as FactureStatutType;
        const badge = getFactureStatutBadge(statut);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 110,
    },
    !hideEmetteur && {
      accessorKey: "emetteurEntrepriseNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Émetteur" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    !hideDestinataire && {
      accessorKey: "destinataireEntrepriseNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Client" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "siteNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Site" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {(getValue() as string | null) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "montantTtc",
      header: ({ column }) => (
        <SortableHeader column={column} label="Montant TTC" className="w-36" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-medium">
          {formatMontantTtc(getValue() as number | null)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "dateEmission",
      header: ({ column }) => (
        <SortableHeader column={column} label="Émis le" className="w-28" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatFactureDate(getValue() as Date | null)}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "dateEcheance",
      header: ({ column }) => (
        <SortableHeader column={column} label="Échéance" className="w-28" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatFactureDate(getValue() as Date | null)}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Créé le" className="w-28" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatFactureDate(getValue() as Date)}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Modifié le" className="w-28" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatFactureDate(getValue() as Date)}
        </span>
      ),
      size: 110,
    },
  ];
  return cols.filter((c): c is ColumnDef<FactureAvecDetails> => c !== false);
};
