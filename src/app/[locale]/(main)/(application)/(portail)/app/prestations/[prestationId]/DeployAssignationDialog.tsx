"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { deployAssignationAction } from "@/server/actions/clientServiceOccurrencesActions";
import { getAssignableUsersForOccurrenceAction } from "@/server/actions/clientServiceOccurrencesActions";
import type { ExecutionWithPrix } from "@/server/queries/clientServiceExecutions.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DeployAssignationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: ExecutionWithPrix;
  prestation: PrestationListItem;
  onSuccess: () => void;
};

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export function DeployAssignationDialog({
  open,
  onOpenChange,
  execution,
  prestation,
  onSuccess,
}: DeployAssignationDialogProps) {
  const [assignableUsers, setAssignableUsers] = useState<
    Array<{ id: string; prenom: string; nom: string }>
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [applyToTaches, setApplyToTaches] = useState(false);
  const today = new Date();
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const [dateFrom, setDateFrom] = useState(toDateInputValue(today));
  const [dateTo, setDateTo] = useState(toDateInputValue(in90Days));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load assignable users when dialog opens
  useEffect(() => {
    if (!open || !execution.prestataireEntrepriseId) return;

    setLoadingUsers(true);
    // Pre-fill with execution default if set
    setSelectedUserId(execution.assigneeUserIdDefault ?? "");
    setApplyToTaches(false);
    setDateFrom(toDateInputValue(new Date()));
    setDateTo(toDateInputValue(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)));

    getAssignableUsersForOccurrenceAction({
      entrepriseId: execution.prestataireEntrepriseId,
    })
      .then((result) => {
        if (result?.data?.users) {
          setAssignableUsers(result.data.users);
        }
      })
      .finally(() => setLoadingUsers(false));
  }, [open, execution.prestataireEntrepriseId, execution.assigneeUserIdDefault]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await deployAssignationAction({
      executionId: execution.id,
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      assigneeUserId: selectedUserId || null,
      applyToTaches,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    setIsSubmitting(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      const { updatedOccurrencesCount, updatedTachesCount } = result.data;
      if (updatedOccurrencesCount === 0) {
        toast.info("Aucune intervention à mettre à jour dans cette fenêtre.");
      } else {
        toast.success(
          `${updatedOccurrencesCount} intervention${updatedOccurrencesCount > 1 ? "s" : ""} mise${updatedOccurrencesCount > 1 ? "s" : ""} à jour` +
            (applyToTaches && updatedTachesCount > 0
              ? ` (${updatedTachesCount} tâche${updatedTachesCount > 1 ? "s" : ""})`
              : "") +
            ".",
        );
      }
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Déployer l&apos;assignation</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Intervenant */}
          <div className="space-y-2">
            <Label>Intervenant</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={loadingUsers}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingUsers
                      ? "Chargement..."
                      : assignableUsers.length === 0
                        ? "Aucun utilisateur disponible"
                        : "Sélectionnez un intervenant"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground italic">
                    Aucun (retirer l&apos;assignation)
                  </span>
                </SelectItem>
                {assignableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.prenom} {u.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fenêtre de dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Du</Label>
              <input
                id="dateFrom"
                type="date"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Au</Label>
              <input
                id="dateTo"
                type="date"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Appliquer aux tâches */}
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={applyToTaches}
              onCheckedChange={(checked) => setApplyToTaches(!!checked)}
            />
            <span className="text-sm">
              Appliquer aussi aux tâches non terminées
            </span>
          </label>

          <p className="text-muted-foreground text-xs">
            Met à jour les interventions{" "}
            <strong>planifiées ou en cours</strong> de cette exécution dans la
            fenêtre sélectionnée. N&apos;affecte pas les interventions
            terminées, annulées ou non honorées.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || loadingUsers}
          >
            {isSubmitting && <Spinner />}
            Déployer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
