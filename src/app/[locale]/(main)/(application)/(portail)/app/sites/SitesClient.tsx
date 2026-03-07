"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSiteResponsablesAction,
  getSitesAction,
} from "@/server/actions/sitesActions";
import { getUserClientSiteAttributionsAction } from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType, SiteTreeNode } from "@/zod-schemas/sites.schema";
import type { SelectUserSiteAttributionWithInheritanceType } from "@/zod-schemas/userSiteAttribution.schema";
import { Filter, Network, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SiteResponsable } from "@/server/queries/sites.query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { buildSiteTree, getPathToRoot } from "./helpers";
import { SiteDetails } from "./SiteDetails";
import { SiteFormDialog } from "./SiteFormDialog";
import { SitesFiltersForm } from "./SitesFiltersForm";
import { SitesTree } from "./SitesTree";

export function SitesClient() {
  const entreprise = useAppStore((state) => state.entreprise);
  const currentUser = useAppStore((state) => state.user);
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );
  const posture = useAppStore((state) => state.postureActive);
  const searchParams = useSearchParams();

  // Seuls les platform super admins et admins peuvent créer des sites racines
  const canCreateRoot =
    (posture === "plateforme" && currentUserPlateformeRole === "super_admin_plateforme") ||
    currentUserRole === "admin";

  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [tree, setTree] = useState<SiteTreeNode[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [responsableSiteIds, setResponsableSiteIds] = useState<Set<string>>(
    new Set(),
  );
  const [siteResponsables, setSiteResponsables] = useState<SiteResponsable[]>(
    [],
  );
  const [loadingResponsables, setLoadingResponsables] = useState(false);

  // Extract filter params from URL
  const nomFilter = searchParams.get("nom") || undefined;
  const villeFilter = searchParams.get("ville") || undefined;
  const typeBatimentFilter = searchParams.get("typeBatiment") || undefined;
  const typeOccupationFilter = searchParams.get("typeOccupation") || undefined;
  const surfaceMinFilter = searchParams.get("surfaceMin") || undefined;
  const surfaceMaxFilter = searchParams.get("surfaceMax") || undefined;
  const effectifMinFilter = searchParams.get("effectifMin") || undefined;
  const effectifMaxFilter = searchParams.get("effectifMax") || undefined;

  const hasActiveFilters = !!(
    nomFilter ||
    villeFilter ||
    (typeBatimentFilter && typeBatimentFilter !== "all") ||
    (typeOccupationFilter && typeOccupationFilter !== "all") ||
    surfaceMinFilter ||
    surfaceMaxFilter ||
    effectifMinFilter ||
    effectifMaxFilter
  );

  const activeFilterCount = [
    nomFilter,
    villeFilter,
    typeBatimentFilter && typeBatimentFilter !== "all",
    typeOccupationFilter && typeOccupationFilter !== "all",
    surfaceMinFilter,
    surfaceMaxFilter,
    effectifMinFilter,
    effectifMaxFilter,
  ].filter(Boolean).length;

  // Client-side filtering : sites correspondant aux critères + leurs ancêtres
  const filteredSites = useMemo(() => {
    if (!hasActiveFilters) return sites;

    const matchingIds = new Set(
      sites
        .filter((site) => {
          if (
            nomFilter &&
            !site.nom.toLowerCase().includes(nomFilter.toLowerCase())
          )
            return false;
          if (
            villeFilter &&
            !site.ville.toLowerCase().includes(villeFilter.toLowerCase())
          )
            return false;
          if (
            typeBatimentFilter &&
            typeBatimentFilter !== "all" &&
            site.typeBatiment !== typeBatimentFilter
          )
            return false;
          if (
            typeOccupationFilter &&
            typeOccupationFilter !== "all" &&
            site.typeOccupation !== typeOccupationFilter
          )
            return false;
          if (surfaceMinFilter && site.surface < Number(surfaceMinFilter))
            return false;
          if (surfaceMaxFilter && site.surface > Number(surfaceMaxFilter))
            return false;
          if (effectifMinFilter && site.effectif < Number(effectifMinFilter))
            return false;
          if (effectifMaxFilter && site.effectif > Number(effectifMaxFilter))
            return false;
          return true;
        })
        .map((s) => s.id),
    );

    // Inclure les ancêtres des sites correspondants (pour préserver le contexte de l'arbre)
    const includedIds = new Set(matchingIds);
    const siteMap = new Map(sites.map((s) => [s.id, s]));
    for (const id of matchingIds) {
      let current = siteMap.get(id);
      while (current?.parentId) {
        includedIds.add(current.parentId);
        current = siteMap.get(current.parentId);
      }
    }

    return sites.filter((s) => includedIds.has(s.id));
  }, [
    sites,
    hasActiveFilters,
    nomFilter,
    villeFilter,
    typeBatimentFilter,
    typeOccupationFilter,
    surfaceMinFilter,
    surfaceMaxFilter,
    effectifMinFilter,
    effectifMaxFilter,
  ]);

  const filteredTree = useMemo(
    () => buildSiteTree(filteredSites),
    [filteredSites],
  );

  // Réinitialiser la sélection si le site sélectionné disparaît des résultats filtrés
  useEffect(() => {
    if (selectedSiteId && !filteredSites.some((s) => s.id === selectedSiteId)) {
      setSelectedSiteId(filteredSites.length > 0 ? filteredSites[0].id : null);
    }
  }, [filteredSites, selectedSiteId]);

  // Load sites and user attributions
  useEffect(() => {
    if (!entreprise?.id || !currentUser?.id) return;

    async function loadData() {
      setLoading(true);
      try {
        // Load sites and attributions in parallel
        const [sitesResult, attributionsResult] = await Promise.all([
          getSitesAction({ entrepriseId: entreprise!.id }),
          getUserClientSiteAttributionsAction({
            userId: currentUser!.id,
            entrepriseId: entreprise!.id,
          }),
        ]);

        let builtTree: SiteTreeNode[] = [];

        if (sitesResult?.data) {
          setSites(sitesResult.data);
          builtTree = buildSiteTree(sitesResult.data);
          setTree(builtTree);
        }

        const attributions: SelectUserSiteAttributionWithInheritanceType[] = attributionsResult?.data?.attributions ?? [];

        // Responsable IDs
        setResponsableSiteIds(
          new Set(
            attributions
              .filter((attr) => attr.role === "responsable_site")
              .map((attr) => attr.siteId),
          ),
        );

        // Sélection par défaut : BFS → premier site attribué (le plus haut dans la hiérachie)
        const attributedSiteIds = new Set(attributions.map((a) => a.siteId));
        let defaultSiteId: string | null = null;
        const queue: SiteTreeNode[] = [...builtTree];
        while (queue.length > 0) {
          const node = queue.shift()!;
          if (attributedSiteIds.has(node.id)) {
            defaultSiteId = node.id;
            break;
          }
          queue.push(...node.children);
        }
        // Fallback : premier site racine (admins sans attribution explicite)
        if (!defaultSiteId && builtTree.length > 0) {
          defaultSiteId = builtTree[0].id;
        }

        if (defaultSiteId) {
          setSelectedSiteId((prev) => prev ?? defaultSiteId);

          // Déplier les ancêtres pour que le site soit visible dans l'arbre
          const path = getPathToRoot(builtTree, defaultSiteId);
          if (path.length > 1) {
            const ancestorIds = path.slice(0, -1).map((n) => n.id);
            setExpandedNodes((prev) => {
              const next = new Set(prev);
              ancestorIds.forEach((id) => next.add(id));
              return next;
            });
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [entreprise, currentUser]);

  // Load responsables when selected site changes
  useEffect(() => {
    if (!selectedSiteId || !entreprise?.id) {
      setSiteResponsables([]);
      return;
    }

    async function loadResponsables() {
      setLoadingResponsables(true);
      try {
        const result = await getSiteResponsablesAction({
          siteId: selectedSiteId!,
          entrepriseId: entreprise!.id,
        });
        setSiteResponsables(result?.data?.responsables ?? []);
      } catch {
        setSiteResponsables([]);
      } finally {
        setLoadingResponsables(false);
      }
    }

    loadResponsables();
  }, [selectedSiteId, entreprise?.id]);

  // Handlers
  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleCreateRoot = () => {
    setParentIdForCreate(null);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleCreateChild = (parentId: string) => {
    setParentIdForCreate(parentId);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleEdit = () => {
    setFormMode("edit");
    setFormDialogOpen(true);
  };

  const handleFormSuccess = async (newSite: SelectSiteType) => {
    // Si le statut actif a changé, recharger tous les sites pour refléter la cascade
    if (formMode === "edit" && selectedSite && selectedSite.actif !== newSite.actif) {
      try {
        const sitesResult = await getSitesAction({ entrepriseId: entreprise!.id });
        if (sitesResult?.data) {
          setSites(sitesResult.data);
          setTree(buildSiteTree(sitesResult.data));
        }
      } catch {
        // Reload silently ignored, local state already updated
      }
    } else {
      // Pas de changement de statut → mise à jour locale simple
      setSites((prev) => {
        const updated =
          formMode === "create"
            ? [...prev, newSite]
            : prev.map((s) => (s.id === newSite.id ? newSite : s));

        setTree(buildSiteTree(updated));
        return updated;
      });
    }

    setSelectedSiteId(newSite.id);
    setParentIdForCreate(null);
  };

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || null;

  const selectedSiteAncestors = useMemo(() => {
    if (!selectedSiteId) return [];
    const path = getPathToRoot(tree, selectedSiteId);
    return path.map((n) => ({ id: n.id, nom: n.nom }));
  }, [tree, selectedSiteId]);

  if (loading) {
    return <div>Chargement des sites...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tree Section */}
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="text-primary h-6" />
            <h2 className="text-xl font-semibold">Organisation des sites</h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setFilterDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              <Filter className="h-4 w-4" />
              Filtrer
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {canCreateRoot && (
              <Button onClick={handleCreateRoot} size="sm">
                <Plus className="h-4 w-4" />
                Site racine
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto">
          <SitesTree
            tree={filteredTree}
            selectedSiteId={selectedSiteId}
            onSelectSite={handleSiteSelect}
            onCreateChild={handleCreateChild}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
            currentUserRole={currentUserRole}
            currentUserPlateformeRole={currentUserPlateformeRole}
            responsableSiteIds={responsableSiteIds}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Details Section — hauteur naturelle, pas de scroll interne */}
      {selectedSite && (
        <div className="rounded-lg border p-6">
          <SiteDetails
            site={selectedSite}
            onEdit={handleEdit}
            onCreateChild={() => handleCreateChild(selectedSite.id)}
            currentUserRole={currentUserRole}
            currentUserPlateformeRole={currentUserPlateformeRole}
            responsableSiteIds={responsableSiteIds}
            siteResponsables={siteResponsables}
            loadingResponsables={loadingResponsables}
            ancestorPath={selectedSiteAncestors}
          />
        </div>
      )}

      {!selectedSite && (
        <div className="text-muted-foreground rounded-lg border p-12 text-center">
          Sélectionnez un site dans l&apos;arborescence pour voir ses détails
        </div>
      )}

      {/* Filters Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="!w-2/3 !max-w-none">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Filter className="text-primary size-6" />
                <h3 className="text-xl font-semibold">Filtrer les sites</h3>
              </div>
            </DialogTitle>
          </DialogHeader>
          <SitesFiltersForm />
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <SiteFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        site={formMode === "edit" ? selectedSite : null}
        parentId={parentIdForCreate}
        entrepriseId={entreprise?.id || ""}
        parentSite={
          formMode === "create" && parentIdForCreate
            ? sites.find((s) => s.id === parentIdForCreate) || null
            : formMode === "edit" && selectedSite?.parentId
              ? sites.find((s) => s.id === selectedSite.parentId) || null
              : null
        }
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
