"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { getPrestationsAction } from "@/server/actions/clientServicesActions";
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import { getEntreprisesClientesAction } from "@/server/actions/entreprisesActions";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import {
  type ClientServiceStatutType,
  type ModeCommercialType,
  type PrestationListItem,
  type PrestationsOrderByType,
} from "@/zod-schemas/clientServices.schema";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createPrestationsColumns,
  prestationsIdLabelMap,
} from "./createPrestationsColumns";
import { PrestationCard } from "./PrestationCard";
import { PrestationFormDialog } from "./PrestationFormDialog";
import { PrestationsFiltersDialog } from "./PrestationsFiltersDialog";
import { PrestationsSortDialog } from "./PrestationsSortDialog";

type SearchParams = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  modeCommercial?: string;
  clientEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

// Filtres gérés par le dialog (sans clientEntrepriseId, géré par sélecteur dédié)
type FiltersType = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  modeCommercial?: string;
};

type PrestationsClientProps = {
  searchParams: SearchParams;
}

export default function PrestationsClient({
  searchParams,
}: PrestationsClientProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const router = useRouter();

  // Vue persistée dans localStorage
  const prestationView = useUiStore((state) => state.prestationView);
  const setPrestationView = useUiStore((state) => state.setPrestationView);

  // Données
  const [prestations, setPrestations] = useState<PrestationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Clients (plateforme uniquement)
  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>(
    [],
  );

  // États des dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  // Filtres synchronisés avec searchParams
  const [filters, setFilters] = useState<FiltersType>({
    statut: searchParams.statut,
    serviceId: searchParams.serviceId,
    siteId: searchParams.siteId,
    modeCommercial: searchParams.modeCommercial,
  });

  const showEntreprise = posture === "plateforme";

  // clientEntrepriseId n'est pas dans le dialog filtres → ne compte pas dans activeFiltersCount
  const activeFiltersCount = [
    searchParams.statut,
    searchParams.serviceId,
    searchParams.siteId,
    searchParams.modeCommercial,
  ].filter(Boolean).length;

  // Chargement des clients (plateforme ou prestataire)
  useEffect(() => {
    if (posture === "plateforme") {
      getEntreprisesClientesAction().then((result) => {
        if (result?.data?.clients) setClients(result.data.clients);
      });
    } else if (posture === "prestataire" && entreprise?.id) {
      getMesClientsAction({ entrepriseId: entreprise.id }).then((result) => {
        if (result?.data?.clients) {
          setClients(result.data.clients.map((c) => ({ id: c.id, nom: c.nom })));
        }
      });
    }
  }, [posture, entreprise?.id]);

  // Chargement des prestations
  const loadPrestations = useCallback(async () => {
    const validOrderByValues = ["createdAt", "serviceNom", "siteNom", "statut", "frequence", "dateDebut"];
    const orderByParam = (searchParams.orderBy && validOrderByValues.includes(searchParams.orderBy)
      ? searchParams.orderBy
      : undefined) as PrestationsOrderByType | undefined;
    const orderDirParam = (searchParams.orderDir === "asc" || searchParams.orderDir === "desc"
      ? searchParams.orderDir as "asc" | "desc"
      : undefined);
    const commonFilters = {
      statut: (searchParams.statut as ClientServiceStatutType) || undefined,
      serviceId: searchParams.serviceId || undefined,
      siteId: searchParams.siteId || undefined,
      modeCommercial: (searchParams.modeCommercial as ModeCommercialType) || undefined,
      orderBy: orderByParam,
      orderDir: orderDirParam,
    };

    // Posture prestataire : nécessite un client sélectionné
    if (posture === "prestataire") {
      if (!entreprise?.id) {
        setLoading(false);
        setPrestations([]);
        return;
      }
      setLoading(true);
      setIsError(false);
      try {
        const result = await getPrestationsAction({
          prestataireEntrepriseId: entreprise.id,
          entrepriseId: searchParams.clientEntrepriseId || undefined,
          ...commonFilters,
        });
        if (result?.serverError) {
          toast.error(result.serverError.message);
          setIsError(true);
        } else if (result?.data?.prestations) {
          setPrestations(result.data.prestations);
        }
      } catch {
        toast.error("Erreur lors du chargement des prestations");
        setIsError(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Posture client : toujours son propre entreprise
    if (posture === "client" && !entreprise?.id) {
      setLoading(false);
      setPrestations([]);
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const result = await getPrestationsAction({
        // plateforme : clientEntrepriseId ou undefined (cross-clients)
        // client : son propre entreprise
        entrepriseId: posture === "plateforme"
          ? (searchParams.clientEntrepriseId || undefined)
          : (entreprise?.id || undefined),
        ...commonFilters,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data?.prestations) {
        setPrestations(result.data.prestations);
      }
    } catch {
      toast.error("Erreur lors du chargement des prestations");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [entreprise?.id, posture, searchParams]);

  // Chargement initial + rechargement lors de la navigation
  // Utilise searchParams comme objet (nouvelle référence à chaque navigation) pour détecter les changements
  useEffect(() => {
    loadPrestations();
  }, [entreprise?.id, posture, searchParams]);

  // Sync filters state avec searchParams
  useEffect(() => {
    setFilters({
      statut: searchParams.statut,
      serviceId: searchParams.serviceId,
      siteId: searchParams.siteId,
      modeCommercial: searchParams.modeCommercial,
    });
  }, [searchParams.statut, searchParams.serviceId, searchParams.siteId, searchParams.modeCommercial]);

  const handlePrestationClick = (p: PrestationListItem) => {
    router.push({
      pathname: "/app/prestations/[prestationId]",
      params: { prestationId: p.id },
    });
  };

  const replaceWithParams = (params: Record<string, string>) => {
    router.replace(
      { pathname: "/app/prestations", query: params },
      { scroll: false },
    );
  };

  // Changement de client dans le sélecteur dédié (plateforme et prestataire)
  const handleClientChange = (clientId: string) => {
    const params: Record<string, string> = {};
    if (searchParams.orderBy) params.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) params.orderDir = searchParams.orderDir;
    if (searchParams.statut) params.statut = searchParams.statut;
    if (searchParams.serviceId) params.serviceId = searchParams.serviceId;
    if (searchParams.modeCommercial) params.modeCommercial = searchParams.modeCommercial;
    // Pas de siteId : reset au changement de client (les sites sont propres à chaque client)
    if (clientId !== "all") params.clientEntrepriseId = clientId;
    replaceWithParams(params);
  };

  const handleFiltersApply = (newFilters: FiltersType) => {
    setFilters(newFilters);

    const params: Record<string, string> = {};
    if (searchParams.orderBy) params.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) params.orderDir = searchParams.orderDir;
    if (newFilters.statut) params.statut = newFilters.statut;
    if (newFilters.serviceId) params.serviceId = newFilters.serviceId;
    if (newFilters.siteId) params.siteId = newFilters.siteId;
    if (newFilters.modeCommercial) params.modeCommercial = newFilters.modeCommercial;
    // Préserver le filtre client (géré par le sélecteur dédié, pas le dialog)
    if (searchParams.clientEntrepriseId)
      params.clientEntrepriseId = searchParams.clientEntrepriseId;

    replaceWithParams(params);
  };

  const columns = useMemo(
    () => createPrestationsColumns({ showEntreprise }),
    [showEntreprise],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ==================== SÉLECTEUR CLIENT (plateforme et prestataire) ==================== */}
      {(posture === "plateforme" || posture === "prestataire") && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap text-sm">
            Client :
          </span>
          <Select
            value={searchParams.clientEntrepriseId || "all"}
            onValueChange={handleClientChange}
          >
            <SelectTrigger className="h-8 w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ==================== BARRE D'ACTIONS ==================== */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        {/* Toggle liste / grille */}
        <div
          role="group"
          aria-label="Mode d'affichage"
          className="flex items-center"
        >
          <Button
            variant={prestationView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setPrestationView("list")}
            className="rounded-r-none border-r-0"
            aria-label="Vue liste"
            aria-pressed={prestationView === "list"}
          >
            <List aria-hidden="true" />
          </Button>
          <Button
            variant={prestationView === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setPrestationView("grid")}
            className="rounded-l-none"
            aria-label="Vue grille"
            aria-pressed={prestationView === "grid"}
          >
            <Grid3x3 aria-hidden="true" />
          </Button>
        </div>

        {/* Filtres, tri et création */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filtrer
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-4 w-4" />
            Trier
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </Button>
        </div>
      </div>

      {/* ==================== CONTENU ==================== */}
      <div className="flex-1 overflow-hidden">
        {prestationView === "list" ? (
          <InfiniteDataTable<PrestationListItem>
            columns={columns}
            items={prestations}
            total={prestations.length}
            isLoading={loading}
            isLoadingMore={false}
            isError={isError}
            hasMore={false}
            loadMore={async () => {}}
            idLabelMap={prestationsIdLabelMap}
            getRowId={(row) => row.id}
            onRowClick={handlePrestationClick}
          />
        ) : (
          <PrestationsGrid
            prestations={prestations}
            loading={loading}
            isError={isError}
            showEntreprise={showEntreprise}
            onPrestationClick={handlePrestationClick}
          />
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Création */}
      <PrestationFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          loadPrestations();
          setCreateDialogOpen(false);
        }}
      />

      {/* Filtres */}
      <PrestationsFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
        clientEntrepriseId={searchParams.clientEntrepriseId}
        prestataireEntrepriseId={posture === "prestataire" ? entreprise?.id : undefined}
      />

      {/* Tri */}
      <PrestationsSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
      />
    </div>
  );
}

// ==================== VUE GRILLE ====================

type PrestationsGridProps = {
  prestations: PrestationListItem[];
  loading: boolean;
  isError: boolean;
  showEntreprise: boolean;
  onPrestationClick: (p: PrestationListItem) => void;
}

function PrestationsGrid({
  prestations,
  loading,
  isError,
  showEntreprise,
  onPrestationClick,
}: PrestationsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Une erreur est survenue lors du chargement des prestations.
      </div>
    );
  }

  if (prestations.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Aucune prestation trouvée.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {prestations.map((p) => (
          <PrestationCard
            key={p.id}
            prestation={p}
            showEntreprise={showEntreprise}
            onClick={() => onPrestationClick(p)}
          />
        ))}
      </div>
    </div>
  );
}
