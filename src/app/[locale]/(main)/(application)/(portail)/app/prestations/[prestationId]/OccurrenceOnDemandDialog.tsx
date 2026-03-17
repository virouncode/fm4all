"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { insertOccurrenceOnDemandAction } from "@/server/actions/clientServiceOccurrencesActions";
import type { TacheListeTemplateWithItems } from "@/server/queries/tacheListesTemplates.query";
import type { OccurrenceListItem } from "@/server/queries/clientServiceExecutions.query";
import {
  insertOccurrenceOnDemandFormSchema,
  type InsertOccurrenceOnDemandFormType,
} from "@/zod-schemas/clientServiceOccurrences.schema";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { useAppStore } from "@/stores/application/appStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  ListChecks,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { OccurrenceTacheListePickerDialog } from "./OccurrenceTacheListePickerDialog";
import { TacheListeManagerDialog } from "./TacheListeManagerDialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestation: PrestationListItem;
  onSuccess: (occurrence: OccurrenceListItem) => void;
};

export function OccurrenceOnDemandDialog({
  open,
  onOpenChange,
  prestation,
  onSuccess,
}: Props) {
  const postureActive = useAppStore((state) => state.postureActive);

  // Checklist state (managed outside RHF — set during creation)
  const [localChecklist, setLocalChecklist] =
    useState<TacheListeTemplateWithItems | null>(null);
  const [checklistPickerOpen, setChecklistPickerOpen] = useState(false);
  const [checklistManagerOpen, setChecklistManagerOpen] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);

  const form = useForm<InsertOccurrenceOnDemandFormType>({
    resolver: zodResolver(insertOccurrenceOnDemandFormSchema),
    mode: "onTouched",
    defaultValues: {
      prestationId: prestation.id,
      entrepriseId: prestation.entrepriseId,
      dateDebutPrevue: "",
      dateFinPrevue: "",
      notes: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  // Reset form and checklist state when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        prestationId: prestation.id,
        entrepriseId: prestation.entrepriseId,
        dateDebutPrevue: "",
        dateFinPrevue: "",
        notes: "",
      });
      setLocalChecklist(null);
      setChecklistExpanded(false);
    }
  }, [open, prestation.id, prestation.entrepriseId, form]);

  const onSubmit = async (data: InsertOccurrenceOnDemandFormType) => {
    const result = await insertOccurrenceOnDemandAction({
      prestationId: data.prestationId,
      entrepriseId: data.entrepriseId,
      dateDebutPrevue: data.dateDebutPrevue,
      dateFinPrevue: data.dateFinPrevue || undefined,
      notes: data.notes || undefined,
      tacheListeTemplateId: localChecklist?.id,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.occurrence) {
      toast.success("Passage créé avec succès.");
      onSuccess(result.data.occurrence);
      onOpenChange(false);
    }
  };

  const isRecurrenceAuto = prestation.famillePlanification === "recurrence_auto";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="sm:max-w-lg">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CalendarPlus className="text-primary h-4 w-4" />Ajouter une intervention</DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {isRecurrenceAuto && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">
                    Intervention ponctuelle
                  </AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Cette prestation a un planning automatique. Cette intervention
                    s&apos;ajoutera ponctuellement, hors planning habituel.
                  </AlertDescription>
                </Alert>
              )}

              <RhfInput<InsertOccurrenceOnDemandFormType>
                name="dateDebutPrevue"
                label="Date et heure de début"
                type="datetime-local"
                requiredMark
              />

              <RhfInput<InsertOccurrenceOnDemandFormType>
                name="dateFinPrevue"
                label="Date et heure de fin (facultatif)"
                type="datetime-local"
              />

              <RhfTextArea<InsertOccurrenceOnDemandFormType>
                name="notes"
                label="Notes / instructions (facultatif)"
                placeholder="Précisions sur l'intervention…"
                rows={3}
              />

              <Separator />

              {/* Section Checklist */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <ListChecks className="text-primary h-4 w-4 shrink-0" />
                    Checklist (optionnel)
                  </span>
                  <p className="text-muted-foreground text-xs">
                    Laissez vide pour hériter de la règle / exécution par défaut.
                  </p>
                  {localChecklist ? (
                    <div className="mt-1 overflow-hidden rounded-lg border">
                      <div className="flex items-center gap-2 p-3">
                        {localChecklist.items.length > 0 ? (
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => setChecklistExpanded((v) => !v)}
                            aria-label={checklistExpanded ? "Réduire" : "Développer"}
                          >
                            {checklistExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="h-4 w-4 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {localChecklist.nom}
                        </span>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {localChecklist.items.length} tâche
                          {localChecklist.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {checklistExpanded && localChecklist.items.length > 0 && (
                        <div className="bg-muted/30 divide-y border-t">
                          {localChecklist.items.map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2 px-3 py-2 text-xs"
                            >
                              <span className="text-muted-foreground w-5 shrink-0 text-center">
                                {idx + 1}.
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium">{item.titre}</span>
                              </div>
                              {item.dureeEstimeeMinutes && (
                                <span className="text-muted-foreground flex shrink-0 items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.dureeEstimeeMinutes}min
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1 text-xs italic">
                      Héritage automatique (règle → exécution).
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1.5 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setChecklistPickerOpen(true)}
                  >
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setChecklistManagerOpen(true)}
                  >
                    Gérer les checklists
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogStyledBody>

        <OccurrenceTacheListePickerDialog
          open={checklistPickerOpen}
          onOpenChange={setChecklistPickerOpen}
          prestationId={prestation.id}
          serviceId={prestation.serviceId}
          serviceNom={prestation.serviceNom}
          entrepriseId={prestation.entrepriseId}
          currentPackId={localChecklist?.id ?? null}
          onSuccess={(pack) => {
            setLocalChecklist(pack);
            setChecklistExpanded(false);
          }}
        />
        <TacheListeManagerDialog
          open={checklistManagerOpen}
          onOpenChange={setChecklistManagerOpen}
          serviceId={prestation.serviceId}
          serviceNom={prestation.serviceNom}
          proprietaireEntrepriseId={
            postureActive === "plateforme" ? null : prestation.entrepriseId
          }
          clientEntrepriseId={
            postureActive === "plateforme" ? prestation.entrepriseId : undefined
          }
          clientEntrepriseNom={
            postureActive === "plateforme" ? prestation.entrepriseNom : undefined
          }
        />

        <DialogStyledFooter>
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
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="size-3" /> : <CalendarPlus className="size-3" />}
            Créer le passage
          </Button>
        </DialogStyledFooter>
      </DialogStyledContent>
    </Dialog>
  );
}
