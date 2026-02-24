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

type EntrepriseMinimal = { id: string; nom: string };

export const ticketsIdLabelMap = new Map<string, string>([
  ["id", "ID"],
  ["titre", "Titre"],
  ["statut", "Statut"],
  ["priorite", "Priorité"],
  ["type", "Type"],
  ["siteId", "Site"],
  ["createdAt", "Créé le"],
  ["proprietaireEntrepriseId", "Client/Propriétaire"],
  ["demandeurEntrepriseId", "Demandeur"],
  ["assigneEntrepriseId", "Assigné à"],
  ["lastActivityAt", "Dernière activité"],
]);

export const createTicketsColumns = ({
  sites,
  entreprises,
}: {
  sites: SelectSiteType[];
  entreprises: EntrepriseMinimal[];
}): ColumnDef<SelectTicketType>[] => [
  {
    accessorKey: "titre",
    header: ({ column }) => <SortableHeader column={column} label="Titre" />,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "priorite",
    header: ({ column }) => (
      <SortableHeader column={column} label="Priorité" className="w-24" />
    ),
    cell: ({ getValue }) => {
      const priorite = getValue() as SelectTicketType["priorite"];
      const badge = getTicketPrioriteBadge(priorite);
      return (
        <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "statut",
    header: ({ column }) => <SortableHeader column={column} label="Statut" />,
    cell: ({ getValue }) => {
      const statut = getValue() as SelectTicketType["statut"];
      const badge = getTicketStatutBadge(statut);
      return (
        <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
      );
    },
    size: 150,
  },

  {
    accessorKey: "proprietaireEntrepriseId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Client/Propriétaire"
        sortKey="proprietaireEntrepriseNom"
      />
    ),
    cell: ({ getValue }) => {
      const entrepriseId = getValue() as string;
      return entreprises.find((e) => e.id === entrepriseId)?.nom || "-";
    },
    size: 180,
  },
  {
    accessorKey: "siteId",
    header: ({ column }) => (
      <SortableHeader column={column} label="Site" sortKey="siteNom" />
    ),
    cell: ({ getValue }) => {
      const siteId = getValue() as string;
      return sites.find((s) => s.id === siteId)?.nom || "-";
    },
    size: 160,
  },
  {
    accessorKey: "demandeurEntrepriseId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Demandeur"
        sortKey="demandeurEntrepriseNom"
      />
    ),
    cell: ({ getValue }) => {
      const entrepriseId = getValue() as string | null;
      if (!entrepriseId) return "-";
      return entreprises.find((e) => e.id === entrepriseId)?.nom || "-";
    },
    size: 180,
  },
  {
    accessorKey: "assigneEntrepriseId",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Assigné à"
        sortKey="assigneEntrepriseNom"
      />
    ),
    cell: ({ getValue }) => {
      const entrepriseId = getValue() as string | null;
      if (!entrepriseId)
        return <span className="text-muted-foreground">Non assigné</span>;
      return entreprises.find((e) => e.id === entrepriseId)?.nom || "-";
    },
    size: 180,
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
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Créé le" />,
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return <span className="text-sm">{formatTicketDate(date)}</span>;
    },
    size: 120,
  },
];
