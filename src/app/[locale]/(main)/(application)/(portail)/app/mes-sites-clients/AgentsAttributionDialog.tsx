"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsersByEntrepriseAction } from "@/server/actions/usersActions";
import {
  deleteUserSiteAttributionAction,
  insertUserSiteAttributionAction,
} from "@/server/actions/userSiteAttributionsActions";
import type {
  PrestataireUserOnSite,
  SiteClientAvecAgents,
} from "@/server/queries/clientServiceExecutions.query";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AgentsAttributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SiteClientAvecAgents;
  prestataireEntrepriseId: string;
  onAttributionChange: (
    siteId: string,
    updatedAgents: PrestataireUserOnSite[],
  ) => void;
}

type PrestataireUser = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
};

export function AgentsAttributionDialog({
  open,
  onOpenChange,
  site,
  prestataireEntrepriseId,
  onAttributionChange,
}: AgentsAttributionDialogProps) {
  const [allUsers, setAllUsers] = useState<PrestataireUser[]>([]);
  const [agents, setAgents] = useState<PrestataireUserOnSite[]>(
    site.agentsAttribues,
  );
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState("");
  const [addingRole, setAddingRole] = useState<
    "responsable_site" | "intervenant_site"
  >("intervenant_site");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset agents quand le site change
  useEffect(() => {
    setAgents(site.agentsAttribues);
    setAddingUserId("");
  }, [site.siteId, site.agentsAttribues]);

  // Charger tous les utilisateurs du prestataire
  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoadingUsers(true);
      const result = await getUsersByEntrepriseAction({
        entrepriseId: prestataireEntrepriseId,
      });
      setLoadingUsers(false);
      const users = Array.isArray(result?.data) ? result.data : [];
      setAllUsers(
        users.map((u) => ({
          id: u.id,
          prenom: u.prenom,
          nom: u.nom,
          email: u.email,
        })),
      );
    }
    load();
  }, [open, prestataireEntrepriseId]);

  const attributedUserIds = new Set(agents.map((a) => a.userId));
  const availableUsers = allUsers.filter((u) => !attributedUserIds.has(u.id));

  const handleAdd = async () => {
    if (!addingUserId) return;
    setIsAdding(true);

    const result = await insertUserSiteAttributionAction({
      userId: addingUserId,
      siteId: site.siteId,
      entrepriseId: prestataireEntrepriseId,
      mode: "inclure",
      scope: "self",
      role: addingRole as import("@/zod-schemas/userSiteAttribution.schema").RoleClientAttributionType,
    });

    setIsAdding(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.attribution) {
      const newUser = allUsers.find((u) => u.id === addingUserId);
      if (!newUser) return;

      const newAgent: PrestataireUserOnSite = {
        attributionId: result.data.attribution.id,
        userId: addingUserId,
        userPrenom: newUser.prenom,
        userNom: newUser.nom,
        userEmail: newUser.email,
        role: addingRole as import("@/zod-schemas/userSiteAttribution.schema").RoleClientAttributionType,
      };

      const updated = [...agents, newAgent];
      setAgents(updated);
      onAttributionChange(site.siteId, updated);
      setAddingUserId("");
      toast.success("Agent attribué avec succès");
    }
  };

  const handleRemove = async (agent: PrestataireUserOnSite) => {
    setDeletingId(agent.attributionId);

    const result = await deleteUserSiteAttributionAction({
      id: agent.attributionId,
      userId: agent.userId,
    });

    setDeletingId(null);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    const updated = agents.filter(
      (a) => a.attributionId !== agent.attributionId,
    );
    setAgents(updated);
    onAttributionChange(site.siteId, updated);
    toast.success("Attribution supprimée");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="text-primary h-4 w-4" />
            Gérer les agents
          </DialogTitle>
          <DialogDescription>
            {site.siteNom} ·{" "}
            <span className="font-medium">{site.clientEntrepriseNom}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Agents attribués */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Agents attribués</p>
            {agents.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun agent attribué à ce site.
              </p>
            ) : (
              <ul className="space-y-2">
                {agents.map((agent) => (
                  <li
                    key={agent.attributionId}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">
                        {agent.userPrenom} {agent.userNom}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px]"
                      >
                        {agent.role === "responsable_site"
                          ? "Responsable"
                          : "Intervenant"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-7 w-7 flex-shrink-0 p-0"
                      onClick={() => handleRemove(agent)}
                      disabled={deletingId === agent.attributionId}
                    >
                      {deletingId === agent.attributionId ? (
                        <X className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ajouter un agent */}
          {!loadingUsers && availableUsers.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Ajouter un agent</p>
              <div className="flex gap-2">
                <Select value={addingUserId} onValueChange={setAddingUserId}>
                  <SelectTrigger className="flex-1 text-sm">
                    <SelectValue placeholder="Choisir un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.prenom} {u.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={addingRole}
                  onValueChange={(v) =>
                    setAddingRole(
                      v as "responsable_site" | "intervenant_site",
                    )
                  }
                >
                  <SelectTrigger className="w-36 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intervenant_site">
                      Intervenant
                    </SelectItem>
                    <SelectItem value="responsable_site">
                      Responsable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!addingUserId || isAdding}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Attribuer
              </Button>
            </div>
          )}

          {loadingUsers && (
            <p className="text-muted-foreground text-sm">
              Chargement des utilisateurs…
            </p>
          )}

          {!loadingUsers && availableUsers.length === 0 && allUsers.length > 0 && (
            <p className="text-muted-foreground border-t pt-4 text-sm">
              Tous vos utilisateurs sont déjà attribués à ce site.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
