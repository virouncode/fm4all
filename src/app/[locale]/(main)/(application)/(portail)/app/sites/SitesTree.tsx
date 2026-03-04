"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteTreeNode } from "@/zod-schemas/sites.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import { Building, ChevronDown, ChevronRight, Plus } from "lucide-react";

type SitesTreeProps = {
  tree: SiteTreeNode[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
  onCreateChild: (parentId: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  currentUserRole: RoleAdhesionType | null;
  currentUserPlateformeRole: RolePlateformeAdhesionType | null;
  responsableSiteIds: Set<string>;
  hasActiveFilters?: boolean;
}

export function SitesTree({
  tree,
  selectedSiteId,
  onSelectSite,
  onCreateChild,
  expandedNodes,
  onToggleExpand,
  currentUserRole,
  currentUserPlateformeRole,
  responsableSiteIds,
  hasActiveFilters = false,
}: SitesTreeProps) {
  return (
    <div className="space-y-1">
      {tree.length === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          {hasActiveFilters
            ? "Aucun résultat pour ces filtres."
            : "Aucun site. Créez votre premier site racine."}
        </div>
      )}
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          selectedSiteId={selectedSiteId}
          onSelectSite={onSelectSite}
          onCreateChild={onCreateChild}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          currentUserRole={currentUserRole}
          currentUserPlateformeRole={currentUserPlateformeRole}
          responsableSiteIds={responsableSiteIds}
        />
      ))}
    </div>
  );
}

type TreeNodeProps = {
  node: SiteTreeNode;
  level: number;
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
  onCreateChild: (parentId: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  currentUserRole: RoleAdhesionType | null;
  currentUserPlateformeRole: RolePlateformeAdhesionType | null;
  responsableSiteIds: Set<string>;
};

function TreeNode({
  node,
  level,
  selectedSiteId,
  onSelectSite,
  onCreateChild,
  expandedNodes,
  onToggleExpand,
  currentUserRole,
  currentUserPlateformeRole,
  responsableSiteIds,
}: TreeNodeProps) {
  const expanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedSiteId;

  // Permissions
  const isAdmin =
    currentUserPlateformeRole === "super_admin_plateforme" ||
    currentUserRole === "admin";
  const isResponsable = responsableSiteIds.has(node.id);
  const canCreateChild = isAdmin || isResponsable;

  return (
    <div>
      <div
        className={cn(
          "hover:bg-accent group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
          isSelected && "bg-accent font-medium",
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => onToggleExpand(node.id)}
          className="flex h-4 w-4 items-center justify-center"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-label={
            hasChildren
              ? expanded
                ? `Réduire ${node.nom}`
                : `Développer ${node.nom}`
              : undefined
          }
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Icon */}
        <Building className="text-muted-foreground h-4 w-4" />

        {/* Name */}
        <span
          className="flex flex-1 items-center gap-2 truncate text-sm"
          onClick={() => onSelectSite(node.id)}
        >
          <span>{node.nom}</span>
          <Badge
            variant="outline"
            className={cn(
              "border-0 text-xs",
              node.actif
                ? "bg-green-500/10 text-green-600 dark:text-green-500"
                : "bg-red-500/10 text-red-600 dark:text-red-500",
            )}
          >
            {node.actif ? "Actif" : "Inactif"}
          </Badge>
        </span>

        {/* Add child button (visible on hover) */}
        {canCreateChild && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(node.id);
            }}
            aria-label="Ajouter un sous-site"
            title="Ajouter un sous-site"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedSiteId={selectedSiteId}
              onSelectSite={onSelectSite}
              onCreateChild={onCreateChild}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              currentUserRole={currentUserRole}
              currentUserPlateformeRole={currentUserPlateformeRole}
              responsableSiteIds={responsableSiteIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
