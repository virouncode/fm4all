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
import {
  getEntreprisesClientesAction,
  getEntreprisesPrestatairesAction,
} from "@/server/actions/entreprisesActions";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type EntrepriseMinimal = { id: string; nom: string };

const filtersSchema = z.object({
  search: z.string().optional(),
  statut: z.string().optional(),
  priorite: z.string().optional(),
  type: z.string().optional(),
  siteId: z.string().optional(),
  proprietaireEntrepriseId: z.string().optional(),
  assigneEntrepriseId: z.string().optional(),
});

type FiltersType = z.infer<typeof filtersSchema>;

interface TicketsFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FiltersType;
  onApply: (filters: FiltersType) => void;
}

export function TicketsFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
}: TicketsFiltersDialogProps) {
  // Posture detection
  const postureActive = useAppStore((state) => state.postureActive);
  const entrepriseId = useAppStore((state) => state.entreprise?.id);

  // Entreprise lists
  const [clientEntreprises, setClientEntreprises] = useState<
    EntrepriseMinimal[]
  >([]);
  const [prestataireEntreprises, setPrestataireEntreprises] = useState<
    EntrepriseMinimal[]
  >([]);

  // Sites state (moved from TicketsTable)
  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  // Convertir les valeurs undefined en "all" pour le formulaire
  const formDefaults = {
    search: currentFilters.search || "",
    statut: currentFilters.statut || "all",
    priorite: currentFilters.priorite || "all",
    type: currentFilters.type || "all",
    siteId: currentFilters.siteId || "all",
    proprietaireEntrepriseId: currentFilters.proprietaireEntrepriseId || "all",
    assigneEntrepriseId: currentFilters.assigneEntrepriseId || "all",
  };

  const form = useForm<FiltersType>({
    resolver: zodResolver(filtersSchema),
    defaultValues: formDefaults,
  });

  // Observer les changements en temps réel
  const filters = useWatch({ control: form.control });
  const debouncedSearch = useDebounce(filters.search, 500);

  // Observer le changement de client pour recharger les sites
  const proprietaireEntrepriseId = useWatch({
    control: form.control,
    name: "proprietaireEntrepriseId",
  });

  // useEffect #1: Load entreprises by posture
  useEffect(() => {
    async function loadEntreprises() {
      try {
        if (postureActive === "plateforme") {
          // Load both clients and prestataires
          const [clientsResult, prestatairesResult] = await Promise.all([
            getEntreprisesClientesAction(),
            getEntreprisesPrestatairesAction(),
          ]);

          if (clientsResult?.data?.clients) {
            setClientEntreprises(clientsResult.data.clients);
          }
          if (prestatairesResult?.data?.prestataires) {
            setPrestataireEntreprises(prestatairesResult.data.prestataires);
          }
        } else if (postureActive === "client") {
          // Load only prestataires
          const result = await getEntreprisesPrestatairesAction();
          if (result?.data?.prestataires) {
            setPrestataireEntreprises(result.data.prestataires);
          }
        } else if (postureActive === "prestataire") {
          // Load only clients
          const result = await getEntreprisesClientesAction();
          if (result?.data?.clients) {
            setClientEntreprises(result.data.clients);
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des entreprises");
      }
    }

    if (postureActive) {
      loadEntreprises();
    }
  }, [postureActive]);

  // useEffect #2: Load initial sites when dialog opens
  useEffect(() => {
    if (!open || !entrepriseId) return;

    async function loadInitialSites() {
      setLoadingSites(true);
      try {
        // Determine target entrepriseId based on posture and filters
        // entrepriseId is guaranteed to be defined by the early return check above
        let targetEntrepriseId = entrepriseId!;

        if (
          (postureActive === "plateforme" || postureActive === "prestataire") &&
          currentFilters.proprietaireEntrepriseId &&
          currentFilters.proprietaireEntrepriseId !== "all"
        ) {
          targetEntrepriseId = currentFilters.proprietaireEntrepriseId;
        }

        const result = await getAccessibleSitesAction({
          entrepriseId: targetEntrepriseId,
        });

        if (result?.serverError) {
          toast.error(result.serverError.message);
        } else if (result?.data) {
          setSites(result.data);
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      } finally {
        setLoadingSites(false);
      }
    }

    loadInitialSites();
  }, [
    open,
    entrepriseId,
    postureActive,
    currentFilters.proprietaireEntrepriseId,
  ]);

  // useEffect #3: Reload sites when client selection changes
  useEffect(() => {
    // Only for plateforme/prestataire postures
    if (postureActive !== "plateforme" && postureActive !== "prestataire")
      return;
    if (!open || !entrepriseId) return;

    async function reloadSites() {
      setLoadingSites(true);
      try {
        // entrepriseId is guaranteed to be defined by the early return check above
        const targetEntrepriseId =
          proprietaireEntrepriseId === "all" || !proprietaireEntrepriseId
            ? entrepriseId!
            : proprietaireEntrepriseId;

        const result = await getAccessibleSitesAction({
          entrepriseId: targetEntrepriseId,
        });

        if (result?.serverError) {
          toast.error(result.serverError.message);
        } else if (result?.data) {
          setSites(result.data);

          // CRITICAL: Reset siteId when client changes
          form.setValue("siteId", "all");
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      } finally {
        setLoadingSites(false);
      }
    }

    reloadSites();
  }, [proprietaireEntrepriseId, postureActive, open, entrepriseId, form]);

  // useEffect #4: Auto-apply filters
  useEffect(() => {
    const cleanedData: FiltersType = {
      search: debouncedSearch || undefined,
      statut: filters.statut === "all" ? undefined : filters.statut,
      priorite: filters.priorite === "all" ? undefined : filters.priorite,
      type: filters.type === "all" ? undefined : filters.type,
      siteId: filters.siteId === "all" ? undefined : filters.siteId,
      proprietaireEntrepriseId:
        filters.proprietaireEntrepriseId === "all"
          ? undefined
          : filters.proprietaireEntrepriseId,
      assigneEntrepriseId:
        filters.assigneEntrepriseId === "all"
          ? undefined
          : filters.assigneEntrepriseId,
    };
    onApply(cleanedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.statut,
    filters.priorite,
    filters.type,
    filters.siteId,
    filters.proprietaireEntrepriseId,
    filters.assigneEntrepriseId,
  ]);

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statut && filters.statut !== "all") count++;
    if (filters.priorite && filters.priorite !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.siteId && filters.siteId !== "all") count++;
    if (
      filters.proprietaireEntrepriseId &&
      filters.proprietaireEntrepriseId !== "all"
    )
      count++;
    if (filters.assigneEntrepriseId && filters.assigneEntrepriseId !== "all")
      count++;
    return count;
  }, [filters]);

  const handleReset = () => {
    form.reset({
      search: "",
      statut: "all",
      priorite: "all",
      type: "all",
      siteId: "all",
      proprietaireEntrepriseId: "all",
      assigneEntrepriseId: "all",
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
              <div className="grid grid-cols-4 gap-4">
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
                  <SelectItem value="en_attente_prestataire">
                    En attente prestataire
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
              </div>

              {/* Ligne 2: 4-column grid for flexible layout */}
              <div className="grid grid-cols-4 gap-4">
                {/* Client Filter - Show for plateforme and prestataire */}
                {(postureActive === "plateforme" ||
                  postureActive === "prestataire") && (
                  <RhfControlledSelect
                    label="Client"
                    name="proprietaireEntrepriseId"
                    className="col-span-1"
                    selectClassName="w-full"
                    withError={false}
                  >
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {clientEntreprises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                )}

                {/* Prestataire Filter - Show for plateforme and client */}
                {(postureActive === "plateforme" ||
                  postureActive === "client") && (
                  <RhfControlledSelect
                    label="Prestataire"
                    name="assigneEntrepriseId"
                    className="col-span-1"
                    selectClassName="w-full"
                    withError={false}
                  >
                    <SelectItem value="all">Tous les prestataires</SelectItem>
                    {prestataireEntreprises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                )}

                <RhfControlledSelect
                  label="Site"
                  name="siteId"
                  className="col-span-1"
                  selectClassName="w-full"
                  withError={false}
                  disabled={loadingSites}
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
