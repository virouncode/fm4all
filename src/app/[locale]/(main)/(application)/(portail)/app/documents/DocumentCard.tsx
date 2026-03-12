"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import { Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDocumentDate, formatFileSize, getMimeTypeLabel, getVisibiliteLabel } from "./helpers";

type DocumentCardProps = {
  document: SelectDocumentWithTagsType;
  canWrite: boolean;
  isPartagesTab: boolean;
  onPreview: (doc: SelectDocumentWithTagsType) => void;
  onEdit: (doc: SelectDocumentWithTagsType) => void;
  onDelete: (doc: SelectDocumentWithTagsType) => void;
};

export function DocumentCard({
  document,
  canWrite,
  isPartagesTab,
  onPreview,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    getPresignedReadUrlAction({
      key: document.storageKey,
      proprietaireEntrepriseId: document.proprietaireEntrepriseId,
    })
      .then((result) => {
        if (result?.data?.url) setDownloadUrl(result.data.url);
      })
      .catch(() => null);
  }, [document.storageKey, document.proprietaireEntrepriseId]);

  return (
    <Card className="flex flex-col h-full transition-colors hover:bg-accent/30">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-sm line-clamp-2 break-all">
              {document.titre || document.filename}
            </span>
          </div>
          {!isPartagesTab && (
            <Badge variant="outline" className="text-xs shrink-0">
              {getVisibiliteLabel(document.visibilite)}
            </Badge>
          )}
        </div>

        {isPartagesTab && (
          <p className="text-xs text-muted-foreground">{document.proprietaireEntrepriseNom}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {getMimeTypeLabel(document.mimeType)} · {formatFileSize(document.sizeBytes)}
        </p>
        <p className="text-xs text-muted-foreground">
          Ajouté le {formatDocumentDate(document.createdAt)}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between gap-3 pt-0">
        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag) => (
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
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-auto pt-2 border-t">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Aperçu"
            onClick={() => onPreview(document)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {downloadUrl && (
            <a href={downloadUrl} download={document.filename} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Télécharger">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          )}
          {canWrite && !isPartagesTab && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Modifier"
                onClick={() => onEdit(document)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Supprimer"
                onClick={() => onDelete(document)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
