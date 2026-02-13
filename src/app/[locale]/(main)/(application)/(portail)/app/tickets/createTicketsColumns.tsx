"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  formatTicketDate,
  getTicketPrioriteBadge,
  getTicketStatutBadge,
  getTicketTypeLabel,
} from "./helpers";

export const ticketsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["titre", "Titre"],
  ["statut", "Statut"],
  ["priorite", "Priorité"],
  ["type", "Type"],
  ["siteId", "Site"],
  ["createdAt", "Créé le"],
  ["lastActivityAt", "Dernière activité"],
]);

export const createTicketsColumns = ({
  sites,
}: {
  sites: SelectSiteType[];
}): ColumnDef<SelectTicketType>[] => [
  {
    accessorKey: "priorite",
    header: ({ column }) => (
      <SortableHeader column={column} label="Priorité" className="w-24" />
    ),
    cell: ({ getValue }) => {
      const priorite = getValue() as SelectTicketType["priorite"];
      const badge = getTicketPrioriteBadge(priorite);
      return (
        <Badge variant={badge.variant} className="text-xs">
          {badge.label}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "titre",
    header: ({ column }) => <SortableHeader column={column} label="Titre" />,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "statut",
    header: ({ column }) => <SortableHeader column={column} label="Statut" />,
    cell: ({ getValue }) => {
      const statut = getValue() as SelectTicketType["statut"];
      const badge = getTicketStatutBadge(statut);
      return (
        <Badge variant={badge.variant} className="text-xs">
          {badge.label}
        </Badge>
      );
    },
    size: 150,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} label="Type" />,
    cell: ({ getValue }) => {
      const type = getValue() as SelectTicketType["type"];
      return getTicketTypeLabel(type);
    },
    size: 100,
  },
  {
    accessorKey: "siteId",
    header: "Site",
    cell: ({ getValue }) => {
      const siteId = getValue() as string;
      return sites.find((s) => s.id === siteId)?.nom || "-";
    },
  },
  {
    accessorKey: "lastActivityAt",
    header: ({ column }) => (
      <SortableHeader column={column} label="Dernière activité" />
    ),
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return <span className="text-sm">{formatTicketDate(date)}</span>;
    },
    size: 160,
  },
];
