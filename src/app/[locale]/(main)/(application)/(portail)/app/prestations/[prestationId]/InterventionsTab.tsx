"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useIntersection from "@/hooks/use-intersection";
import { Link } from "@/i18n/navigation";
import { getOccurrencesPageAction } from "@/server/actions/clientServiceOccurrencesActions";
import type { OccurrenceListItem } from "@/server/queries/clientServiceExecutions.query";
import type { QuotaInfoType } from "@/server/queries/clientServices.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUpAZ,
  Calendar,
  ChevronDown,
  Filter,
  Info,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useCallback, useState } from "react";
import { formatDateTime } from "../helpers";
import { OccurrenceOnDemandDialog } from "./OccurrenceOnDemandDialog";

// ==================== TYPES & CONSTANTS ====================

export type OccurrenceStatutFilterType =
  | "planifiee"
  | "en_cours"
  | "terminee"
  | "non_honoree"
  | "annulee"
  | "";

export type OccurrenceFiltersStateType = {
  statut: OccurrenceStatutFilterType;
  siteId: string;
};

export const OCCURRENCE_STATUT_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  planifiee: { label: "Planifiée", className: "bg-blue-100 text-blue-700" },
  en_cours: { label: "En cours", className: "bg-amber-100 text-amber-700" },
  terminee: { label: "Terminée", className: "bg-green-100 text-green-700" },
  non_honoree: { label: "Non honorée", className: "bg-red-100 text-red-700" },
  annulee: { label: "Annulée", className: "bg-gray-100 text-gray-600" },
};

const DEFAULT_FILTERS: OccurrenceFiltersStateType = {
  statut: "",
  siteId: "",
};

const PAGE_SIZE = 50;

// ==================== INTERVENTIONS TAB ====================

export function InterventionsTab({
  initialOccurrences,
  totalOccurrences,
  prestation,
  availableSites,
  canManage,
  quotaInfo,
  hasActiveExecution,
}: {
  initialOccurrences: OccurrenceListItem[];
  totalOccurrences: number;
  prestation: PrestationListItem;
  availableSites: Array<{ id: string; nom: string }>;
  canManage: boolean;
  quotaInfo: QuotaInfoType | null;
  hasActiveExecution: boolean;
}) {
  const [occurrences, setOccurrences] =
    useState<OccurrenceListItem[]>(initialOccurrences);
  const [displayedTotal, setDisplayedTotal] = useState(totalOccurrences);
  const [quotaUsed, setQuotaUsed] = useState(quotaInfo?.usedInPeriod ?? 0);
  const isQuotaMode = prestation.famillePlanification === "quota_manuel";
  const isQuotaFull =
    isQuotaMode &&
    quotaInfo !== null &&
    quotaUsed >= quotaInfo.nbOccurrencesParPeriode;
  const [filters, setFilters] =
    useState<OccurrenceFiltersStateType>(DEFAULT_FILTERS);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialOccurrences.length === PAGE_SIZE && totalOccurrences > PAGE_SIZE,
  );
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [onDemandDialogOpen, setOnDemandDialogOpen] = useState(false);

  const activeFiltersCount = [
    filters.statut !== "",
    filters.siteId !== "",
  ].filter(Boolean).length;

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    const result = await getOccurrencesPageAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      offset: occurrences.length,
      limit: PAGE_SIZE,
      statut: filters.statut || undefined,
      siteId: filters.siteId || undefined,
      sortDir,
    });
    if (result?.data) {
      const newItems = result.data.occurrences;
      setOccurrences((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === PAGE_SIZE);
    }
    setIsLoadingMore(false);
  }, [
    prestation.id,
    prestation.entrepriseId,
    occurrences.length,
    filters.statut,
    filters.siteId,
    sortDir,
  ]);

  const { rootRef, targetRef } = useIntersection<HTMLDivElement>({
    isLoading: isLoadingMore,
    hasMore,
    onLoadMore: loadMore,
    rootMargin: "200px",
    disabled: isFiltering,
  });

  const canGenerate =
    prestation.statut === "actif" &&
    prestation.famillePlanification === "recurrence_auto";

  const applyFilters = async (
    newFilters: OccurrenceFiltersStateType,
    newSortDir: "asc" | "desc",
  ) => {
    setIsFiltering(true);
    const result = await getOccurrencesPageAction({
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      offset: 0,
      limit: PAGE_SIZE,
      statut: newFilters.statut || undefined,
      siteId: newFilters.siteId || undefined,
      sortDir: newSortDir,
    });
    if (result?.data) {
      setOccurrences(result.data.occurrences);
      setHasMore(result.data.occurrences.length === PAGE_SIZE);
      if (result.data.filteredTotal !== undefined) {
        setDisplayedTotal(result.data.filteredTotal);
      }
    }
    setIsFiltering(false);
  };

  const handleFiltersApply = (newFilters: OccurrenceFiltersStateType) => {
    setFilters(newFilters);
    void applyFilters(newFilters, sortDir);
  };

  const handleSortApply = (newSortDir: "asc" | "desc") => {
    setSortDir(newSortDir);
    void applyFilters(filters, newSortDir);
  };

  const interventionsInfoBlock = (
    <Collapsible defaultOpen>
      <div className="bg-muted/40 flex items-start gap-3 rounded-lg border p-4">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-muted-foreground w-full space-y-2 text-xs">
          <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between">
            <p className="text-foreground font-medium">
              Comment fonctionnent les interventions ?
            </p>
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Qu&apos;est-ce qu&apos;une intervention ?
                </p>
                <p>
                  Une intervention est une <strong>occurrence planifiée</strong>{" "}
                  du service sur une date donnée. Elle est assignée à un
                  prestataire et peut contenir des <strong>tâches</strong>{" "}
                  issues d&apos;une checklist (nettoyage, vérifications,
                  relevés…).
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-foreground text-[11px] font-medium tracking-wide uppercase">
                  Cycle de vie
                </p>
                <p>
                  <strong>Planifiée</strong> → <strong>En cours</strong>{" "}
                  (démarrée par l&apos;intervenant) → <strong>Terminée</strong>{" "}
                  (tâches complétées) ou <strong>Non honorée</strong>{" "}
                  (intervention non réalisée) ou <strong>Annulée</strong>. Les
                  interventions terminées alimentent l&apos;historique et les
                  analytics.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {interventionsInfoBlock}

      {/* Disclaimer récurrence auto */}
      {!isQuotaMode && prestation.statut === "actif" && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Cette liste affiche uniquement les interventions réellement créées.
            Le{" "}
            <Link
              href="/app/calendrier"
              className="font-medium underline underline-offset-2"
            >
              calendrier
            </Link>{" "}
            peut afficher aussi des occurrences prévisionnelles issues de la
            planification.
          </p>
        </div>
      )}

      {/* Bandeau quota (quota_manuel actif uniquement) */}
      {isQuotaMode && prestation.statut === "actif" && (
        <div
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            !hasActiveExecution
              ? "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200"
              : !quotaInfo
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                : isQuotaFull
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            {!hasActiveExecution &&
              "Aucune exécution valide — les interventions ne peuvent pas être créées. Ajoutez un prestataire dans l'onglet « Exécution »."}
            {hasActiveExecution &&
              !quotaInfo &&
              "Quota non configuré — configurez-le dans l'onglet « Planification » pour suivre et limiter vos interventions."}
            {hasActiveExecution &&
              quotaInfo &&
              isQuotaFull &&
              `Toutes les interventions sont planifiées pour la période en cours (${quotaUsed}/${quotaInfo.nbOccurrencesParPeriode}).`}
            {hasActiveExecution &&
              quotaInfo &&
              !isQuotaFull &&
              `${quotaUsed}/${quotaInfo.nbOccurrencesParPeriode} intervention${quotaInfo.nbOccurrencesParPeriode > 1 ? "s" : ""} planifiée${quotaInfo.nbOccurrencesParPeriode > 1 ? "s" : ""} sur la période en cours — il en reste ${quotaInfo.nbOccurrencesParPeriode - quotaUsed} à planifier.`}
          </p>
        </div>
      )}

      {/* En-tête : compteur + contrôles */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {isFiltering ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Chargement...
            </span>
          ) : (
            <>
              {displayedTotal} intervention{displayedTotal > 1 ? "s" : ""}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {canManage && prestation.statut === "actif" && (
            <Button
              size="sm"
              variant="default"
              className="h-7 gap-1 text-xs"
              onClick={() => setOnDemandDialogOpen(true)}
              disabled={isQuotaFull || !hasActiveExecution}
            >
              <Plus className="h-3 w-3" />
              Ajouter une intervention
              {prestation.famillePlanification === "recurrence_auto" && (
                <span className="ml-1 opacity-70">(exceptionnel)</span>
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setFiltersDialogOpen(true)}
          >
            <Filter className="h-3 w-3" />
            Filtrer
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-3 w-3" />
            Trier
          </Button>
        </div>
      </div>

      {/* Container scrollable */}
      <div
        ref={rootRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-md border"
      >
        {occurrences.length === 0 && !isFiltering ? (
          <div className="py-16 text-center">
            <Calendar className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg font-medium">
              Aucune intervention
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {activeFiltersCount > 0
                ? "Aucune intervention ne correspond aux filtres sélectionnés."
                : canGenerate
                  ? prestation.famillePlanification === "quota_manuel"
                    ? "Aucune intervention planifiée. Utilisez « Ajouter une intervention » pour en créer."
                    : "Aucune intervention prévue pour l'instant. Vérifiez les dates du contrat et le périmètre de sites."
                  : "La prestation doit être active pour afficher et créer des interventions."}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {occurrences.map((occ) => (
              <OccurrenceRow key={occ.id} occ={occ} prestation={prestation} />
            ))}
            <div ref={targetRef} className="h-1" />
            {isLoadingMore && (
              <div className="flex justify-center py-3">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      <OccurrencesFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        currentFilters={filters}
        onApply={handleFiltersApply}
        availableSites={availableSites}
      />
      <OccurrencesSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        currentSortDir={sortDir}
        onApply={handleSortApply}
      />
      <OccurrenceOnDemandDialog
        open={onDemandDialogOpen}
        onOpenChange={setOnDemandDialogOpen}
        prestation={prestation}
        onSuccess={(newOccurrence) => {
          setOccurrences((prev) => [newOccurrence, ...prev]);
          setDisplayedTotal((prev) => prev + 1);
          if (isQuotaMode) setQuotaUsed((prev) => prev + 1);
        }}
      />
    </div>
  );
}

// ==================== OCCURRENCE ROW ====================

export function OccurrenceRow({
  occ,
  prestation,
}: {
  occ: OccurrenceListItem;
  prestation: PrestationListItem;
}) {
  const badge = OCCURRENCE_STATUT_LABELS[occ.statut] ?? {
    label: occ.statut,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <Link
      href={{
        pathname:
          "/app/prestations/[prestationId]/interventions/[interventionId]",
        params: { prestationId: prestation.id, interventionId: occ.id },
      }}
      className="hover:border-primary/30 flex items-center justify-between px-4 py-3 text-sm transition-all hover:shadow-sm"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Calendar className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 space-y-0.5">
          <span className="font-medium">
            {occ.dateDebutPrevue
              ? formatDateTime(occ.dateDebutPrevue)
              : "Date non définie"}
          </span>
          {occ.siteNom && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {occ.siteNom}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!occ.executionId && (
          <Badge className="bg-orange-100 text-xs text-orange-700">
            À attribuer
          </Badge>
        )}
        <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
      </div>
    </Link>
  );
}

// ==================== OCCURRENCES FILTERS DIALOG ====================

function OccurrencesFiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  availableSites,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: OccurrenceFiltersStateType;
  onApply: (filters: OccurrenceFiltersStateType) => void;
  availableSites: Array<{ id: string; nom: string }>;
}) {
  const activeFiltersCount = [
    currentFilters.statut !== "",
    currentFilters.siteId !== "",
  ].filter(Boolean).length;

  const handleChange = (partial: Partial<OccurrenceFiltersStateType>) => {
    onApply({ ...currentFilters, ...partial });
  };

  const handleReset = () => onApply(DEFAULT_FILTERS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="text-primary h-5 w-5" />
            Filtrer les interventions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select
              value={currentFilters.statut || "all"}
              onValueChange={(v) =>
                handleChange({
                  statut: v === "all" ? "" : (v as OccurrenceStatutFilterType),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(OCCURRENCE_STATUT_LABELS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableSites.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select
                value={currentFilters.siteId || "all"}
                onValueChange={(v) =>
                  handleChange({ siteId: v === "all" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sites</SelectItem>
                  {availableSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={activeFiltersCount === 0}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== OCCURRENCES SORT DIALOG ====================

function OccurrencesSortDialog({
  open,
  onOpenChange,
  currentSortDir,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSortDir: "asc" | "desc";
  onApply: (sortDir: "asc" | "desc") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownUp className="text-primary h-5 w-5" />
            Trier les interventions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trier par</label>
            <Select value="dateDebutPrevue" onValueChange={() => undefined}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateDebutPrevue">
                  Date de début prévue
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ordre</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={currentSortDir === "asc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onApply("asc")}
              >
                <ArrowUpAZ className="h-4 w-4" />
                Croissant
              </Button>
              <Button
                type="button"
                variant={currentSortDir === "desc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => onApply("desc")}
              >
                <ArrowDownAZ className="h-4 w-4" />
                Décroissant
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
