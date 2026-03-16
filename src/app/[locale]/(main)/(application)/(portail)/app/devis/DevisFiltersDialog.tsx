"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
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
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { getDevisEmetteursAction } from "@/server/actions/devisActions";
import { getEntreprisesClientesAction } from "@/server/actions/entreprisesActions";
import { getServicesByPrestataireAction, getServicesAction } from "@/server/actions/servicesActions";
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
  clientId: z.string().optional(),
  emetteurId: z.string().optional(),
  serviceId: z.string().optional(),
});

type FiltersType = z.infer<typeof filtersSchema>;

type DevisFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FiltersType;
  onApply: (filters: FiltersType) => void;
  posture: "client" | "prestataire" | "plateforme";
};

export function DevisFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  posture,
}: DevisFiltersDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const isPrestataire = posture === "prestataire";
  const showClientFilter = posture === "prestataire" || posture === "plateforme";
  const showEmetteurFilter = posture === "client" || posture === "plateforme";

  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [emetteurs, setEmetteurs] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingEmetteurs, setLoadingEmetteurs] = useState(false);
  const [services, setServices] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      search: currentFilters.search || "",
      statut: currentFilters.statut || "all",
      siteId: currentFilters.siteId || "all",
      clientId: currentFilters.clientId || "all",
      emetteurId: currentFilters.emetteurId || "all",
      serviceId: currentFilters.serviceId || "all",
    },
  });

  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Load clients for prestataire/plateforme posture when dialog opens
  useEffect(() => {
    if (!open || !showClientFilter) return;

    async function loadClients() {
      setLoadingClients(true);
      try {
        const result = await getEntreprisesClientesAction();
        if (result?.data?.clients) {
          setClients(result.data.clients.map((c) => ({ id: c.id, nom: c.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setLoadingClients(false);
      }
    }

    loadClients();
  }, [open, showClientFilter]);

  // Load emetteurs for client/plateforme posture when dialog opens
  useEffect(() => {
    if (!open || !showEmetteurFilter || !entreprise?.id) return;

    async function loadEmetteurs() {
      setLoadingEmetteurs(true);
      try {
        const result = await getDevisEmetteursAction({ entrepriseId: entreprise!.id });
        if (result?.data?.emetteurs) {
          setEmetteurs(result.data.emetteurs.map((e) => ({ id: e.id, nom: e.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des émetteurs");
      } finally {
        setLoadingEmetteurs(false);
      }
    }

    loadEmetteurs();
  }, [open, showEmetteurFilter, entreprise?.id]);

  // Load services when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadServices() {
      setLoadingServices(true);
      try {
        if (isPrestataire && entreprise?.id) {
          const result = await getServicesByPrestataireAction({
            prestataireEntrepriseId: entreprise.id,
          });
          if (result?.data?.services) {
            setServices(result.data.services.map((s) => ({ id: s.id, nom: s.nom })));
          }
        } else {
          const result = await getServicesAction();
          if (result?.data?.services) {
            setServices(result.data.services.map((s) => ({ id: s.id, nom: s.nom })));
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des services");
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [open, isPrestataire, entreprise?.id]);

  // Load sites — client posture: sites de l'entreprise / prestataire|plateforme: sites du client sélectionné
  useEffect(() => {
    const clientId = showClientFilter ? filters.clientId : entreprise?.id;
    if (!open || !clientId || clientId === "all") {
      setSites([]);
      return;
    }

    async function loadSites() {
      setLoadingSites(true);
      try {
        const result = await getAccessibleSitesAction({ entrepriseId: clientId! });
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
  }, [open, showClientFilter, filters.clientId, entreprise?.id]);

  // Reset siteId when client changes (prestataire/plateforme posture)
  const watchedClientId = filters.clientId;
  useEffect(() => {
    if (showClientFilter) {
      form.setValue("siteId", "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClientId, showClientFilter]);

  // Reset form when dialog reopens
  useEffect(() => {
    if (open) {
      form.reset({
        search: currentFilters.search || "",
        statut: currentFilters.statut || "all",
        siteId: currentFilters.siteId || "all",
        clientId: currentFilters.clientId || "all",
        emetteurId: currentFilters.emetteurId || "all",
        serviceId: currentFilters.serviceId || "all",
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
      clientId: filters.clientId === "all" ? undefined : filters.clientId,
      emetteurId: filters.emetteurId === "all" ? undefined : filters.emetteurId,
      serviceId: filters.serviceId === "all" ? undefined : filters.serviceId,
    };
    onApply(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.statut, filters.siteId, filters.clientId, filters.emetteurId, filters.serviceId]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    if (filters.clientId && filters.clientId !== "all") count++;
    if (filters.emetteurId && filters.emetteurId !== "all") count++;
    if (filters.serviceId && filters.serviceId !== "all") count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({ search: "", statut: "all", siteId: "all", clientId: "all", emetteurId: "all", serviceId: "all" });
  };

  const siteSelectDisabled =
    loadingSites ||
    (showClientFilter && (!filters.clientId || filters.clientId === "all"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="!w-2/3 !max-w-none">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Filter className="text-primary size-6" />
                Filtrer les devis
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <div className="space-y-6">
            <Form {...form}>
              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                <RhfInput
                  label="Recherche"
                  name="search"
                  placeholder="Numéro, titre, description…"
                  withError={false}
                />

                <RhfControlledSelect
                  label="Statut"
                  name="statut"
                  selectClassName="w-full"
                  withError={false}
                >
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="emis">Émis</SelectItem>
                  <SelectItem value="signe">Signé</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                </RhfControlledSelect>

                {showEmetteurFilter && (
                  <RhfControlledSelect
                    label="Émetteur"
                    name="emetteurId"
                    selectClassName="w-full"
                    withError={false}
                    disabled={loadingEmetteurs}
                  >
                    <SelectItem value="all">
                      {loadingEmetteurs ? "Chargement…" : "Tous les émetteurs"}
                    </SelectItem>
                    {emetteurs.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                )}

                {showClientFilter && (
                  <RhfControlledSelect
                    label="Client"
                    name="clientId"
                    selectClassName="w-full"
                    withError={false}
                    disabled={loadingClients}
                  >
                    <SelectItem value="all">
                      {loadingClients ? "Chargement…" : "Tous les clients"}
                    </SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                )}

                <RhfControlledSelect
                  label="Site"
                  name="siteId"
                  selectClassName="w-full"
                  withError={false}
                  disabled={siteSelectDisabled}
                >
                  <SelectItem value="all">
                    {loadingSites
                      ? "Chargement…"
                      : showClientFilter && (!filters.clientId || filters.clientId === "all")
                      ? "Sélectionnez un client"
                      : "Tous les sites"}
                  </SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nom}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>

                <RhfControlledSelect
                  label="Service"
                  name="serviceId"
                  selectClassName="w-full"
                  withError={false}
                  disabled={loadingServices}
                >
                  <SelectItem value="all">
                    {loadingServices ? "Chargement…" : "Tous les services"}
                  </SelectItem>
                  {services.map((s) => (
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
        </DialogStyledBody>
      </DialogStyledContent>
    </Dialog>
  );
}
