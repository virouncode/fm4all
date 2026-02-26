"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getServicesAction } from "@/server/actions/servicesActions";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const filtersSchema = z.object({
  statut: z.string().optional(),
  serviceId: z.string().optional(),
  siteId: z.string().optional(),
});

type PrestationsFiltersType = z.infer<typeof filtersSchema>;

interface PrestationsFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: PrestationsFiltersType;
  onApply: (filters: PrestationsFiltersType) => void;
  /** Client sélectionné dans la barre principale (plateforme uniquement).
   *  Utilisé pour charger les sites du bon client et activer/désactiver le filtre site. */
  clientEntrepriseId?: string;
}

export function PrestationsFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  clientEntrepriseId,
}: PrestationsFiltersDialogProps) {
  const postureActive = useAppStore((state) => state.postureActive);
  const entrepriseId = useAppStore((state) => state.entreprise?.id);

  const [services, setServices] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const form = useForm<PrestationsFiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      statut: currentFilters.statut || "all",
      serviceId: currentFilters.serviceId || "all",
      siteId: currentFilters.siteId || "all",
    },
  });

  const filters = useWatch({ control: form.control });

  // Charger services
  useEffect(() => {
    if (!open) return;

    async function loadServices() {
      const result = await getServicesAction();
      if (result?.data?.services) {
        setServices(result.data.services);
      }
    }
    loadServices();
  }, [open]);

  // Charger sites selon le client sélectionné (prop, depuis la barre principale) ou l'entreprise courante
  useEffect(() => {
    if (!open) return;

    const targetId =
      postureActive === "plateforme" ? clientEntrepriseId || null : entrepriseId;

    if (!targetId) {
      setSites([]);
      return;
    }

    async function loadSites() {
      setLoadingSites(true);
      try {
        const result = await getAccessibleSitesAction({
          entrepriseId: targetId!,
        });
        if (result?.data) {
          const sitesData = Array.isArray(result.data) ? result.data : [];
          setSites(sitesData.map((s) => ({ id: s.id, nom: s.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      }
      setLoadingSites(false);
    }
    loadSites();
  }, [open, clientEntrepriseId, entrepriseId, postureActive]);

  // Reset siteId quand le client change (les sites sont propres à chaque client)
  useEffect(() => {
    form.setValue("siteId", "all");
  }, [clientEntrepriseId, form]);

  // Auto-apply filters
  useEffect(() => {
    const cleaned: PrestationsFiltersType = {
      statut: filters.statut === "all" ? undefined : filters.statut,
      serviceId: filters.serviceId === "all" ? undefined : filters.serviceId,
      siteId: filters.siteId === "all" ? undefined : filters.siteId,
    };
    onApply(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.statut, filters.serviceId, filters.siteId]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.serviceId && filters.serviceId !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({
      statut: "all",
      serviceId: "all",
      siteId: "all",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Filter className="text-primary size-5" />
              Filtrer les prestations
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {/* Statut */}
              <RhfControlledSelect<PrestationsFiltersType>
                name="statut"
                label="Statut"
                selectClassName="w-full"
                withError={false}
              >
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_pause">En pause</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
              </RhfControlledSelect>

              {/* Service */}
              <RhfControlledSelect<PrestationsFiltersType>
                name="serviceId"
                label="Service"
                selectClassName="w-full"
                withError={false}
              >
                <SelectItem value="all">Tous les services</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              {/* Site — disabled si plateforme sans client sélectionné */}
              <RhfControlledSelect<PrestationsFiltersType>
                name="siteId"
                label="Site"
                selectClassName="w-full"
                withError={false}
                disabled={
                  loadingSites ||
                  (postureActive === "plateforme" && !clientEntrepriseId)
                }
              >
                <SelectItem value="all">
                  {loadingSites ? "Chargement..." : "Tous les sites"}
                </SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            </form>
          </Form>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Réinitialiser ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
