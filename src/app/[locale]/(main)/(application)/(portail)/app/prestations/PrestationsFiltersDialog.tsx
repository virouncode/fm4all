"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getServicesByPrestataireAction, getServicesAction } from "@/server/actions/servicesActions";
import { getAccessibleSitesAction, getSitesForPrestationAction } from "@/server/actions/sitesActions";
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
  modeCommercial: z.string().optional(),
  famillePlanification: z.string().optional(),
});

type PrestationsFiltersType = z.infer<typeof filtersSchema>;

// Type des filtres "nettoyés" passés au parent (sans sentinel "all")
type AppliedFiltersType = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  modeCommercial?: string;
  famillePlanification?: string;
};

type PrestationsFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: AppliedFiltersType;
  onApply: (filters: AppliedFiltersType) => void;
  /** Client sélectionné dans la barre principale (plateforme et prestataire).
   *  Utilisé pour charger les sites du bon client et activer/désactiver le filtre site. */
  clientEntrepriseId?: string;
  /** ID du prestataire (posture prestataire uniquement). Filtre les services à ceux proposés par ce prestataire. */
  prestataireEntrepriseId?: string;
}

export function PrestationsFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  clientEntrepriseId,
  prestataireEntrepriseId,
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
      modeCommercial: currentFilters.modeCommercial ?? "all",
      famillePlanification: currentFilters.famillePlanification ?? "all",
    },
  });

  const filters = useWatch({ control: form.control });

  // Charger services selon la posture
  useEffect(() => {
    if (!open) return;

    async function loadServices() {
      // Posture prestataire : seulement les services proposés par ce prestataire
      if (prestataireEntrepriseId) {
        const result = await getServicesByPrestataireAction({
          prestataireEntrepriseId,
        });
        if (result?.data?.services) {
          setServices(result.data.services.map((s) => ({ id: s.id, nom: s.nom })));
        }
        return;
      }
      // Autres postures : tous les services du catalogue
      const result = await getServicesAction();
      if (result?.data?.services) {
        setServices(result.data.services);
      }
    }
    loadServices();
  }, [open, prestataireEntrepriseId]);

  // Charger sites selon le client sélectionné
  useEffect(() => {
    if (!open) return;

    // Posture prestataire : sites du client sélectionné (via getSitesForPrestationAction)
    if (postureActive === "prestataire") {
      if (!clientEntrepriseId) {
        setSites([]);
        return;
      }
      async function loadSitesPrestataire() {
        setLoadingSites(true);
        try {
          const result = await getSitesForPrestationAction({
            entrepriseId: clientEntrepriseId!,
            posture: "prestataire",
          });
          if (result?.data?.allSites) {
            setSites(result.data.allSites.map((s) => ({ id: s.id, nom: s.nom })));
          }
        } catch {
          toast.error("Erreur lors du chargement des sites");
        }
        setLoadingSites(false);
      }
      loadSitesPrestataire();
      return;
    }

    // Posture plateforme : sites du client sélectionné
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
    const cleaned: AppliedFiltersType = {
      statut: filters.statut === "all" ? undefined : filters.statut,
      serviceId: filters.serviceId === "all" ? undefined : filters.serviceId,
      siteId: filters.siteId === "all" ? undefined : filters.siteId,
      modeCommercial:
        filters.modeCommercial === "all" ? undefined : filters.modeCommercial,
      famillePlanification:
        filters.famillePlanification === "all" ? undefined : filters.famillePlanification,
    };
    onApply(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.statut,
    filters.serviceId,
    filters.siteId,
    filters.modeCommercial,
    filters.famillePlanification,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.serviceId && filters.serviceId !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    if (filters.modeCommercial && filters.modeCommercial !== "all") count++;
    if (filters.famillePlanification && filters.famillePlanification !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({
      statut: "all",
      serviceId: "all",
      siteId: "all",
      modeCommercial: "all",
      famillePlanification: "all",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="sm:max-w-2xl">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Filter className="text-primary size-5" />
                Filtrer les prestations
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
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

                {/* Mode commercial */}
                <RhfControlledSelect<PrestationsFiltersType>
                  name="modeCommercial"
                  label="Mode commercial"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="intermediaire_fm4all">
                    Intermédiaire FM4ALL
                  </SelectItem>
                </RhfControlledSelect>

                {/* Mode de planification */}
                <RhfControlledSelect<PrestationsFiltersType>
                  name="famillePlanification"
                  label="Mode de planification"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="recurrence_auto">Récurrence auto</SelectItem>
                  <SelectItem value="quota_manuel">Quota manuel</SelectItem>
                  <SelectItem value="ponctuel">Ponctuel</SelectItem>
                </RhfControlledSelect>

                {/* Site — disabled si plateforme sans client sélectionné */}
                <RhfControlledSelect<PrestationsFiltersType>
                  name="siteId"
                  label="Site"
                  selectClassName="w-full"
                  withError={false}
                  disabled={
                    loadingSites ||
                    ((postureActive === "plateforme" || postureActive === "prestataire") && !clientEntrepriseId)
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
                onClick={handleReset}
                disabled={activeFiltersCount === 0}
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser ({activeFiltersCount})
              </Button>
            </div>
          </div>
        </DialogStyledBody>
      </DialogStyledContent>
    </Dialog>
  );
}
