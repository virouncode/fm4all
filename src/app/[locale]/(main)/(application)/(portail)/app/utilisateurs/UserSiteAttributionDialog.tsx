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
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import {
  bulkInsertMixedPrestataireAttributionsAction,
  getUserPrestataireSiteAttributionsAction,
} from "@/server/actions/userPrestataireSiteAttributionsActions";
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
  type RolePrestataireAttributionSiteType,
  type SelectUserPrestataireSiteAttributionWithInheritanceType,
  type SelectUserSiteAttributionWithInheritanceType,
} from "@/zod-schemas/userSiteAttribution.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AttributionSitesTree } from "./AttributionSitesTree";
import {
  getAvailableRolesByPostureAndLevel,
  getAvailableRolesByPosturePrestataire,
  roleLabels,
  rolePrestataireLabels,
  scopeLabels,
} from "./helpers";

type UserSiteAttributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  entrepriseId: string;
  onSuccess: () => void;
  defaultClientId?: string;
};

export function UserSiteAttributionDialog({
  open,
  onOpenChange,
  userId,
  entrepriseId,
  onSuccess,
  defaultClientId,
}: UserSiteAttributionDialogProps) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [allSites, setAllSites] = useState<SelectSiteType[]>([]);
  const [directAttributions, setDirectAttributions] = useState<
    | SelectUserSiteAttributionWithInheritanceType[]
    | SelectUserPrestataireSiteAttributionWithInheritanceType[]
  >([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [tree, setTree] = useState<SiteTreeNode[]>([]);

  // Pour posture prestataire : liste de clients + client sélectionné
  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState(false);

  const posture = useAppStore((state) => state.postureActive);
  const currentUserClientRole = useAppStore(
    (state) => state.roleClientAdhesion,
  );
  const currentUserPrestataireRole = useAppStore(
    (state) => state.rolePrestataireAdhesion,
  );
  const rolePlateformeAdhesion = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );

  const isPrestataire = posture === "prestataire";

  // Calcul des rôles disponibles selon la posture
  const availableRoles = isPrestataire
    ? getAvailableRolesByPosturePrestataire(
        currentUserPrestataireRole,
        rolePlateformeAdhesion,
      )
    : getAvailableRolesByPostureAndLevel(
        posture,
        currentUserClientRole,
        rolePlateformeAdhesion,
      );

  const roleOptions = availableRoles.map((role) => ({
    value: role,
    label: isPrestataire
      ? rolePrestataireLabels[role as RolePrestataireAttributionSiteType]
      : (roleLabels[role] ?? role),
  }));

  // Schema du formulaire (role + scope — sans siteIds/userId/entrepriseId)
  // clientId ajouté pour posture prestataire (sélecteur client via RhfControlledSelect)
  const formSchema = bulkInsertUserSiteAttributionsFormSchema
    .omit({
      siteIds: true,
      userId: true,
      entrepriseId: true,
    })
    .extend({
      clientId: z.string().optional(),
    });
  type FormValuesType = z.infer<typeof formSchema>;

  const form = useForm<FormValuesType>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      mode: "inclure",
      role: "observateur_site",
      scope: "subtree",
      clientId: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });
  const selectedScope = useWatch({ control: form.control, name: "scope" });

  // Pré-sélectionner le client si fourni à l'ouverture
  useEffect(() => {
    if (open && isPrestataire && defaultClientId) {
      setSelectedClientId(defaultClientId);
      form.setValue("clientId", defaultClientId);
    }
  }, [open, isPrestataire, defaultClientId, form]);

  // Charger les clients (posture prestataire uniquement)
  useEffect(() => {
    if (!open || !isPrestataire) return;
    async function loadClients() {
      setLoadingClients(true);
      const result = await getMesClientsAction({ entrepriseId });
      if (result?.data?.clients) {
        setClients(
          result.data.clients.map((c) => ({
            id: c.id,
            nom: c.nom,
          })),
        );
      }
      setLoadingClients(false);
    }
    loadClients();
  }, [open, isPrestataire, entrepriseId]);

  // Charger sites + attributions quand dialog s'ouvre (client) ou quand selectedClientId change (prestataire)
  useEffect(() => {
    if (!open) return;
    if (isPrestataire && !selectedClientId) return;

    const fetchData = async () => {
      setLoadingSites(true);
      try {
        if (isPrestataire) {
          const result = await getUserPrestataireSiteAttributionsAction({
            userId,
            clientEntrepriseId: selectedClientId,
          });

          if (result?.serverError) {
            toast.error(result.serverError.message);
            setAllSites([]);
            setDirectAttributions([]);
            return;
          }

          if (result?.data) {
            setAllSites(result.data.allSites);
            const direct = (
              result.data
                .attributions as SelectUserPrestataireSiteAttributionWithInheritanceType[]
            ).filter((attr) => !attr.isInherited);
            setDirectAttributions(direct);
          }
        } else {
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
            const direct = (
              result.data
                .attributions as SelectUserSiteAttributionWithInheritanceType[]
            ).filter((attr) => !attr.isInherited);
            setDirectAttributions(direct);
          }
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
    setSelectedSiteIds([]);
  }, [open, userId, entrepriseId, isPrestataire, selectedClientId]);

  // Construire l'arbre quand les sites changent
  useEffect(() => {
    if (allSites.length > 0) {
      setTree(buildSiteTree(allSites));
    } else {
      setTree([]);
    }
  }, [allSites]);

  // Reset complet à la fermeture
  useEffect(() => {
    if (!open) {
      setSelectedSiteIds([]);
      setAllSites([]);
      setDirectAttributions([]);
      setTree([]);
      setSelectedClientId("");
      form.reset({
        mode: "inclure",
        role: "observateur_site",
        scope: "subtree",
      });
    }
  }, [open, form]);

  /**
   * Calcule l'état d'un site : "disabled" si déjà attribué (inclure ou hérité), "available" sinon.
   */
  const getSiteState = (siteId: string): "disabled" | "available" => {
    const directAttr = directAttributions.find(
      (attr) => attr.siteId === siteId,
    );

    if (directAttr) {
      if (directAttr.mode === "inclure") return "disabled";
      if (directAttr.mode === "exclure") return "available";
    }

    let currentId: string | null = siteId;
    while (currentId) {
      const site = allSites.find((s) => s.id === currentId);
      if (!site?.parentId) break;

      const parentAttr = directAttributions.find(
        (attr) =>
          attr.siteId === site.parentId &&
          attr.scope === "subtree" &&
          attr.mode === "inclure",
      );

      if (parentAttr) return "disabled";
      currentId = site.parentId;
    }

    return "available";
  };

  const handleSiteToggle = (siteId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedSiteIds((prev) => {
        const newIds = [...prev, siteId];
        if (selectedScope === "subtree") {
          const node = findSiteInTree(tree, siteId);
          if (node) {
            const descendantIds = getAllDescendantIds(node).filter(
              (id) => id !== siteId,
            );
            return [...new Set([...newIds, ...descendantIds])];
          }
        }
        return newIds;
      });
    } else {
      setSelectedSiteIds((prev) => {
        let idsToRemove = [siteId];
        if (selectedScope === "subtree") {
          const node = findSiteInTree(tree, siteId);
          if (node) {
            idsToRemove = getAllDescendantIds(node);
          }
        }
        return prev.filter((id) => !idsToRemove.includes(id));
      });
    }
  };

  const onSubmit = async (data: FormValuesType) => {
    if (selectedSiteIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un site");
      return;
    }

    // Construire les attributions mixtes (racines + exclusions)
    const attributions: Array<{
      siteId: string;
      mode: "inclure" | "exclure";
      scope: "self" | "subtree";
      role: string;
    }> = [];

    const exclusionsToDelete: string[] = [];
    const selectedSet = new Set(selectedSiteIds);

    const hasCheckedParent = (siteId: string): boolean => {
      const site = allSites.find((s) => s.id === siteId);
      if (!site || !site.parentId) return false;
      if (selectedSet.has(site.parentId)) return true;
      return hasCheckedParent(site.parentId);
    };

    const roots = selectedSiteIds.filter(
      (siteId) => !hasCheckedParent(siteId),
    );

    for (const rootId of roots) {
      const existingExclusion = directAttributions.find(
        (attr) => attr.siteId === rootId && attr.mode === "exclure",
      );
      if (existingExclusion) {
        exclusionsToDelete.push(existingExclusion.id);
      }

      attributions.push({
        siteId: rootId,
        mode: "inclure",
        scope: data.scope,
        role: data.role,
      });

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
              role: data.role,
            });
          }
        }
      }
    }

    let result;

    if (isPrestataire) {
      result = await bulkInsertMixedPrestataireAttributionsAction({
        userId,
        clientEntrepriseId: selectedClientId,
        attributions: attributions.map((a) => ({
          ...a,
          role: a.role as RolePrestataireAttributionSiteType,
        })),
        exclusionsToDelete:
          exclusionsToDelete.length > 0 ? exclusionsToDelete : undefined,
      });
    } else {
      result = await bulkInsertMixedAttributionsAction({
        userId,
        entrepriseId,
        attributions: attributions.map((a) => ({
          ...a,
          role: a.role as RoleClientAttributionType,
        })),
        exclusionsToDelete:
          exclusionsToDelete.length > 0 ? exclusionsToDelete : undefined,
      });
    }

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      const count = result.data.count;
      let message = `${count} site(s) attribué(s) avec succès`;

      // Afficher info canonisation si disponible (posture client)
      if (
        "canonizedCount" in result.data &&
        "originalCount" in result.data &&
        result.data.canonizedCount < result.data.originalCount
      ) {
        const cleaned = result.data.originalCount - result.data.canonizedCount;
        message += ` (${cleaned} redondance(s) évitée(s))`;
      }
      if ("deletedCount" in result.data && result.data.deletedCount > 0) {
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
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <MapPin className="text-primary" />
              Attribuer des sites
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-2">
            {/* Sélecteur de client (posture prestataire uniquement) */}
            {isPrestataire && (
              <RhfControlledSelect<FormValuesType>
                name="clientId"
                label="Client"
                requiredMark
                placeholder="Sélectionnez un client"
                selectClassName="w-full"
                disabled={loadingClients}
                onChange={(value) => {
                  setSelectedClientId(value as string);
                  setSelectedSiteIds([]);
                }}
              >
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            )}


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
                {isPrestataire && !selectedClientId ? (
                  <p className="text-muted-foreground text-sm">
                    Sélectionnez d&apos;abord un client
                  </p>
                ) : loadingSites ? (
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                ) : allSites.length === 0 && (selectedClientId || !isPrestataire) ? (
                  <p className="text-muted-foreground text-sm">
                    {isPrestataire
                      ? "Ce client n'a pas encore de sites."
                      : "Aucun site disponible"}
                  </p>
                ) : allSites.length > 0 &&
                  allSites.every((s) => getSiteState(s.id) === "disabled") ? (
                  <p className="text-muted-foreground text-sm">
                    Tous les sites disponibles sont déjà attribués à cet utilisateur.
                  </p>
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
            </div>

            <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 justify-end gap-2 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  selectedSiteIds.length === 0 ||
                  (isPrestataire && !selectedClientId)
                }
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
