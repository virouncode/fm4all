"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { SiteTreeNode } from "@/zod-schemas/sites.schema";
import { Building, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type AttributionSitesTreeProps = {
  tree: SiteTreeNode[];
  selectedSiteIds: string[];
  onSiteToggle: (siteId: string, isChecked: boolean) => void;
  scope: "self" | "subtree";
  getSiteState?: (siteId: string) => "disabled" | "available";
};

export function AttributionSitesTree({
  tree,
  selectedSiteIds,
  onSiteToggle,
  scope,
  getSiteState,
}: AttributionSitesTreeProps) {
  return (
    <div className="space-y-1">
      {tree.length === 0 && (
        <p className="text-muted-foreground text-sm">Aucun site disponible</p>
      )}
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          selectedSiteIds={selectedSiteIds}
          onSiteToggle={onSiteToggle}
          scope={scope}
          getSiteState={getSiteState}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  level,
  selectedSiteIds,
  onSiteToggle,
  scope,
  getSiteState,
}: {
  node: SiteTreeNode;
  level: number;
  selectedSiteIds: string[];
  onSiteToggle: (siteId: string, isChecked: boolean) => void;
  scope: "self" | "subtree";
  getSiteState?: (siteId: string) => "disabled" | "available";
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isChecked = selectedSiteIds.includes(node.id);

  // Calculer l'état du site (disabled ou available)
  const siteState = getSiteState ? getSiteState(node.id) : "available";
  const isDisabled = siteState === "disabled";

  return (
    <div>
      <div
        className="group hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-4 w-4 items-center justify-center"
          type="button"
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

        {/* Checkbox */}
        <Checkbox
          id={node.id}
          checked={isDisabled || isChecked} // Auto-cocher si disabled
          disabled={isDisabled}
          onCheckedChange={(checked) => onSiteToggle(node.id, checked === true)}
        />

        {/* Site Icon + Name */}
        <label
          htmlFor={node.id}
          className={`flex flex-1 items-center gap-2 ${
            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <Building className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{node.nom}</span>
        </label>
      </div>

      {/* Children (recursive) */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedSiteIds={selectedSiteIds}
              onSiteToggle={onSiteToggle}
              scope={scope}
              getSiteState={getSiteState}
            />
          ))}
        </div>
      )}
    </div>
  );
}
