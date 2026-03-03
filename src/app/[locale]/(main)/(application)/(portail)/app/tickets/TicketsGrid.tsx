"use client";

import useIntersection from "@/hooks/use-intersection";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { Loader2 } from "lucide-react";
import { TicketCard } from "./TicketCard";

type EntrepriseMinimal = { id: string; nom: string };

type TicketsGridProps = {
  tickets: SelectTicketType[];
  sites: SelectSiteType[];
  entreprises: EntrepriseMinimal[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onTicketClick?: (ticket: SelectTicketType) => void;
}

export function TicketsGrid({
  tickets,
  sites,
  entreprises,
  isLoading,
  isLoadingMore,
  isError,
  hasMore,
  loadMore,
  onTicketClick,
}: TicketsGridProps) {
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

  if (tickets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Aucun ticket trouvé</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            sites={sites}
            entreprises={entreprises}
            onClick={() => onTicketClick?.(ticket)}
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
