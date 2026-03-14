"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import { type PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { type ColumnDef } from "@tanstack/react-table";
import {
  formatDate,
  getFamillePlanificationBadge,
  getModeCommercialBadge,
  getPrestationStatutBadge,
} from "./helpers";

export const prestationsIdLabelMap = new Map<string, string>([
  ["serviceNom", "Service"],
  ["entrepriseNom", "Client"],
  ["siteNom", "Site"],
  ["famillePlanification", "Mode de planification"],
  ["modeCommercial", "Mode commercial"],
  ["statut", "Statut"],
  ["dateDebut", "Date début"],
  ["createdAt", "Créé le"],
  ["updatedAt", "Modifié le"],
]);

export function createPrestationsColumns(
  options: { showEntreprise: boolean },
): ColumnDef<PrestationListItem>[] {
  const columns: ColumnDef<PrestationListItem>[] = [
    {
      accessorKey: "serviceNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Service" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
  ];

  if (options.showEntreprise) {
    columns.push({
      accessorKey: "entrepriseNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Client" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {getValue() as string}
        </span>
      ),
      size: 160,
    });
  }

  columns.push(
    {
      accessorKey: "siteNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Site" sortKey="siteNom" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
      size: 160,
    },
    {
      accessorKey: "famillePlanification",
      header: ({ column }) => (
        <SortableHeader column={column} label="Mode de planification" sortKey="famillePlanification" />
      ),
      cell: ({ getValue }) => {
        const famille = getValue() as PrestationListItem["famillePlanification"];
        const badge = getFamillePlanificationBadge(famille);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 160,
    },
    {
      accessorKey: "modeCommercial",
      header: "Mode commercial",
      cell: ({ getValue }) => {
        const mode = getValue() as PrestationListItem["modeCommercial"];
        const badge = getModeCommercialBadge(mode);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 160,
    },
    {
      accessorKey: "statut",
      header: ({ column }) => (
        <SortableHeader column={column} label="Statut" />
      ),
      cell: ({ getValue }) => {
        const statut = getValue() as PrestationListItem["statut"];
        const badge = getPrestationStatutBadge(statut);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 110,
    },
    {
      accessorKey: "dateDebut",
      header: ({ column }) => (
        <SortableHeader column={column} label="Début" sortKey="dateDebut" />
      ),
      cell: ({ getValue }) => {
        const date = getValue() as Date | null;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        );
      },
      size: 110,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Créé le" sortKey="createdAt" />
      ),
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        );
      },
      size: 110,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Modifié le" sortKey="updatedAt" />
      ),
      cell: ({ getValue }) => {
        const date = getValue() as Date;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        );
      },
      size: 110,
    },
  );

  return columns;
}
