"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SiteTreeNode } from "@/zod-schemas/sites.schema";
import { Building, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type AttributionSitesTreeProps = {
  tree: SiteTreeNode[];
  selectedSiteIds: string[];
  onSiteToggle: (siteId: string, isChecked: boolean) => void;
  scope: "self" | "subtree";
  /** Déjà attribué → checkbox auto-cochée + désactivée */
  getSiteState?: (siteId: string) => "disabled" | "available";
  /** Si fourni, seuls ces siteIds ont leur checkbox activée.
   *  Les autres sont désactivés avec tooltip "Vous n'êtes pas responsable de ce site". */
  enabledSiteIds?: string[];
};

export function AttributionSitesTree({
  tree,
  selectedSiteIds,
  onSiteToggle,
  scope,
  getSiteState,
  enabledSiteIds,
}: AttributionSitesTreeProps) {
  return (
    <TooltipProvider>
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
            enabledSiteIds={enabledSiteIds}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

function TreeNode({
  node,
  level,
  selectedSiteIds,
  onSiteToggle,
  scope,
  getSiteState,
  enabledSiteIds,
}: {
  node: SiteTreeNode;
  level: number;
  selectedSiteIds: string[];
  onSiteToggle: (siteId: string, isChecked: boolean) => void;
  scope: "self" | "subtree";
  getSiteState?: (siteId: string) => "disabled" | "available";
  enabledSiteIds?: string[];
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isChecked = selectedSiteIds.includes(node.id);

  // État "déjà attribué" (auto-coché + désactivé)
  const siteState = getSiteState ? getSiteState(node.id) : "available";
  const isAlreadyAttributed = siteState === "disabled";

  // État "pas responsable" (checkbox vide + désactivée + tooltip)
  const isNotResponsible =
    enabledSiteIds !== undefined && !enabledSiteIds.includes(node.id);

  const isDisabled = isAlreadyAttributed || isNotResponsible;

  const checkboxEl = (
    <Checkbox
      id={node.id}
      checked={isAlreadyAttributed || isChecked}
      disabled={isDisabled}
      onCheckedChange={(checked) => onSiteToggle(node.id, checked === true)}
    />
  );

  const labelEl = (
    <label
      htmlFor={node.id}
      className={`flex flex-1 items-center gap-2 ${
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <Building className="text-muted-foreground h-4 w-4" />
      <span className="text-sm">{node.nom}</span>
    </label>
  );

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
        {checkboxEl}

        {/* Label — avec tooltip si "pas responsable" */}
        {isNotResponsible ? (
          <Tooltip>
            <TooltipTrigger asChild>{labelEl}</TooltipTrigger>
            <TooltipContent>
              Vous n&apos;êtes pas responsable de ce site
            </TooltipContent>
          </Tooltip>
        ) : (
          labelEl
        )}
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
              enabledSiteIds={enabledSiteIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
