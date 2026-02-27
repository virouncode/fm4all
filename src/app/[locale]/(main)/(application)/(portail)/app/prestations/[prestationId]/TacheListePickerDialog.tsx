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
import { updateClientServiceTacheListeAction } from "@/server/actions/clientServicesActions";
import { getAvailableTacheListesTemplatesAction } from "@/server/actions/tacheListesTemplatesActions";
import type { TacheListeTemplateWithItems } from "@/server/queries/tacheListesTemplates.query";
import { CheckCircle2, ClipboardList, Clock, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TacheListePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "client_service" → modifie la prestation ; "execution" → modifie l'exécution */
  context: "client_service" | "execution";
  /** ID de la prestation (client_service) ou de l'exécution */
  entityId: string;
  /** ID de la prestation (toujours requis pour les permissions) */
  prestationId: string;
  /** ID du service (pour filtrer les packs compatibles) */
  serviceId: string;
  /** ID de l'entreprise cliente */
  entrepriseId: string;
  /** ID de l'exécution (si context="execution") — pour charger les packs prestataire */
  executionId?: string;
  /** Pack actuellement assigné */
  currentPackId?: string | null;
  /** Callback déclenché après une sélection réussie */
  onSuccess: () => void;
}

export function TacheListePickerDialog({
  open,
  onOpenChange,
  context,
  entityId,
  prestationId,
  serviceId,
  entrepriseId,
  executionId,
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

    let result;
    if (context === "client_service") {
      result = await updateClientServiceTacheListeAction({
        prestationId: entityId,
        entrepriseId,
        tacheListeTemplateId: selectedPackId,
      });
    } else {
      result = await updateExecutionTacheListeAction({
        executionId: entityId,
        prestationId,
        entrepriseId,
        tacheListeTemplateId: selectedPackId,
      });
    }

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
    onOpenChange(false);
    onSuccess();
  };

  const isDirty = selectedPackId !== (currentPackId ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="text-primary h-5 w-5" />
            Choisir une checklist
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
                  <div className="flex items-center gap-2">
                    {selectedPackId === null && (
                      <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
                    )}
                    <span
                      className={
                        selectedPackId === null
                          ? "text-primary font-medium"
                          : "text-muted-foreground italic"
                      }
                    >
                      Aucune checklist
                    </span>
                  </div>
                </button>

                {/* Liste des packs */}
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className="overflow-hidden rounded-lg border"
                  >
                    {/* Header du pack */}
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 p-3 text-left text-sm transition-colors ${
                        selectedPackId === pack.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedPackId(pack.id)}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {selectedPackId === pack.id && (
                          <CheckCircle2 className="text-primary h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate font-medium">{pack.nom}</span>
                        <Badge
                          variant="outline"
                          className="flex-shrink-0 text-xs"
                        >
                          {pack.items.length} tâche
                          {pack.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Toggle aperçu */}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground flex-shrink-0 text-xs underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPackId(
                            expandedPackId === pack.id ? null : pack.id,
                          );
                        }}
                      >
                        {expandedPackId === pack.id ? "Masquer" : "Aperçu"}
                      </button>
                    </button>

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
            <X className="h-4 w-4" />
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
