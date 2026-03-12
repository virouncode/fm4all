"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import { Download, FileX } from "lucide-react";
import { useEffect, useState } from "react";
import { formatFileSize, getMimeTypeLabel, isPreviewable } from "./helpers";

type DocumentPreviewDialogProps = {
  document: SelectDocumentWithTagsType | null;
  onOpenChange: (open: boolean) => void;
};

export function DocumentPreviewDialog({
  document,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const open = !!document;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cleanup previous blob URL when document changes
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (!document) {
      setBlobUrl(null);
      setDownloadUrl(null);
      return;
    }

    const canPreview = isPreviewable(document.mimeType);

    async function loadPreview() {
      if (!document) return;
      setLoading(true);
      try {
        const result = await getPresignedReadUrlAction({
          key: document.storageKey,
          proprietaireEntrepriseId: document.proprietaireEntrepriseId,
        });

        if (!result?.data?.url) return;
        const presignedUrl = result.data.url;
        setDownloadUrl(presignedUrl);

        if (!canPreview) return;

        // For PDF/images/video: fetch as blob to avoid CORS issues
        const resp = await fetch(presignedUrl);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch {
        // Preview unavailable — download link still shown
      } finally {
        setLoading(false);
      }
    }

    void loadPreview();
  }, [document]);

  const mimeType = document?.mimeType ?? "";
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const isVideo = mimeType.startsWith("video/");
  const canPreview = isPreviewable(mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-base break-all">
              {document?.titre || document?.filename}
            </DialogTitle>
            {downloadUrl && (
              <a href={downloadUrl} download={document?.filename} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              </a>
            )}
          </div>
          {document && (
            <p className="text-xs text-muted-foreground">
              {getMimeTypeLabel(document.mimeType)} · {formatFileSize(document.sizeBytes)}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground text-sm">Chargement...</p>
            </div>
          )}

          {!loading && canPreview && blobUrl && (
            <>
              {isImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blobUrl}
                  alt={document?.filename}
                  className="max-h-[60vh] w-auto mx-auto rounded-md object-contain"
                />
              )}
              {isPdf && (
                <iframe
                  src={blobUrl}
                  title={document?.filename}
                  className="w-full rounded-md border"
                  style={{ height: "60vh" }}
                />
              )}
              {isVideo && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={blobUrl}
                  controls
                  className="w-full max-h-[60vh] rounded-md"
                />
              )}
            </>
          )}

          {!loading && (!canPreview || !blobUrl) && !loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <FileX className="size-12" />
              <p className="text-sm">Aperçu non disponible</p>
              {downloadUrl && (
                <a href={downloadUrl} download={document?.filename} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Télécharger le fichier
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
