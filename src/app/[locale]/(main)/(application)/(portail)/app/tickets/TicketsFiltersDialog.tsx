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
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  statut: z.string().optional(),
  priorite: z.string().optional(),
  type: z.string().optional(),
  siteId: z.string().optional(),
});

type FiltersType = z.infer<typeof filtersSchema>;

interface TicketsFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FiltersType;
  sites: SelectSiteType[];
  onApply: (filters: FiltersType) => void;
}

export function TicketsFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  sites,
  onApply,
}: TicketsFiltersDialogProps) {
  // Convertir les valeurs undefined en "all" pour le formulaire
  const formDefaults = {
    search: currentFilters.search || "",
    statut: currentFilters.statut || "all",
    priorite: currentFilters.priorite || "all",
    type: currentFilters.type || "all",
    siteId: currentFilters.siteId || "all",
  };

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: formDefaults,
  });

  // Observer les changements en temps réel
  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Appliquer automatiquement les filtres
  useEffect(() => {
    const cleanedData: FiltersType = {
      search: debouncedSearch || undefined,
      statut: filters.statut === "all" ? undefined : filters.statut,
      priorite: filters.priorite === "all" ? undefined : filters.priorite,
      type: filters.type === "all" ? undefined : filters.type,
      siteId: filters.siteId === "all" ? undefined : filters.siteId,
    };
    onApply(cleanedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.statut,
    filters.priorite,
    filters.type,
    filters.siteId,
  ]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.priorite && filters.priorite !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({
      search: "",
      statut: "all",
      priorite: "all",
      type: "all",
      siteId: "all",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-2/3 !max-w-none">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Filter className="text-primary size-6" />
              Filtrer les tickets
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              {/* Ligne 1 */}
              <div className="grid grid-cols-3 gap-4">
                <RhfInput
                  label="Recherche"
                  name="search"
                  placeholder="Titre, description..."
                  className="col-span-1"
                  withError={false}
                />

                <RhfControlledSelect
                  label="Statut"
                  name="statut"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="nouveau">Nouveau</SelectItem>
                  <SelectItem value="pris_en_charge">Pris en charge</SelectItem>
                  <SelectItem value="en_attente_fournisseur">
                    En attente fournisseur
                  </SelectItem>
                  <SelectItem value="en_attente_client">
                    En attente client
                  </SelectItem>
                  <SelectItem value="a_valider">À valider</SelectItem>
                  <SelectItem value="clos">Clos</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                </RhfControlledSelect>

                <RhfControlledSelect
                  label="Priorité"
                  name="priorite"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </RhfControlledSelect>
              </div>

              {/* Ligne 2 */}
              <div className="grid grid-cols-3 gap-4">
                <RhfControlledSelect
                  label="Type"
                  name="type"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="demande">Demande</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </RhfControlledSelect>

                <RhfControlledSelect
                  label="Site"
                  name="siteId"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous les sites</SelectItem>
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
