"use client";

import { buildSiteTree } from "@/app/[locale]/(main)/(application)/(portail)/app/sites/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  bulkInsertMixedPrestataireAttributionsAction,
  deleteUserPrestataireSiteAttributionAction,
} from "@/server/actions/userPrestataireSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectSiteType, SiteTreeNode } from "@/zod-schemas/sites.schema";
import {
  RolePrestataireAttributionSiteType,
  SelectUserPrestataireSiteAttributionWithInheritanceType,
} from "@/zod-schemas/userSiteAttribution.schema";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { roleColors, rolePrestataireLabels, scopeLabels } from "./helpers";

type UserPrestataireSiteAttributionsListProps = {
  attributions: SelectUserPrestataireSiteAttributionWithInheritanceType[];
  allSites: SelectSiteType[];
  userId: string;
  clientEntrepriseId: string;
  canEdit: boolean;
  onAttributionDeleted: () => void;
  onAddClick: () => void;
  // Sélecteur de client intégré
  clients: Array<{ id: string; nom: string }>;
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
};

function findSiteDepth(
  tree: SiteTreeNode[],
  siteId: string,
  currentDepth = 0,
): number {
  for (const node of tree) {
    if (node.id === siteId) {
      return currentDepth;
    }
    if (node.children.length > 0) {
      const depth = findSiteDepth(node.children, siteId, currentDepth + 1);
      if (depth !== -1) {
        return depth;
      }
    }
  }
  return -1;
}

function createSiteOrderMap(tree: SiteTreeNode[]): Map<string, number> {
  const orderMap = new Map<string, number>();
  let index = 0;

  function traverse(nodes: SiteTreeNode[]) {
    for (const node of nodes) {
      orderMap.set(node.id, index++);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return orderMap;
}

export function UserPrestataireSiteAttributionsList({
  attributions,
  allSites,
  userId,
  clientEntrepriseId,
  canEdit,
  onAttributionDeleted,
  onAddClick,
  clients,
  selectedClientId,
  onClientChange,
}: UserPrestataireSiteAttributionsListProps) {
  const currentUser = useAppStore((state) => state.user);
  const currentUserRole = useAppStore((state) => state.rolePrestataireAdhesion);
  const currentUserPlateformeRole = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const siteTree = useMemo(() => buildSiteTree(allSites), [allSites]);

  const sortedAttributions = useMemo(() => {
    if (attributions.length === 0 || siteTree.length === 0) {
      return attributions;
    }
    const orderMap = createSiteOrderMap(siteTree);
    return [...attributions].sort((a, b) => {
      const orderA = orderMap.get(a.siteId) ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.siteId) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [attributions, siteTree]);

  const handleDelete = async (
    attribution: SelectUserPrestataireSiteAttributionWithInheritanceType,
  ) => {
    setDeletingId(attribution.id);

    // Attribution héritée → créer une exclusion
    if (attribution.isInherited) {
      const result = await bulkInsertMixedPrestataireAttributionsAction({
        userId,
        clientEntrepriseId,
        attributions: [
          {
            siteId: attribution.siteId,
            mode: "exclure",
            scope: "self",
            role: attribution.role as RolePrestataireAttributionSiteType,
          },
        ],
      });

      setDeletingId(null);

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      toast.success("Exclusion créée avec succès");
      onAttributionDeleted();
      return;
    }

    // Attribution directe → DELETE
    const result = await deleteUserPrestataireSiteAttributionAction({
      id: attribution.id,
      userId,
    });

    setDeletingId(null);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Attribution supprimée avec succès");
    onAttributionDeleted();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sites attribués</CardTitle>
          <CardDescription>
            Sites auxquels l&apos;utilisateur a accès avec rôle et périmètre
          </CardDescription>
        </div>
        {canEdit && (
          <Button onClick={onAddClick} size="sm">
            <Plus className="h-4 w-4" />
            Attribuer des sites
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Sélecteur de client */}
        <div className="mb-4 space-y-1">
          <label className="text-sm font-medium">Client</label>
          <Select value={selectedClientId} onValueChange={onClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedClientId ? null : sortedAttributions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun site attribué à cet utilisateur
          </p>
        ) : (
          <div className="space-y-2">
            {sortedAttributions.map((attribution) => {
              const depth = findSiteDepth(siteTree, attribution.siteId);
              const indentPx = depth * 20;

              const isOwnAttribution = attribution.userId === currentUser?.id;
              const isAdmin =
                currentUserPlateformeRole === "super_admin_plateforme" ||
                currentUserRole === "admin";
              const canModifyThisAttribution =
                canEdit && (!isOwnAttribution || isAdmin);

              let disabledMessage: string | undefined;
              if (isOwnAttribution && !isAdmin) {
                disabledMessage =
                  currentUserRole === "manager"
                    ? "Vous ne pouvez pas modifier vos propres attributions. Demandez à un administrateur."
                    : "Vous ne pouvez pas modifier vos propres attributions. Demandez à votre responsable.";
              }

              return (
                <div
                  key={attribution.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border px-3 py-2"
                  style={{ marginLeft: `${indentPx + 12}px` }}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {attribution.site.nom}
                      </p>
                      <Badge
                        variant="secondary"
                        className={roleColors[attribution.role]}
                      >
                        {rolePrestataireLabels[
                          attribution.role as RolePrestataireAttributionSiteType
                        ] ?? attribution.role}
                      </Badge>
                      <Badge variant="outline">
                        {scopeLabels[attribution.scope]}
                      </Badge>
                    </div>
                    {isOwnAttribution && !isAdmin && canEdit && (
                      <p className="text-muted-foreground text-xs italic">
                        {disabledMessage}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      {canModifyThisAttribution ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(attribution)}
                          disabled={deletingId === attribution.id}
                          title="Supprimer"
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  title="Supprimer (désactivé)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{disabledMessage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
