"use client";

import useIntersection from "@/hooks/use-intersection";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import { Loader2 } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

type DocumentsGridProps = {
  documents: SelectDocumentWithTagsType[];
  canWrite: boolean;
  isPartagesTab: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onPreview: (doc: SelectDocumentWithTagsType) => void;
  onEdit: (doc: SelectDocumentWithTagsType) => void;
  onDelete: (doc: SelectDocumentWithTagsType) => void;
};

export function DocumentsGrid({
  documents,
  canWrite,
  isPartagesTab,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  loadMore,
  onPreview,
  onEdit,
  onDelete,
}: DocumentsGridProps) {
  const { targetRef } = useIntersection({
    isLoading: isLoadingMore,
    hasMore,
    onLoadMore: loadMore,
    rootMargin: "100px",
    threshold: 0.1,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Une erreur est survenue lors du chargement</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Aucun document trouvé</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr items-stretch">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            canWrite={canWrite}
            isPartagesTab={isPartagesTab}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={targetRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
