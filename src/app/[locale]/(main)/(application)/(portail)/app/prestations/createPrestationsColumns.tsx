"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { type PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  formatDate,
  formatDuree,
  getFrequenceLabel,
  getModePlanningBadge,
  getPrestationStatutBadge,
} from "./helpers";

export const prestationsIdLabelMap = new Map<string, string>([
  ["serviceNom", "Service"],
  ["entrepriseNom", "Client"],
  ["siteNom", "Site"],
  ["frequence", "Fréquence"],
  ["modePlanning", "Mode"],
  ["statut", "Statut"],
  ["dateDebut", "Date début"],
  ["dureeEstimeeMinutes", "Durée"],
]);

type PrestationActions = {
  onEdit: (p: PrestationListItem) => void;
  onChangeStatut: (p: PrestationListItem) => void;
  onDelete: (p: PrestationListItem) => void;
};

export function createPrestationsColumns(
  actions: PrestationActions,
  options: { showEntreprise: boolean },
): ColumnDef<PrestationListItem>[] {
  const columns: ColumnDef<PrestationListItem>[] = [
    {
      accessorKey: "serviceNom",
      header: ({ column }) => (
        <SortableHeader column={column} label="Service" />
      ),
      cell: ({ row }) => (
        <Link
          href={{
            pathname: "/app/prestations/[prestationId]",
            params: { prestationId: row.original.id },
          }}
          className="font-medium hover:underline"
        >
          {row.original.serviceNom}
        </Link>
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        const canDelete = p.statut === "brouillon";
        const canChangeStatut = p.statut !== "termine";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(p)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {canChangeStatut && (
                <DropdownMenuItem onClick={() => actions.onChangeStatut(p)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Changer le statut
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => actions.onDelete(p)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
    },
  );

  return columns;
}
