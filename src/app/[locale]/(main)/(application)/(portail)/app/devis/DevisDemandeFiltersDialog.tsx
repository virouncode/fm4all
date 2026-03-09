"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  statut: z.string().optional(),
  siteId: z.string().optional(),
});

type FiltersType = z.infer<typeof filtersSchema>;

type DevisDemandeFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FiltersType;
  onApply: (filters: FiltersType) => void;
};

export function DevisDemandeFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
}: DevisDemandeFiltersDialogProps) {
  const entrepriseId = useAppStore((state) => state.entreprise?.id);

  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      search: currentFilters.search || "",
      statut: currentFilters.statut || "all",
      siteId: currentFilters.siteId || "all",
    },
  });

  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Load sites when dialog opens
  useEffect(() => {
    if (!open || !entrepriseId) return;

    async function loadSites() {
      setLoadingSites(true);
      try {
        const result = await getAccessibleSitesAction({ entrepriseId: entrepriseId! });
        if (result?.data) {
          setSites(result.data.map((s) => ({ id: s.id, nom: s.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      } finally {
        setLoadingSites(false);
      }
    }

    loadSites();
  }, [open, entrepriseId]);

  // Reset form when filters change externally (dialog reopens)
  useEffect(() => {
    if (open) {
      form.reset({
        search: currentFilters.search || "",
        statut: currentFilters.statut || "all",
        siteId: currentFilters.siteId || "all",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-apply on change (debounced search)
  useEffect(() => {
    const cleaned: FiltersType = {
      search: debouncedSearch || undefined,
      statut: filters.statut === "all" ? undefined : filters.statut,
      siteId: filters.siteId === "all" ? undefined : filters.siteId,
    };
    onApply(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.statut, filters.siteId]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({ search: "", statut: "all", siteId: "all" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-2/3 !max-w-none">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Filter className="text-primary size-6" />
              Filtrer les demandes de devis
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <RhfInput
                  label="Recherche"
                  name="search"
                  placeholder="Titre, description…"
                  withError={false}
                />

                <RhfControlledSelect
                  label="Statut"
                  name="statut"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="ouverte">Ouverte</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="cloturee">Clôturée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                  <SelectItem value="archivee">Archivée</SelectItem>
                </RhfControlledSelect>

                <RhfControlledSelect
                  label="Site"
                  name="siteId"
                  selectClassName="w-full"
                  withError={false}
                  disabled={loadingSites}
                >
                  <SelectItem value="all">
                    {loadingSites ? "Chargement…" : "Tous les sites"}
                  </SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nom}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              </div>
            </form>
          </Form>

          <div className="flex items-center justify-end">
            <Button
              type="button"
              onClick={handleReset}
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw />
              Réinitialiser ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
