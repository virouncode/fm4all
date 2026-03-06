"use client";

import useIntersection from "@/hooks/use-intersection";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import { Loader2 } from "lucide-react";
import { EntrepriseCard } from "./EntrepriseCard";

type EntreprisesGridProps = {
  entreprises: EntrepriseWithDetails[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onEntrepriseClick?: (entreprise: EntrepriseWithDetails) => void;
  onInvite?: (entreprise: EntrepriseWithDetails) => void;
};

export function EntreprisesGrid({
  entreprises,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  loadMore,
  onEntrepriseClick,
  onInvite,
}: EntreprisesGridProps) {
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

  if (entreprises.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Aucune entreprise trouvée</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch">
        {entreprises.map((entreprise) => (
          <EntrepriseCard
            key={entreprise.id}
            entreprise={entreprise}
            onClick={() => onEntrepriseClick?.(entreprise)}
            onInvite={onInvite ? () => onInvite(entreprise) : undefined}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
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
