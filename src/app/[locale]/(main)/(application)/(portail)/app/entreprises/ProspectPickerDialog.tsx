"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledContent,
  DialogStyledHeader,
  DialogStyledBody,
  DialogStyledFooter,
} from "@/components/ui/dialog-styled";
import { Input } from "@/components/ui/input";
import { getProspectsAction } from "@/server/actions/entreprisesActions";
import type { SelectProspectType } from "@/zod-schemas/entreprise.schema";
import { ColumnDef } from "@tanstack/react-table";
import { Search, UserCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatEntrepriseDate } from "./helpers";

type ProspectPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (prospect: SelectProspectType) => void;
};

const PAGE_SIZE = 20;

const prospectsIdLabelMap = new Map<string, string>([
  ["nomEntreprise", "Entreprise"],
  ["contact", "Contact"],
  ["emailContact", "Email"],
  ["ville", "Ville"],
  ["createdAt", "Date"],
]);

const prospectsColumns: ColumnDef<SelectProspectType>[] = [
  {
    accessorKey: "nomEntreprise",
    header: () => <span className="text-xs font-medium">Entreprise</span>,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    id: "contact",
    header: () => <span className="text-xs font-medium">Contact</span>,
    cell: ({ row }) => {
      const { prenomContact, nomContact } = row.original;
      return (
        <span className="text-sm">
          {prenomContact} {nomContact}
        </span>
      );
    },
    size: 160,
  },
  {
    accessorKey: "emailContact",
    header: () => <span className="text-xs font-medium">Email</span>,
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() as string}</span>
    ),
    size: 200,
  },
  {
    accessorKey: "ville",
    header: () => <span className="text-xs font-medium">Ville</span>,
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue() as string}</span>
    ),
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="text-xs font-medium">Date</span>,
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {formatEntrepriseDate(getValue() as Date)}
      </span>
    ),
    size: 100,
  },
];

export function ProspectPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: ProspectPickerDialogProps) {
  const [prospects, setProspects] = useState<SelectProspectType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(search);
  searchRef.current = search;

  // Debounce de la recherche
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Charger les prospects
  const loadProspects = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await getProspectsAction({
        search: debouncedSearch || undefined,
        orderBy: "nomEntreprise",
        orderDir: "asc",
        page: 1,
        pageSize: PAGE_SIZE,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data) {
        setProspects(result.data.prospects);
        setTotal(result.data.total);
        setHasMore(result.data.hasMore);
        setPage(1);
      }
    } catch {
      toast.error("Erreur lors du chargement des prospects");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  // Charger au premier open et quand la recherche change
  useEffect(() => {
    if (!open) return;
    loadProspects();
  }, [open, loadProspects]);

  // Reset quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      setProspects([]);
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
      setHasMore(false);
      setIsError(false);
    }
  }, [open]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isError) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await getProspectsAction({
        search: searchRef.current || undefined,
        orderBy: "nomEntreprise",
        orderDir: "asc",
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data?.prospects) {
        setProspects((prev) => [...prev, ...result.data!.prospects]);
        setHasMore(result.data.hasMore);
        setPage(nextPage);
      }
    } catch {
      toast.error("Erreur lors du chargement de plus de prospects");
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, isError]);

  const handleRowClick = (prospect: SelectProspectType) => {
    onSelect(prospect);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <UserCheck className="text-primary size-6" />
                Sélectionner un prospect
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Cliquez sur un prospect pour auto-remplir le formulaire.
            {total > 0 && (
              <span className="ml-1 font-medium">{total} prospect{total > 1 ? "s" : ""}</span>
            )}
          </p>

          {/* Barre de recherche */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table infinite scroll */}
          <div className="flex-1 overflow-hidden min-h-[300px]">
            <InfiniteDataTable<SelectProspectType>
              columns={prospectsColumns}
              items={prospects}
              total={total}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              isError={isError}
              hasMore={hasMore}
              loadMore={loadMore}
              idLabelMap={prospectsIdLabelMap}
              onRowClick={handleRowClick}
            />
          </div>
        </DialogStyledBody>

        <DialogStyledFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        </DialogStyledFooter>
      </DialogStyledContent>
    </Dialog>
  );
}
