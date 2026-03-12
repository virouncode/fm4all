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
import { useRouter } from "@/i18n/navigation";
import { EntrepriseMinimalType } from "@/zod-schemas/documents.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const filtersSchema = z.object({
  search: z.string().optional(),
  visibilite: z.string().optional(),
  partenaireEntrepriseId: z.string().optional(),
});
type FiltersType = z.infer<typeof filtersSchema>;

type SearchParamsType = {
  tab?: string;
  search?: string;
  visibilite?: string;
  tagIds?: string;
  partenaireEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

type DocumentsFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchParams: SearchParamsType;
  isPartagesTab: boolean;
  partners: EntrepriseMinimalType[];
};

export function DocumentsFiltersDialog({
  open,
  onOpenChange,
  searchParams,
  isPartagesTab,
  partners,
}: DocumentsFiltersDialogProps) {
  const router = useRouter();

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      search: searchParams.search || "",
      visibilite: searchParams.visibilite || "all",
      partenaireEntrepriseId: searchParams.partenaireEntrepriseId || "all",
    },
  });

  // Sync form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        search: searchParams.search || "",
        visibilite: searchParams.visibilite || "all",
        partenaireEntrepriseId: searchParams.partenaireEntrepriseId || "all",
      });
    }
  }, [open, searchParams.search, searchParams.visibilite, searchParams.partenaireEntrepriseId, form]);

  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Auto-apply filters into the URL (like TicketsFiltersDialog)
  useEffect(() => {
    const query: Record<string, string> = {};

    // Preserve non-filter params
    if (searchParams.tab) query.tab = searchParams.tab;
    if (searchParams.tagIds) query.tagIds = searchParams.tagIds;
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;

    if (debouncedSearch) query.search = debouncedSearch;
    if (filters.visibilite && filters.visibilite !== "all") query.visibilite = filters.visibilite;
    if (
      filters.partenaireEntrepriseId &&
      filters.partenaireEntrepriseId !== "all"
    ) {
      query.partenaireEntrepriseId = filters.partenaireEntrepriseId;
    }

    router.replace({ pathname: "/app/documents", query }, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.visibilite, filters.partenaireEntrepriseId]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.visibilite && filters.visibilite !== "all") count++;
    if (filters.partenaireEntrepriseId && filters.partenaireEntrepriseId !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({ search: "", visibilite: "all", partenaireEntrepriseId: "all" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="text-primary size-5" />
            Filtrer les documents
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form className="flex flex-col gap-4">
              {/* Search */}
              <RhfInput
                label="Recherche"
                name="search"
                placeholder="Titre, nom de fichier..."
                withError={false}
              />

              {/* Visibilité (only "Mes documents" tab) */}
              {!isPartagesTab && (
                <RhfControlledSelect
                  label="Visibilité"
                  name="visibilite"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="prive">Privé</SelectItem>
                  <SelectItem value="public">Partagé</SelectItem>
                </RhfControlledSelect>
              )}

              {/* Partner filter (only "Documents partagés" tab) */}
              {isPartagesTab && partners.length > 0 && (
                <RhfControlledSelect
                  label="Entreprise partenaire"
                  name="partenaireEntrepriseId"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nom}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}
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
