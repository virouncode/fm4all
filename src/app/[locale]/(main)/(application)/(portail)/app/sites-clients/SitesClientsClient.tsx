"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getEntreprisesClientesAction } from "@/server/actions/entreprisesActions";
import {
  getSiteResponsablesAction,
  getSitesAction,
} from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import type { SelectSiteType, SiteTreeNode } from "@/zod-schemas/sites.schema";
import type { SiteResponsable } from "@/server/queries/sites.query";
import { Building, Network, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { buildSiteTree, getPathToRoot } from "../sites/helpers";
import { SiteDetails } from "../sites/SiteDetails";
import { SiteFormDialog } from "../sites/SiteFormDialog";
import { SitesTree } from "../sites/SitesTree";

export function SitesClientsClient() {
  const currentUserPlateformeRole = useAppStore(
    (s) => s.rolePlateformeAdhesion,
  );

  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedClientId = searchParams.get("clientId") ?? null;

  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [loadingClients, setLoadingClients] = useState(false);

  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [tree, setTree] = useState<SiteTreeNode[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [loadingSites, setLoadingSites] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [siteResponsables, setSiteResponsables] = useState<SiteResponsable[]>(
    [],
  );
  const [loadingResponsables, setLoadingResponsables] = useState(false);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [parentIdForCreate, setParentIdForCreate] = useState<string | null>(
    null,
  );

  const canCreateRoot = !!currentUserPlateformeRole;

  // Load all platform clients on mount
  useEffect(() => {
    async function loadClients() {
      setLoadingClients(true);
      try {
        const result = await getEntreprisesClientesAction();
        if (result?.serverError) {
          toast.error(result.serverError.message);
          return;
        }
        if (result?.data?.clients) {
          setClients(result.data.clients);
        }
      } catch {
        toast.error("Erreur lors du chargement des clients.");
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  // Load sites when selectedClientId changes
  useEffect(() => {
    if (!selectedClientId) {
      setSites([]);
      setTree([]);
      setSelectedSiteId(null);
      setExpandedNodes(new Set());
      return;
    }

    async function loadSites() {
      setLoadingSites(true);
      setSites([]);
      setTree([]);
      setSelectedSiteId(null);
      setExpandedNodes(new Set());
      try {
        const result = await getSitesAction({ entrepriseId: selectedClientId! });
        if (result?.data) {
          const builtTree = buildSiteTree(result.data);
          setSites(result.data);
          setTree(builtTree);
          if (builtTree.length > 0) {
            setSelectedSiteId(builtTree[0].id);
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des sites.");
      } finally {
        setLoadingSites(false);
      }
    }

    loadSites();
  }, [selectedClientId]);

  // Load responsables when selectedSiteId changes
  useEffect(() => {
    if (!selectedSiteId || !selectedClientId) {
      setSiteResponsables([]);
      return;
    }

    async function loadResponsables() {
      setLoadingResponsables(true);
      try {
        const result = await getSiteResponsablesAction({
          siteId: selectedSiteId!,
          entrepriseId: selectedClientId!,
        });
        setSiteResponsables(result?.data?.responsables ?? []);
      } catch {
        setSiteResponsables([]);
      } finally {
        setLoadingResponsables(false);
      }
    }

    loadResponsables();
  }, [selectedSiteId, selectedClientId]);

  const handleClientChange = (clientId: string) => {
    router.replace(
      { pathname: "/app/sites-clients", query: { clientId } },
      { scroll: false },
    );
  };

  const handleSiteSelect = (siteId: string) => setSelectedSiteId(siteId);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
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
    if (
      formMode === "edit" &&
      selectedSite &&
      selectedSite.actif !== newSite.actif
    ) {
      try {
        const result = await getSitesAction({
          entrepriseId: selectedClientId!,
        });
        if (result?.data) {
          setSites(result.data);
          setTree(buildSiteTree(result.data));
        }
      } catch {
        // Silencieux
      }
    } else {
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

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;

  const selectedSiteAncestors = useMemo(() => {
    if (!selectedSiteId) return [];
    const path = getPathToRoot(tree, selectedSiteId);
    return path.map((n) => ({ id: n.id, nom: n.nom }));
  }, [tree, selectedSiteId]);

  return (
    <div className="flex flex-col gap-4">
      {/* Sélecteur client */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap text-sm">
          Client :
        </span>
        <Select
          value={selectedClientId ?? ""}
          onValueChange={handleClientChange}
          disabled={loadingClients}
        >
          <SelectTrigger className="h-8 w-64">
            <SelectValue
              placeholder={
                loadingClients ? "Chargement…" : "Sélectionnez un client"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom}
              </SelectItem>
            ))}
            {clients.length === 0 && !loadingClients && (
              <div className="text-muted-foreground px-3 py-2 text-sm">
                Aucun client trouvé
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Contenu */}
      {!selectedClientId && (
        <div className="text-muted-foreground flex flex-1 items-center justify-center rounded-lg border py-12 text-center text-sm">
          <div className="flex flex-col items-center gap-2">
            <Building className="h-8 w-8 opacity-30" />
            <span>Sélectionnez un client pour voir ses sites</span>
          </div>
        </div>
      )}

      {selectedClientId && (
        <div className="space-y-6">
          {/* Tree Section */}
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="text-primary h-6" />
                <h2 className="text-xl font-semibold">
                  Organisation des sites
                </h2>
              </div>
              {canCreateRoot && (
                <Button onClick={handleCreateRoot} size="sm">
                  <Plus className="h-4 w-4" />
                  Site racine
                </Button>
              )}
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {loadingSites ? (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  Chargement des sites…
                </div>
              ) : (
                <SitesTree
                  tree={tree}
                  selectedSiteId={selectedSiteId}
                  onSelectSite={handleSiteSelect}
                  onCreateChild={handleCreateChild}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                  currentUserRole={null}
                  currentUserPlateformeRole={currentUserPlateformeRole}
                  responsableSiteIds={new Set()}
                />
              )}
            </div>
          </div>

          {/* Details Section */}
          {selectedSite && (
            <div className="rounded-lg border p-6">
              <SiteDetails
                site={selectedSite}
                onEdit={handleEdit}
                onCreateChild={() => handleCreateChild(selectedSite.id)}
                currentUserRole={null}
                currentUserPlateformeRole={currentUserPlateformeRole}
                responsableSiteIds={new Set()}
                siteResponsables={siteResponsables}
                loadingResponsables={loadingResponsables}
                ancestorPath={selectedSiteAncestors}
              />
            </div>
          )}

          {!selectedSite && !loadingSites && (
            <div className="text-muted-foreground rounded-lg border p-12 text-center">
              Sélectionnez un site dans l&apos;arborescence pour voir ses
              détails
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      {selectedClientId && (
        <SiteFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          mode={formMode}
          site={formMode === "edit" ? selectedSite : null}
          parentId={parentIdForCreate}
          entrepriseId={selectedClientId}
          parentSite={
            formMode === "create" && parentIdForCreate
              ? (sites.find((s) => s.id === parentIdForCreate) ?? null)
              : formMode === "edit" && selectedSite?.parentId
                ? (sites.find((s) => s.id === selectedSite.parentId) ?? null)
                : null
          }
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
