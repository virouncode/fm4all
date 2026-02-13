"use client";

import { Button } from "@/components/ui/button";
import { getSitesAction } from "@/server/actions/sitesActions";
import { getUserSiteAttributionsAction } from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType, SiteTreeNode } from "@/zod-schemas/sites.schema";
import { Network, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { buildSiteTree } from "./helpers";
import { SiteDetails } from "./SiteDetails";
import { SiteFormDialog } from "./SiteFormDialog";
import { SitesTree } from "./SitesTree";

export function SitesClient() {
  const entreprise = useAppStore((state) => state.entreprise);
  const currentUser = useAppStore((state) => state.user);
  const currentUserRole = useAppStore((state) => state.roleAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  // Seuls les platform super admins et admins peuvent créer des sites racines
  const canCreateRoot =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin";

  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [tree, setTree] = useState<SiteTreeNode[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [responsableSiteIds, setResponsableSiteIds] = useState<Set<string>>(
    new Set(),
  );

  // Load sites and user attributions
  useEffect(() => {
    if (!entreprise?.id || !currentUser?.id) return;

    async function loadData() {
      setLoading(true);
      try {
        // Load sites
        const sitesResult = await getSitesAction({
          entrepriseId: entreprise!.id,
        });
        if (sitesResult?.data) {
          setSites(sitesResult.data);
          const builtTree = buildSiteTree(sitesResult.data);
          setTree(builtTree);
        }

        // Load user's site attributions to determine permissions
        const attributionsResult = await getUserSiteAttributionsAction({
          userId: currentUser!.id,
          entrepriseId: entreprise!.id,
        });

        if (attributionsResult?.data?.attributions) {
          // Build Set of siteIds where user is responsable_site
          const responsableIds = new Set(
            attributionsResult.data.attributions
              .filter((attr) => attr.role === "responsable_site")
              .map((attr) => attr.siteId),
          );
          setResponsableSiteIds(responsableIds);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [entreprise, currentUser]);

  // Handlers
  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
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
      } catch (error) {
        console.error("Failed to reload sites:", error);
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

          {canCreateRoot && (
            <Button onClick={handleCreateRoot} size="sm">
              <Plus className="h-4 w-4" />
              Site racine
            </Button>
          )}
        </div>
        <SitesTree
          tree={tree}
          selectedSiteId={selectedSiteId}
          onSelectSite={handleSiteSelect}
          onCreateChild={handleCreateChild}
          currentUserRole={currentUserRole}
          currentUserPlateformeRole={currentUserPlateformeRole}
          responsableSiteIds={responsableSiteIds}
        />
      </div>

      {/* Details Section */}
      {selectedSite && (
        <div className="rounded-lg border p-6">
          <SiteDetails
            site={selectedSite}
            onEdit={handleEdit}
            onCreateChild={() => handleCreateChild(selectedSite.id)}
            currentUserRole={currentUserRole}
            currentUserPlateformeRole={currentUserPlateformeRole}
            responsableSiteIds={responsableSiteIds}
          />
        </div>
      )}

      {!selectedSite && (
        <div className="text-muted-foreground rounded-lg border p-12 text-center">
          Sélectionnez un site dans l&apos;arborescence pour voir ses détails
        </div>
      )}

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
