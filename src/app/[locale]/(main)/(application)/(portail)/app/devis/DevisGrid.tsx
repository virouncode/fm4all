"use client";

import useIntersection from "@/hooks/use-intersection";
import type { DevisAvecDetails } from "@/server/queries/devis.query";
import { Loader2 } from "lucide-react";
import { DevisCard } from "./DevisCard";

type DevisGridProps = {
  items: DevisAvecDetails[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  hideProprietaire?: boolean;
  onItemClick?: (item: DevisAvecDetails) => void;
};

export function DevisGrid({
  items,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  loadMore,
  hideProprietaire = false,
  onItemClick,
}: DevisGridProps) {
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
        <p className="text-destructive">
          Une erreur est survenue lors du chargement
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Aucun devis trouvé</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="auto-rows-fr grid grid-cols-1 items-stretch gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <DevisCard
            key={item.id}
            devis={item}
            hideProprietaire={hideProprietaire}
            onClick={() => onItemClick?.(item)}
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
