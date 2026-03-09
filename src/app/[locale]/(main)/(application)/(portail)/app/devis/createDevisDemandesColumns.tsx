"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import type { DevisDemandeAvecDetails } from "@/server/queries/devisDemandes.query";
import { ColumnDef } from "@tanstack/react-table";
import { formatDevisDate, getDevisDemandeStatutBadge } from "./helpers";

export const devisDemandesIdLabelMap = new Map<string, string>([
  ["titre", "Titre"],
  ["statut", "Statut"],
  ["siteNom", "Site"],
  ["serviceNom", "Service"],
  ["devisCount", "Devis reçus"],
  ["createdAt", "Créé le"],
  ["updatedAt", "Modifié le"],
]);

export const createDevisDemandesColumns =
  (): ColumnDef<DevisDemandeAvecDetails>[] => [
    {
      accessorKey: "titre",
      header: ({ column }) => (
        <SortableHeader column={column} label="Titre" />
      ),
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
        const statut = getValue() as DevisDemandeAvecDetails["statut"];
        const badge = getDevisDemandeStatutBadge(statut);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 110,
    },
    {
      accessorKey: "siteNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Site" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "serviceNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Service" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "devisCount",
      header: "Devis reçus",
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return (
          <span className="text-sm font-medium">
            {count > 0 ? (
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            ) : (
              <span className="text-muted-foreground">0</span>
            )}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Créé le" className="w-28" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatDevisDate(getValue() as Date)}
        </span>
      ),
      size: 110,
    },
  ];
