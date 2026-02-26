"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  deletePrestationAction,
  getPrestationsAction,
} from "@/server/actions/clientServicesActions";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import {
  type ClientServiceStatutType,
  type PrestationListItem,
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
import { PrestationStatutDialog } from "./PrestationStatutDialog";
import { PrestationsFiltersDialog } from "./PrestationsFiltersDialog";
import { PrestationsSortDialog } from "./PrestationsSortDialog";

type SearchParams = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  clientEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

type FiltersType = {
  statut?: string;
  serviceId?: string;
  siteId?: string;
  clientEntrepriseId?: string;
};

interface PrestationsClientProps {
  searchParams: SearchParams;
}

export default function PrestationsClient({
  searchParams,
}: PrestationsClientProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const router = useRouter();
  const pathname = usePathname();

  // Vue persistée dans localStorage
  const prestationView = useUiStore((state) => state.prestationView);
  const setPrestationView = useUiStore((state) => state.setPrestationView);

  // Données
  const [prestations, setPrestations] = useState<PrestationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // États des dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPrestation, setEditingPrestation] =
    useState<PrestationListItem | null>(null);
  const [statutPrestation, setStatutPrestation] =
    useState<PrestationListItem | null>(null);
  const [deletingPrestation, setDeletingPrestation] =
    useState<PrestationListItem | null>(null);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtres synchronisés avec searchParams
  const [filters, setFilters] = useState<FiltersType>({
    statut: searchParams.statut,
    serviceId: searchParams.serviceId,
    siteId: searchParams.siteId,
    clientEntrepriseId: searchParams.clientEntrepriseId,
  });

  const showEntreprise = posture === "plateforme";

  const activeFiltersCount = [
    searchParams.statut,
    searchParams.serviceId,
    searchParams.siteId,
    searchParams.clientEntrepriseId,
  ].filter(Boolean).length;

  // En posture plateforme, cibler le client filtré (ou l'entreprise FM4ALL par défaut)
  const targetEntrepriseId = useMemo(() => {
    if (posture === "plateforme") {
      return searchParams.clientEntrepriseId || entreprise?.id || "";
    }
    return entreprise?.id || "";
  }, [posture, entreprise?.id, searchParams.clientEntrepriseId]);

  // Chargement des prestations
  const loadPrestations = useCallback(async () => {
    if (!targetEntrepriseId) {
      setLoading(false);
      setPrestations([]);
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const result = await getPrestationsAction({
        entrepriseId: targetEntrepriseId,
        statut: (searchParams.statut as ClientServiceStatutType) || undefined,
        serviceId: searchParams.serviceId || undefined,
        siteId: searchParams.siteId || undefined,
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
  }, [
    targetEntrepriseId,
    searchParams.statut,
    searchParams.serviceId,
    searchParams.siteId,
  ]);

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
      clientEntrepriseId: searchParams.clientEntrepriseId,
    });
  }, [
    searchParams.statut,
    searchParams.serviceId,
    searchParams.siteId,
    searchParams.clientEntrepriseId,
  ]);

  const handleFiltersApply = (newFilters: FiltersType) => {
    setFilters(newFilters);

    const query: Record<string, string> = {};
    if (searchParams.orderBy) query.orderBy = searchParams.orderBy;
    if (searchParams.orderDir) query.orderDir = searchParams.orderDir;
    if (newFilters.statut) query.statut = newFilters.statut;
    if (newFilters.serviceId) query.serviceId = newFilters.serviceId;
    if (newFilters.siteId) query.siteId = newFilters.siteId;
    if (newFilters.clientEntrepriseId)
      query.clientEntrepriseId = newFilters.clientEntrepriseId;

    // @ts-expect-error - next-intl router typing issue
    router.replace({ pathname, query }, { scroll: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPrestation) return;

    setIsDeleting(true);
    try {
      const result = await deletePrestationAction({
        prestationId: deletingPrestation.id,
        entrepriseId: deletingPrestation.entrepriseId,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
      } else if (result?.data) {
        toast.success(result.data.message);
        setPrestations((prev) =>
          prev.filter((p) => p.id !== deletingPrestation.id),
        );
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setDeletingPrestation(null);
    }
  };

  const columns = useMemo(
    () =>
      createPrestationsColumns(
        {
          onEdit: setEditingPrestation,
          onChangeStatut: setStatutPrestation,
          onDelete: setDeletingPrestation,
        },
        { showEntreprise },
      ),
    [showEntreprise],
  );

  return (
    <div className="flex h-full flex-col gap-4">
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
          />
        ) : (
          <PrestationsGrid
            prestations={prestations}
            loading={loading}
            isError={isError}
            showEntreprise={showEntreprise}
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

      {/* Édition */}
      <PrestationFormDialog
        open={!!editingPrestation}
        onOpenChange={(v) => {
          if (!v) setEditingPrestation(null);
        }}
        onSuccess={() => {
          loadPrestations();
          setEditingPrestation(null);
        }}
        prestation={editingPrestation ?? undefined}
      />

      {/* Changement de statut */}
      {statutPrestation && (
        <PrestationStatutDialog
          open={!!statutPrestation}
          onOpenChange={(v) => {
            if (!v) setStatutPrestation(null);
          }}
          prestation={statutPrestation}
          onSuccess={() => {
            loadPrestations();
            setStatutPrestation(null);
          }}
        />
      )}

      {/* Filtres */}
      <PrestationsFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
      />

      {/* Tri */}
      <PrestationsSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
      />

      {/* Confirmation de suppression */}
      <AlertDialog
        open={!!deletingPrestation}
        onOpenChange={(v) => {
          if (!v) setDeletingPrestation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la prestation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La prestation{" "}
              <strong>{deletingPrestation?.serviceNom}</strong> —{" "}
              {deletingPrestation?.siteNom} sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== VUE GRILLE ====================

interface PrestationsGridProps {
  prestations: PrestationListItem[];
  loading: boolean;
  isError: boolean;
  showEntreprise: boolean;
}

function PrestationsGrid({
  prestations,
  loading,
  isError,
  showEntreprise,
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
          />
        ))}
      </div>
    </div>
  );
}
