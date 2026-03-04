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
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
});

type FiltersType = z.infer<typeof filtersSchema>;

type EntreprisesFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FiltersType;
  onApply: (filters: FiltersType) => void;
};

export function EntreprisesFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
}: EntreprisesFiltersDialogProps) {
  const formDefaults = {
    search: currentFilters.search || "",
    role: currentFilters.role || "all",
  };

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: formDefaults,
  });

  // Reset form quand le dialog s'ouvre avec les filtres actuels
  useEffect(() => {
    if (open) {
      form.reset({
        search: currentFilters.search || "",
        role: currentFilters.role || "all",
      });
    }
  }, [open, currentFilters.search, currentFilters.role, form]);

  // Observer les changements en temps réel
  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Auto-apply quand les filtres changent
  useEffect(() => {
    const cleanedData: FiltersType = {
      search: debouncedSearch || undefined,
      role: filters.role === "all" ? undefined : filters.role,
    };
    onApply(cleanedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role && filters.role !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({ search: "", role: "all" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Filter className="text-primary size-6" />
              Filtrer les entreprises
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <RhfInput
                  label="Recherche"
                  name="search"
                  placeholder="Nom, SIRET, email..."
                  className="col-span-1"
                  withError={false}
                />

                <RhfControlledSelect
                  label="Rôle"
                  name="role"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="prestataire">Prestataire</SelectItem>
                  <SelectItem value="plateforme">Plateforme</SelectItem>
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
