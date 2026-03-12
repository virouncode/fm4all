"use client";

import { SortableHeader } from "@/components/tables/SortableHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDocumentDate, formatFileSize, getMimeTypeLabel, getVisibiliteLabel } from "./helpers";

export const documentsIdLabelMap = new Map<string, string>([
  ["titre", "Titre"],
  ["filename", "Fichier"],
  ["mimeType", "Type"],
  ["sizeBytes", "Taille"],
  ["proprietaireEntrepriseNom", "Entreprise"],
  ["visibilite", "Visibilité"],
  ["createdAt", "Date d'ajout"],
]);

type CreateDocumentsColumnsParams = {
  canWrite: boolean;
  isPartagesTab: boolean;
  onPreview: (doc: SelectDocumentWithTagsType) => void;
  onEdit: (doc: SelectDocumentWithTagsType) => void;
  onDelete: (doc: SelectDocumentWithTagsType) => void;
};

export const createDocumentsColumns = ({
  canWrite,
  isPartagesTab,
  onPreview,
  onEdit,
  onDelete,
}: CreateDocumentsColumnsParams): ColumnDef<SelectDocumentWithTagsType>[] => [
  {
    accessorKey: "titre",
    header: ({ column }) => <SortableHeader column={column} label="Titre" />,
    cell: ({ row }) => {
      const titre = row.original.titre;
      const filename = row.original.filename;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{titre || filename}</span>
          {titre && titre !== filename && (
            <span className="text-xs text-muted-foreground">{filename}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags.length) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs"
              style={tag.couleur ? { borderColor: tag.couleur, color: tag.couleur } : undefined}
            >
              {tag.nom}
            </Badge>
          ))}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "mimeType",
    header: ({ column }) => <SortableHeader column={column} label="Type" />,
    cell: ({ getValue }) => getMimeTypeLabel(getValue() as string),
    size: 90,
  },
  {
    accessorKey: "sizeBytes",
    header: ({ column }) => <SortableHeader column={column} label="Taille" />,
    cell: ({ getValue }) => formatFileSize(getValue() as number),
    size: 90,
  },
  ...(isPartagesTab
    ? [
        {
          accessorKey: "proprietaireEntrepriseNom",
          header: "Entreprise",
          cell: ({ getValue }: { getValue: () => unknown }) => (
            <span>{getValue() as string}</span>
          ),
          size: 160,
        } as ColumnDef<SelectDocumentWithTagsType>,
      ]
    : []),
  ...(!isPartagesTab
    ? [
        {
          accessorKey: "visibilite",
          header: "Visibilité",
          cell: ({ getValue }: { getValue: () => unknown }) =>
            getVisibiliteLabel(getValue() as "prive" | "public"),
          size: 100,
        } as ColumnDef<SelectDocumentWithTagsType>,
      ]
    : []),
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Date d'ajout" />,
    cell: ({ getValue }) => formatDocumentDate(getValue() as Date),
    size: 120,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const doc = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Aperçu"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(doc);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Download handled via presigned URL in DocumentCard or via action
            }}
            aria-label="Télécharger"
          >
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <span>
                <Download className="h-4 w-4" />
              </span>
            </Button>
          </a>
          {canWrite && !isPartagesTab && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Modifier"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(doc);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Supprimer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    },
    size: 120,
  },
];
