"use client";

import {
  buildSiteTree,
  findSiteInTree,
  getAllDescendantIds,
} from "@/app/[locale]/(main)/(application)/(portail)/app/sites/helpers";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectItem } from "@/components/ui/select";
import {
  bulkInsertMixedAttributionsAction,
  getUserClientSiteAttributionsAction,
} from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  type SelectSiteType,
  type SiteTreeNode,
} from "@/zod-schemas/sites.schema";
import {
  bulkInsertUserSiteAttributionsFormSchema,
  type RoleClientAttributionType,
  type SelectUserSiteAttributionWithInheritanceType,
} from "@/zod-schemas/userSiteAttribution.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AttributionSitesTree } from "./AttributionSitesTree";
import {
  getAvailableRolesByPostureAndLevel,
  roleLabels,
  scopeLabels,
} from "./helpers";

type UserSiteAttributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  entrepriseId: string;
  onSuccess: () => void;
};

export function UserSiteAttributionDialog({
  open,
  onOpenChange,
  userId,
  entrepriseId,
  onSuccess,
}: UserSiteAttributionDialogProps) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [allSites, setAllSites] = useState<SelectSiteType[]>([]);
  const [directAttributions, setDirectAttributions] = useState<
    SelectUserSiteAttributionWithInheritanceType[]
  >([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [tree, setTree] = useState<SiteTreeNode[]>([]);

  // Récupérer la posture active et le rôle de l'utilisateur actuel
  const posture = useAppStore((state) => state.postureActive);
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);

  // Filtrer les rôles disponibles selon la posture ET le niveau de l'utilisateur
  const availableRoles = getAvailableRolesByPostureAndLevel(
    posture,
    currentUserRole,
  );
  const roleOptions = availableRoles.map((role) => ({
    value: role,
    label: roleLabels[role],
  }));

  // Schema intermédiaire pour le form (sans siteIds, userId, entrepriseId)
  const formSchema = bulkInsertUserSiteAttributionsFormSchema.omit({
    siteIds: true,
    userId: true,
    entrepriseId: true,
  });

  // Utiliser z.input car React Hook Form travaille avec les valeurs AVANT parsing Zod
  // Avec .default(), mode est optionnel en input mais requis en output
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      mode: "inclure",
      role: "observateur_site",
      scope: "subtree",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });
  const selectedScope = form.watch("scope");

  // Fetch all sites + direct attributions when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoadingSites(true);
      try {
        const result = await getUserClientSiteAttributionsAction({
          userId,
          entrepriseId,
        });

        if (result?.serverError) {
          toast.error(result.serverError.message);
          setAllSites([]);
          setDirectAttributions([]);
          return;
        }

        if (result?.data) {
          setAllSites(result.data.allSites);
          // Filtrer seulement les attributions directes (pas héritées)
          const direct = (result.data.attributions as SelectUserSiteAttributionWithInheritanceType[]).filter(
            (attr) => !attr.isInherited,
          );
          setDirectAttributions(direct);
        }
      } catch {
        toast.error("Erreur lors du chargement des données");
        setAllSites([]);
        setDirectAttributions([]);
      } finally {
        setLoadingSites(false);
      }
    };

    fetchData();
    setSelectedSiteIds([]); // Reset selection when dialog opens
  }, [open, userId, entrepriseId]);

  // Construire l'arbre complet quand les sites sont chargés
  useEffect(() => {
    if (allSites.length > 0) {
      const builtTree = buildSiteTree(allSites);
      setTree(builtTree);
    } else {
      setTree([]);
    }
  }, [allSites]);

  /**
   * Calcule l'état d'un site (disabled si déjà attribué, available sinon)
   * @returns "disabled" si site a attribution directe mode=inclure OU est hérité
   *          "available" si site a mode=exclure (réactivable) OU pas d'attribution
   */
  const getSiteState = (siteId: string): "disabled" | "available" => {
    // 1. Vérifier attribution directe
    const directAttr = directAttributions.find(
      (attr) => attr.siteId === siteId,
    );

    if (directAttr) {
      if (directAttr.mode === "inclure") {
        return "disabled"; // Déjà attribué en mode inclure
      }
      if (directAttr.mode === "exclure") {
        return "available"; // Exclusion → Réactivable
      }
    }

    // 2. Vérifier héritage (remonter la hiérarchie)
    let currentId: string | null = siteId;

    while (currentId) {
      const site = allSites.find((s) => s.id === currentId);
      if (!site?.parentId) break; // Plus de parent

      // Chercher attribution sur le parent avec scope=subtree + mode=inclure
      const parentAttr = directAttributions.find(
        (attr) =>
          attr.siteId === site.parentId &&
          attr.scope === "subtree" &&
          attr.mode === "inclure",
      );

      if (parentAttr) {
        return "disabled"; // Hérité du parent
      }

      currentId = site.parentId;
    }

    return "available"; // Pas d'attribution
  };

  // Logique d'auto-sélection des descendants
  const handleSiteToggle = (siteId: string, isChecked: boolean) => {
    if (isChecked) {
      // AJOUTER site
      setSelectedSiteIds((prev) => {
        const newIds = [...prev, siteId];

        // Si scope=subtree, auto-cocher descendants
        if (selectedScope === "subtree") {
          const node = findSiteInTree(tree, siteId);
          if (node) {
            const descendantIds = getAllDescendantIds(node).filter(
              (id) => id !== siteId, // Exclure self
            );
            return [...new Set([...newIds, ...descendantIds])];
          }
        }

        return newIds;
      });
    } else {
      // RETIRER site
      setSelectedSiteIds((prev) => {
        let idsToRemove = [siteId];

        // Si scope=subtree, décocher en cascade
        if (selectedScope === "subtree") {
          const node = findSiteInTree(tree, siteId);
          if (node) {
            idsToRemove = getAllDescendantIds(node); // Inclut self
          }
        }

        return prev.filter((id) => !idsToRemove.includes(id));
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedSiteIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un site");
      return;
    }

    // Construire les attributions mixtes (racines + exclusions)
    const attributions: Array<{
      siteId: string;
      mode: "inclure" | "exclure";
      scope: "self" | "subtree";
      role: RoleClientAttributionType;
    }> = [];

    // IDs des exclusions à supprimer (sites cochés avec mode=exclure existant)
    const exclusionsToDelete: string[] = [];

    const selectedSet = new Set(selectedSiteIds);

    // Fonction pour vérifier si un site a un parent coché
    const hasCheckedParent = (siteId: string): boolean => {
      const site = allSites.find((s) => s.id === siteId);
      if (!site || !site.parentId) return false;
      if (selectedSet.has(site.parentId)) return true;
      return hasCheckedParent(site.parentId);
    };

    // 1. Détecter les RACINES (sites cochés sans parent coché)
    const roots = selectedSiteIds.filter((siteId) => !hasCheckedParent(siteId));

    // 2. Pour chaque racine, créer l'attribution
    for (const rootId of roots) {
      // Vérifier si c'est une exclusion existante à supprimer
      const existingExclusion = directAttributions.find(
        (attr) => attr.siteId === rootId && attr.mode === "exclure",
      );

      if (existingExclusion) {
        // Marquer pour suppression
        exclusionsToDelete.push(existingExclusion.id);
      }

      attributions.push({
        siteId: rootId,
        mode: "inclure",
        scope: data.scope,
        role: data.role,
      });

      // Si scope=subtree, détecter les exclusions (descendants non cochés)
      if (data.scope === "subtree") {
        const node = findSiteInTree(tree, rootId);
        if (node) {
          const allDescendants = getAllDescendantIds(node).filter(
            (id) => id !== rootId,
          );
          const uncheckedDescendants = allDescendants.filter(
            (id) => !selectedSet.has(id),
          );

          for (const excludedId of uncheckedDescendants) {
            attributions.push({
              siteId: excludedId,
              mode: "exclure",
              scope: "self",
              role: data.role, // Le rôle importe peu pour une exclusion
            });
          }
        }
      }
    }

    // Appeler la nouvelle action avec attributions mixtes + exclusions à supprimer
    const result = await bulkInsertMixedAttributionsAction({
      userId,
      entrepriseId,
      attributions,
      exclusionsToDelete:
        exclusionsToDelete.length > 0 ? exclusionsToDelete : undefined,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      let message = `${result.data.count} site(s) attribué(s) avec succès`;

      // Si canonisation a nettoyé des redondances AVANT insertion
      if (result.data.canonizedCount < result.data.originalCount) {
        const cleaned = result.data.originalCount - result.data.canonizedCount;
        message += ` (${cleaned} redondance(s) évitée(s))`;
      }

      // Si cleanup a supprimé des attributions existantes APRÈS insertion
      if (result.data.deletedCount > 0) {
        message += ` [${result.data.deletedCount} ligne(s) existante(s) supprimée(s)]`;
      }

      toast.success(message);
      onSuccess();
      onOpenChange(false);
      setSelectedSiteIds([]);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attribuer des sites</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Select */}
            <RhfControlledSelect
              name="role"
              label="Rôle sur les sites"
              requiredMark
              selectClassName="w-full"
            >
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            {/* Scope Select */}
            <RhfControlledSelect
              name="scope"
              label="Périmètre"
              requiredMark
              selectClassName="w-full"
            >
              <SelectItem value="self">{scopeLabels.self}</SelectItem>
              <SelectItem value="subtree">{scopeLabels.subtree}</SelectItem>
            </RhfControlledSelect>

            {/* Sites Tree with Checkboxes */}
            <div className="space-y-2">
              <Label>
                Sites à attribuer <span>*</span>
              </Label>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {loadingSites ? (
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                ) : (
                  <AttributionSitesTree
                    tree={tree}
                    selectedSiteIds={selectedSiteIds}
                    onSiteToggle={handleSiteToggle}
                    scope={selectedScope}
                    getSiteState={getSiteState}
                  />
                )}
              </ScrollArea>
              <p className="text-muted-foreground text-sm">
                {selectedSiteIds.length} site(s) sélectionné(s)
              </p>
            </div>
            <DialogFooter className="bg-background flex shrink-0 justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedSiteIds.length === 0}
              >
                {isSubmitting ? "Attribution..." : "Attribuer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
