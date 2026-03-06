"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { updateExecutionTacheListeAction } from "@/server/actions/clientServiceExecutionsActions";
import { getAvailableTacheListesTemplatesAction } from "@/server/actions/tacheListesTemplatesActions";
import type { TacheListeTemplateWithItems } from "@/server/queries/tacheListesTemplates.query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TacheListePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ID de l'exécution */
  executionId: string;
  /** ID de la prestation (pour les permissions) */
  prestationId: string;
  /** ID du service (pour filtrer les packs compatibles) */
  serviceId: string;
  /** Nom du service (pour l'affichage dans le titre) */
  serviceNom?: string;
  /** ID de l'entreprise cliente */
  entrepriseId: string;
  /** Pack actuellement assigné */
  currentPackId?: string | null;
  /** Callback déclenché après une sélection réussie — reçoit le pack sélectionné ou null */
  onSuccess: (pack: TacheListeTemplateWithItems | null) => void;
}

export function TacheListePickerDialog({
  open,
  onOpenChange,
  executionId,
  prestationId,
  serviceId,
  serviceNom,
  entrepriseId,
  currentPackId,
  onSuccess,
}: TacheListePickerDialogProps) {
  const [packs, setPacks] = useState<TacheListeTemplateWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(
    currentPackId ?? null,
  );
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);

  // Charger les packs disponibles à l'ouverture
  useEffect(() => {
    if (!open) return;

    setSelectedPackId(currentPackId ?? null);

    async function loadPacks() {
      setLoading(true);
      const result = await getAvailableTacheListesTemplatesAction({
        serviceId,
        entrepriseId,
        executionId,
      });
      if (result?.serverError) {
        toast.error("Impossible de charger les checklists disponibles.");
      } else if (result?.data?.packs) {
        setPacks(result.data.packs);
      }
      setLoading(false);
    }
    loadPacks();
  }, [open, serviceId, entrepriseId, executionId, currentPackId]);

  const handleSave = async () => {
    setSaving(true);

    const result = await updateExecutionTacheListeAction({
      executionId,
      prestationId,
      entrepriseId,
      tacheListeTemplateId: selectedPackId,
    });

    setSaving(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success(
      selectedPackId
        ? "Checklist assignée avec succès."
        : "Checklist désassignée.",
    );
    const selectedPack = selectedPackId
      ? (packs.find((p) => p.id === selectedPackId) ?? null)
      : null;
    onOpenChange(false);
    onSuccess(selectedPack);
  };

  const isDirty = selectedPackId !== (currentPackId ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary h-5 w-5" />
            Choisir une checklist
            {serviceNom && (
              <span className="text-muted-foreground text-sm font-normal">
                — {serviceNom}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : packs.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground text-sm">
                Aucune checklist disponible pour ce service.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] px-6 py-4">
              <div className="space-y-2">
                {/* Option "Aucune checklist" */}
                <button
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                    selectedPackId === null
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedPackId(null)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        selectedPackId === null
                          ? "text-primary font-medium"
                          : "text-muted-foreground italic"
                      }
                    >
                      Aucune checklist
                    </span>
                    {selectedPackId === null && (
                      <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Liste des packs */}
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className={`overflow-hidden rounded-lg border transition-colors ${
                      selectedPackId === pack.id ? "border-primary" : ""
                    }`}
                  >
                    {/* Header du pack — clic partout pour sélectionner, chevron pour déplier */}
                    <div
                      role="button"
                      tabIndex={0}
                      className={`flex w-full cursor-pointer items-center gap-2 p-3 text-sm transition-colors ${
                        selectedPackId === pack.id
                          ? "bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedPackId(pack.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedPackId(pack.id);
                      }}
                    >
                      {/* Chevron toggle (gauche) — stoppe la propagation */}
                      {pack.items.length > 0 ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPackId(
                              expandedPackId === pack.id ? null : pack.id,
                            );
                          }}
                          aria-label={
                            expandedPackId === pack.id ? "Réduire" : "Développer"
                          }
                        >
                          {expandedPackId === pack.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="h-4 w-4 flex-shrink-0" />
                      )}

                      {/* Nom + badges */}
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate font-medium">{pack.nom}</span>
                        {pack.proprietaireEntrepriseId === null ? (
                          <span className="flex-shrink-0 rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
                            Système
                          </span>
                        ) : pack.proprietaireEntrepriseId === entrepriseId ? (
                          <span className="flex-shrink-0 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            Client
                          </span>
                        ) : (
                          <span className="flex-shrink-0 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Prestataire
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 text-xs"
                        >
                          {pack.items.length} tâche
                          {pack.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Check circle (droite) */}
                      {selectedPackId === pack.id && (
                        <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
                      )}
                    </div>

                    {/* Aperçu des items */}
                    {expandedPackId === pack.id && pack.items.length > 0 && (
                      <div className="bg-muted/30 divide-y border-t">
                        {pack.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-2 px-3 py-2 text-xs"
                          >
                            <span className="text-muted-foreground w-5 flex-shrink-0 text-center">
                              {idx + 1}.
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium">{item.titre}</span>
                              {item.description && (
                                <p className="text-muted-foreground mt-0.5 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.dureeEstimeeMinutes && (
                              <span className="text-muted-foreground flex flex-shrink-0 items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.dureeEstimeeMinutes}min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
