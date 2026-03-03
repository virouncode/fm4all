"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import { type PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { type ColumnDef } from "@tanstack/react-table";
import {
  formatDate,
  formatDuree,
  getFrequenceLabel,
  getModeCommercialBadge,
  getModePlanningBadge,
  getPrestationStatutBadge,
} from "./helpers";

export const prestationsIdLabelMap = new Map<string, string>([
  ["serviceNom", "Service"],
  ["entrepriseNom", "Client"],
  ["siteNom", "Site"],
  ["frequence", "Fréquence"],
  ["modePlanning", "Mode"],
  ["modeCommercial", "Mode commercial"],
  ["statut", "Statut"],
  ["dateDebut", "Date début"],
  ["dureeEstimeeMinutes", "Durée"],
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
      accessorKey: "frequence",
      header: "Fréquence",
      cell: ({ row }) => {
        const label = getFrequenceLabel(
          row.original.frequence,
          row.original.frequenceParPeriode,
          row.original.intervalleJours,
        );
        return <span className="text-sm">{label}</span>;
      },
      size: 160,
    },
    {
      accessorKey: "modePlanning",
      header: "Mode",
      cell: ({ getValue }) => {
        const mode = getValue() as PrestationListItem["modePlanning"];
        const badge = getModePlanningBadge(mode);
        return (
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
        );
      },
      size: 120,
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
      accessorKey: "dureeEstimeeMinutes",
      header: "Durée",
      cell: ({ getValue }) => {
        const minutes = getValue() as number | null;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDuree(minutes)}
          </span>
        );
      },
      size: 80,
    },
  );

  return columns;
}
