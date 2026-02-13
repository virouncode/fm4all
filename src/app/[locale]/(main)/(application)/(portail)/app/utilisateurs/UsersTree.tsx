"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleAdhesionCT, toCodeTableName } from "@/constants/codeTables";
import { cn } from "@/lib/utils";
import { UserTreeNode } from "@/zod-schemas/user.schema";
import { RoleAdhesionType } from "@/zod-schemas/userAdhesion.schema";
import { RolePlateformeAdhesionType } from "@/zod-schemas/userPlateformeAdhesion.schema";
import { ChevronDown, ChevronRight, Plus, User } from "lucide-react";
import { getPathToRoot } from "./helpers";

interface UsersTreeProps {
  tree: UserTreeNode[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onCreateChild: (parentId: string) => void;
  hasActiveFilters?: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  currentUserId?: string;
  currentUserRole: RoleAdhesionType | null;
  currentUserPlateformeRole: RolePlateformeAdhesionType | null;
}

export function UsersTree({
  tree,
  selectedUserId,
  onSelectUser,
  onCreateChild,
  hasActiveFilters = false,
  expandedNodes,
  onToggleExpand,
  currentUserId,
  currentUserRole,
  currentUserPlateformeRole,
}: UsersTreeProps) {
  return (
    <div className="space-y-1">
      {tree.length === 0 && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          {hasActiveFilters
            ? "Aucun résultat pour ces filtres."
            : "Aucun utilisateur. Créez votre premier utilisateur racine."}
        </div>
      )}
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          selectedUserId={selectedUserId}
          onSelectUser={onSelectUser}
          onCreateChild={onCreateChild}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          tree={tree}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          currentUserPlateformeRole={currentUserPlateformeRole}
        />
      ))}
    </div>
  );
}

type TreeNodeProps = {
  node: UserTreeNode;
  level: number;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onCreateChild: (parentId: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  tree: UserTreeNode[];
  currentUserId?: string;
  currentUserRole: RoleAdhesionType | null;
  currentUserPlateformeRole: RolePlateformeAdhesionType | null;
};

function TreeNode({
  node,
  level,
  selectedUserId,
  onSelectUser,
  onCreateChild,
  expandedNodes,
  onToggleExpand,
  tree,
  currentUserId,
  currentUserRole,
  currentUserPlateformeRole,
}: TreeNodeProps) {
  const expanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedUserId;

  // Déterminer si l'utilisateur courant peut créer un subordonné sous ce nœud
  const canCreateChildHere = (() => {
    if (!currentUserRole && !currentUserPlateformeRole) return false;

    // Platform super admin can always create
    if (currentUserPlateformeRole === "super_admin_plateforme") return true;

    // Admin can create anywhere
    if (currentUserRole === "admin") return true;

    // Manager peut créer sous lui-même OU sous des collaborateurs dans sa branche
    if (currentUserRole === "manager") {
      // Si c'est le manager lui-même, il peut toujours créer
      if (node.id === currentUserId) return true;

      // Sinon, doit être un collaborateur dans sa branche
      if (node.adhesion?.role !== "collaborateur") return false;

      const pathToRoot = getPathToRoot(tree, node.id);
      return pathToRoot.some((ancestor) => ancestor.id === currentUserId);
    }

    // Collaborateur ne peut jamais créer
    return false;
  })();

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
        <User className="text-muted-foreground h-4 w-4" />

        {/* Name */}
        <span
          className="flex flex-1 items-center gap-2 truncate text-sm"
          onClick={() => onSelectUser(node.id)}
        >
          <span>
            {node.prenom} {node.nom}{" "}
            {node.adhesion?.role
              ? "(" + toCodeTableName(node.adhesion?.role, roleAdhesionCT) + ")"
              : null}
          </span>
          {node.adhesion?.statut && (
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-xs",
                node.adhesion.statut === "actif" &&
                  "bg-green-500/10 text-green-600 dark:text-green-500",
                node.adhesion.statut === "suspendu" &&
                  "bg-red-500/10 text-red-600 dark:text-red-500",
                node.adhesion.statut === "en_attente" &&
                  "bg-orange-500/10 text-orange-600 dark:text-orange-500",
              )}
            >
              {node.adhesion.statut === "actif"
                ? "Actif"
                : node.adhesion.statut === "suspendu"
                  ? "Suspendu"
                  : node.adhesion.statut === "en_attente"
                    ? "En attente"
                    : "Refusé"}
            </Badge>
          )}
        </span>

        {/* Add child button (visible on hover) */}
        {canCreateChildHere && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(node.id);
            }}
            title="Ajouter un subordonné"
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
              selectedUserId={selectedUserId}
              onSelectUser={onSelectUser}
              onCreateChild={onCreateChild}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              tree={tree}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              currentUserPlateformeRole={currentUserPlateformeRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}
