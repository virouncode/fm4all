"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import { ColumnDef } from "@tanstack/react-table";
import { formatEntrepriseDate, getRoleBadgeStyles } from "./helpers";
import { LogoAvatar } from "./LogoAvatar";

export const entreprisesIdLabelMap = new Map<string, string>([
  ["nom", "Entreprise"],
  ["siret", "SIRET"],
  ["roles", "Rôle(s)"],
  ["contact", "Contact"],
  ["nbSites", "Sites"],
  ["createdAt", "Créé le"],
]);

export const createEntreprisesColumns = (): ColumnDef<EntrepriseWithDetails>[] => [
  {
    accessorKey: "nom",
    header: ({ column }) => (
      <SortableHeader column={column} label="Entreprise" />
    ),
    cell: ({ row }) => {
      const { id, nom, logoStorageKey } = row.original;
      return (
        <div className="flex items-center gap-3">
          <LogoAvatar
            storageKey={logoStorageKey}
            proprietaireEntrepriseId={id}
            nom={nom}
            size="sm"
          />
          <span className="font-medium">{nom}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "siret",
    header: () => <span className="text-sm font-medium">SIRET</span>,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {getValue() as string}
      </span>
    ),
    size: 160,
  },
  {
    accessorKey: "roles",
    header: () => <span className="text-sm font-medium">Rôle(s)</span>,
    cell: ({ getValue }) => {
      const roles = getValue() as string[];
      if (!roles || roles.length === 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            const badge = getRoleBadgeStyles(role as "client" | "prestataire" | "plateforme");
            return (
              <Badge
                key={role}
                variant="outline"
                className={`text-xs ${badge.className}`}
              >
                {badge.label}
              </Badge>
            );
          })}
        </div>
      );
    },
    size: 160,
  },
  {
    id: "contact",
    header: () => <span className="text-sm font-medium">Contact</span>,
    cell: ({ row }) => {
      const { prenomContact, nomContact, emailContact } = row.original;
      const name =
        prenomContact || nomContact
          ? `${prenomContact ?? ""} ${nomContact ?? ""}`.trim()
          : null;
      return (
        <div className="flex flex-col gap-0.5">
          {name && <span className="text-sm font-medium">{name}</span>}
          {emailContact && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {emailContact}
            </span>
          )}
          {!name && !emailContact && (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      );
    },
    size: 220,
  },
  {
    accessorKey: "nbSites",
    header: () => <span className="text-sm font-medium">Sites</span>,
    cell: ({ getValue }) => {
      const nb = getValue() as number;
      return (
        <span className="text-sm text-muted-foreground">
          {nb === 0 ? "—" : `${nb} site${nb > 1 ? "s" : ""}`}
        </span>
      );
    },
    size: 80,
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
          {formatEntrepriseDate(date)}
        </span>
      );
    },
    size: 120,
  },
];
