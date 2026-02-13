"use client";

import DataTable from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { getTicketsAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  TicketPrioriteType,
  TicketStatutType,
  TicketTypeType,
} from "@/zod-schemas/enums";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createTicketsColumns,
  ticketsIdLabelMap,
} from "./createTicketsColumns";
import { TicketFormDialog } from "./TicketFormDialog";
import { TicketsFiltersDialog } from "./TicketsFiltersDialog";

type FiltersType = {
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
};

// Helper pour convertir les filtres string en types enum de manière type-safe
// Les valeurs vides ("") sont converties en undefined
function toEnumOrUndefined<T extends string>(
  value: string | undefined,
): T | undefined {
  return value && value !== "" ? (value as T) : undefined;
}

export function TicketsTable() {
  const entreprise = useAppStore((state) => state.entreprise);

  const [tickets, setTickets] = useState<SelectTicketType[]>([]);
  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination state
  const [filters, setFilters] = useState<FiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  // TODO: Ajouter quand TicketDialog sera créé
  // const [selectedTicket, setSelectedTicket] = useState<SelectTicketType | null>(null);
  // const [dialogMode, setDialogMode] = useState<"view" | "edit" | null>(null);

  // Initial load: sites and tickets
  useEffect(() => {
    if (!entreprise?.id) return;

    async function loadData() {
      if (!entreprise?.id) return;

      setLoading(true);
      try {
        const [sitesResult, ticketsResult] = await Promise.all([
          getAccessibleSitesAction({ entrepriseId: entreprise.id }),
          getTicketsAction({
            entrepriseId: entreprise.id,
            page: 1,
            pageSize,
          }),
        ]);

        if (sitesResult?.serverError) {
          toast.error(sitesResult.serverError.message);
        } else if (sitesResult?.data) {
          setSites(sitesResult.data);
        }

        if (ticketsResult?.serverError) {
          toast.error(ticketsResult.serverError.message);
        } else if (ticketsResult?.data) {
          setTickets(ticketsResult.data.tickets || []);
          setTotal(ticketsResult.data.total || 0);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [entreprise]);

  // Reload tickets when filters or page change
  useEffect(() => {
    if (!entreprise?.id || loading) return;
    loadTickets();
  }, [filters, page]);

  const loadTickets = async () => {
    if (!entreprise?.id) return;

    try {
      const result = await getTicketsAction({
        entrepriseId: entreprise.id,
        search: filters.search || undefined,
        statut: toEnumOrUndefined<TicketStatutType>(filters.statut),
        priorite: toEnumOrUndefined<TicketPrioriteType>(filters.priorite),
        type: toEnumOrUndefined<TicketTypeType>(filters.type),
        siteId: filters.siteId || undefined,
        page,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
      } else if (result?.data) {
        setTickets(result.data.tickets || []);
        setTotal(result.data.total || 0);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tickets");
    }
  };

  // TODO: Ajouter quand TicketDialog sera créé
  // const handleRowClick = (ticket: SelectTicketType) => {
  //   setSelectedTicket(ticket);
  //   setDialogMode("view");
  // };

  // const handleTicketUpdated = () => {
  //   loadTickets();
  //   setDialogMode(null);
  //   setSelectedTicket(null);
  // };

  const handleFiltersApply = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 when filters change
  };

  const handleTicketCreated = () => {
    loadTickets();
    setCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersDialogOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filtrer
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <DataTable
            columns={createTicketsColumns({ sites })}
            items={tickets}
            idLabelMap={ticketsIdLabelMap}
            // TODO: Ajouter onRowClick={handleRowClick} quand TicketDialog sera créé
          />

          {/* Pagination Info */}
          <div className="text-muted-foreground text-sm">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} sur {total}
          </div>
        </>
      )}

      {/* Dialogs */}
      <TicketFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleTicketCreated}
      />

      <TicketsFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        sites={sites}
        onApply={handleFiltersApply}
      />

      {/* TODO: Add TicketDialog for view/edit */}
    </div>
  );
}
