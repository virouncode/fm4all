"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import type { DevisAvecDetails } from "@/server/queries/devis.query";
import { ColumnDef } from "@tanstack/react-table";
import {
  formatDevisDate,
  getDevisStatutBadge,
} from "./helpers";

export const devisIdLabelMap = new Map<string, string>([
  ["numero", "Numéro"],
  ["titre", "Titre"],
  ["statut", "Statut"],
  ["emetteurEntrepriseNom", "Émetteur"],
  ["proprietaireEntrepriseNom", "Client"],
  ["siteNom", "Site"],
  ["serviceNoms", "Service(s)"],
  ["dateEmission", "Émis le"],
  ["validTo", "Valide jusqu'au"],
  ["createdAt", "Créé le"],
  ["updatedAt", "Modifié le"],
]);

export const createDevisColumns = ({
  hideProprietaire = false,
  hideEmetteur = false,
  hideService = true,
}: { hideProprietaire?: boolean; hideEmetteur?: boolean; hideService?: boolean } = {}): ColumnDef<DevisAvecDetails>[] => {
  const cols: (ColumnDef<DevisAvecDetails> | false)[] = [
  {
    accessorKey: "numero",
    header: ({ column }) => (
      <SortableHeader column={column} label="Numéro" className="w-32" />
    ),
    cell: ({ getValue }) => {
      const numero = getValue() as string | null;
      return (
        <span className="font-mono text-xs font-medium">
          {numero ?? <span className="text-muted-foreground italic">Brouillon</span>}
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
      const statut = getValue() as DevisAvecDetails["statut"];
      const badge = getDevisStatutBadge(statut);
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
  !hideProprietaire && {
    accessorKey: "proprietaireEntrepriseNom",
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
      <span className="text-sm text-muted-foreground">{getValue() as string}</span>
    ),
  },
  !hideService && {
    accessorKey: "serviceNoms",
    header: () => <span className="text-xs font-medium">Service(s)</span>,
    cell: ({ getValue }) => {
      const noms = getValue() as string[];
      return (
        <span className="text-muted-foreground text-sm">
          {noms.length > 0 ? noms.join(", ") : <span className="italic">—</span>}
        </span>
      );
    },
  },
  {
    accessorKey: "dateEmission",
    header: ({ column }) => (
      <SortableHeader column={column} label="Émis le" className="w-28" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatDevisDate(getValue() as Date | null)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "validTo",
    header: ({ column }) => (
      <SortableHeader column={column} label="Valide jusqu'au" className="w-36" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatDevisDate(getValue() as Date | null)}
      </span>
    ),
    size: 140,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column} label="Créé le" className="w-28" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatDevisDate(getValue() as Date)}
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
      <span className="text-sm text-muted-foreground">
        {formatDevisDate(getValue() as Date)}
      </span>
    ),
    size: 110,
  },
];
  return cols.filter((c): c is ColumnDef<DevisAvecDetails> => c !== false);
};
