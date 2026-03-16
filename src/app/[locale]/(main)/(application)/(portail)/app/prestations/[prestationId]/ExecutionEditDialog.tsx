"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { modePilotageCT } from "@/constants/codeTables";
import { updateExecutionAction } from "@/server/actions/clientServiceExecutionsActions";
import { useAppStore } from "@/stores/application/appStore";
import type {
  ExecutionChecklistItem,
  ExecutionPrixItem,
  ExecutionWithPrix,
} from "@/server/queries/clientServiceExecutions.query";
import {
  type UpdateExecutionFormType,
  updateExecutionFormSchema,
} from "@/zod-schemas/clientServiceExecutions.schema";
import type { ModeCommercialType } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { TacheListeManagerDialog } from "./TacheListeManagerDialog";
import { TacheListePickerDialog } from "./TacheListePickerDialog";

type ExecutionEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  execution: ExecutionWithPrix;
  prestationId: string;
  entrepriseId: string;
  serviceId: string;
  modeCommercial: ModeCommercialType;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  clientNom: string;
  serviceNom: string;
  /** Borne min du calendrier — date de début de la prestation (ISO YYYY-MM-DD) */
  prestationDateDebut?: string | null;
  /** Borne max du calendrier — date de fin de la prestation (ISO YYYY-MM-DD) */
  prestationDateFin?: string | null;
  onSuccess: (executions: ExecutionWithPrix[]) => void;
};

const TYPE_PRIX_OPTIONS = [
  { value: "abonnement", label: "Abonnement (récurrent)" },
  { value: "par_occurrence", label: "Par intervention" },
  { value: "installation", label: "Installation (one-shot)" },
  { value: "frais_livraison", label: "Frais par intervention" },
] as const;

const TYPE_PRIX_HELP: Record<string, string> = {
  abonnement:
    "Facturé à chaque période (semaine/mois/an), indépendamment du nombre d'interventions.",
  par_occurrence: "Facturé à chaque intervention réalisée.",
  installation:
    "Facturé une seule fois au démarrage (1ère intervention réalisée).",
  frais_livraison:
    "Facturé à chaque intervention réalisée, en supplément d'un éventuel abonnement.",
};

const PERIODE_OPTIONS = [
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
  { value: "annee", label: "Année" },
] as const;

function emptyPrixItem() {
  return {
    typePrix: "par_occurrence" as const,
    montantHt: "",
    coutPrestataireHt: "",
    margePourcent: "",
    periodeFacturation: undefined,
    nbOccurrencesIncluses: "",
  };
}

function prixItemToForm(prix: ExecutionPrixItem) {
  return {
    id: prix.id,
    typePrix: prix.typePrix,
    montantHt: (prix.montantHt / 100).toFixed(2),
    coutPrestataireHt:
      prix.coutPrestataireHt !== null
        ? (prix.coutPrestataireHt / 100).toFixed(2)
        : "",
    margePourcent:
      prix.margePourcent !== null ? String(prix.margePourcent) : "",
    periodeFacturation: prix.periodeFacturation ?? undefined,
    nbOccurrencesIncluses:
      prix.nbOccurrencesIncluses !== null
        ? String(prix.nbOccurrencesIncluses)
        : "",
  };
}

function getMontantLabel(
  typePrix: string,
  periodeFacturation: string | undefined,
  showIntermediaire: boolean,
): string {
  if (showIntermediaire) return "Montant HT — calculé (€)";
  switch (typePrix) {
    case "abonnement":
      switch (periodeFacturation) {
        case "mois":
          return "Montant HT / mois (€)";
        case "annee":
          return "Montant HT / an (€)";
        case "semaine":
          return "Montant HT / semaine (€)";
        default:
          return "Montant HT (€)";
      }
    case "par_occurrence":
      return "Montant HT / intervention (€)";
    case "installation":
      return "Montant HT installation (€)";
    case "frais_livraison":
      return "Montant HT livraison (€)";
    default:
      return "Montant HT (€)";
  }
}

export function ExecutionEditDialog({
  open,
  onOpenChange,
  execution,
  prestationId,
  entrepriseId,
  serviceId,
  modeCommercial,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  clientNom,
  serviceNom,
  prestationDateDebut,
  prestationDateFin,
  onSuccess,
}: ExecutionEditDialogProps) {
  const postureActive = useAppStore((state) => state.postureActive);

  // Checklist state (managed outside RHF — saved via separate action)
  const [checklistPickerOpen, setChecklistPickerOpen] = useState(false);
  const [checklistManagerOpen, setChecklistManagerOpen] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [localChecklistName, setLocalChecklistName] = useState<string | null>(
    execution.tacheListeTemplateName,
  );
  const [localChecklistItems, setLocalChecklistItems] = useState<
    ExecutionChecklistItem[]
  >(execution.tacheListeItems);
  const showIntermediaire =
    isPlateforme && modeCommercial === "intermediaire_fm4all";

  const clientGhost = !clientHasActiveAdmin;
  const prestataireGhost = !execution.prestataireHasActiveAdmin;
  const availableModePilotage = clientGhost
    ? modePilotageCT.filter((m) => m.code === "prestataire")
    : prestataireGhost
      ? modePilotageCT.filter((m) => m.code === "client")
      : modePilotageCT;

  const activePrix = execution.prix.filter((p) => p.actif);

  const form = useForm<UpdateExecutionFormType>({
    resolver: zodResolver(updateExecutionFormSchema),
    mode: "onTouched",
    defaultValues: {
      executionId: execution.id,
      prestationId,
      entrepriseId,
      dateDebutValidite: format(
        new Date(execution.dateDebutValidite),
        "yyyy-MM-dd",
      ),
      dateFinValidite: execution.dateFinValidite
        ? format(new Date(execution.dateFinValidite), "yyyy-MM-dd")
        : "",
      priorite: String(execution.priorite),
      modePilotage: execution.modePilotage,
      prix:
        activePrix.length > 0
          ? activePrix.map(prixItemToForm)
          : [emptyPrixItem()],
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prix",
  });

  useEffect(() => {
    if (!open) return;
    setLocalChecklistName(execution.tacheListeTemplateName);
    setLocalChecklistItems(execution.tacheListeItems);
    setChecklistExpanded(false);
    const activePrixForReset = execution.prix.filter((p) => p.actif);
    form.reset({
      executionId: execution.id,
      prestationId,
      entrepriseId,
      dateDebutValidite: format(
        new Date(execution.dateDebutValidite),
        "yyyy-MM-dd",
      ),
      dateFinValidite: execution.dateFinValidite
        ? format(new Date(execution.dateFinValidite), "yyyy-MM-dd")
        : "",
      priorite: String(execution.priorite),
      modePilotage: execution.modePilotage,
      prix:
        activePrixForReset.length > 0
          ? activePrixForReset.map(prixItemToForm)
          : [emptyPrixItem()],
    });
  }, [open, execution, prestationId, entrepriseId, form]);

  const watchedPrix = useWatch({ control: form.control, name: "prix" });

  function recalculateMontant(index: number, cout: string, marge: string) {
    const coutNum = Number(cout) || 0;
    const margeNum = Number(marge) || 0;
    const montant = coutNum * (1 + margeNum / 100);
    form.setValue(`prix.${index}.montantHt`, montant.toFixed(2), {
      shouldValidate: true,
    });
  }

  const onSubmit = async (data: UpdateExecutionFormType) => {
    const result = await updateExecutionAction(data);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      toast.success(result.data.message);
      onSuccess(result.data.executions);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;exécution</DialogTitle>
            {postureActive === "prestataire" && (
              <p className="text-muted-foreground text-sm">
                {clientNom} — {serviceNom}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              Prestataire :{" "}
              <strong>{execution.prestataireNom ?? "Inconnu"}</strong>
              <span className="ml-2 text-xs italic">
                (Pour changer de prestataire, créez une nouvelle exécution)
              </span>
            </p>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5 pb-4">
                {/* Mode de pilotage */}
                <RhfControlledSelect<UpdateExecutionFormType>
                  name="modePilotage"
                  label="Mode de pilotage"
                  requiredMark
                  description="Détermine qui pilote le workflow de cette exécution."
                  selectClassName="w-full"
                  disabled={!canChangeModePilotage}
                >
                  {availableModePilotage.map((m) => (
                    <SelectItem key={m.code} value={m.code}>
                      {m.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>

                {/* Dates de validité */}
                <div className="grid grid-cols-2 gap-4">
                  <RhfDatePicker<UpdateExecutionFormType>
                    name="dateDebutValidite"
                    label="Date de début"
                    requiredMark
                    buttonClassName="w-full"
                    min={prestationDateDebut ?? undefined}
                    max={prestationDateFin ?? undefined}
                  />
                  <RhfDatePicker<UpdateExecutionFormType>
                    name="dateFinValidite"
                    label="Date de fin (optionnelle)"
                    buttonClassName="w-full"
                    min={prestationDateDebut ?? undefined}
                    max={prestationDateFin ?? undefined}
                  />
                </div>

                {/* Priorité */}
                <RhfInput<UpdateExecutionFormType>
                  name="priorite"
                  label="Priorité"
                  requiredMark
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  description="Plus grand = prioritaire. 0 = global, 10 = bâtiment, 20 = zone."
                />

                {/* Tarifs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Tarifs <span className="text-destructive">*</span>
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append(emptyPrixItem())}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un tarif
                    </Button>
                  </div>

                  {fields.map((field, index) => {
                    const typePrix = watchedPrix?.[index]?.typePrix;
                    const periodeFacturation =
                      watchedPrix?.[index]?.periodeFacturation;
                    const isAbonnement = typePrix === "abonnement";
                    const montantLabel = getMontantLabel(
                      typePrix ?? "",
                      periodeFacturation,
                      showIntermediaire,
                    );

                    const otherTypes = watchedPrix
                      .filter((_, i) => i !== index)
                      .map((p) => p.typePrix);
                    const hasAbonnement = otherTypes.includes("abonnement");
                    const hasInstallation = otherTypes.includes("installation");

                    return (
                      <div
                        key={field.id}
                        className="bg-muted/30 space-y-3 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Tarif {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-7 w-7"
                              onClick={() => remove(index)}
                              aria-label="Supprimer ce tarif"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 items-start gap-3">
                          <FormField
                            control={form.control}
                            name={`prix.${index}.typePrix`}
                            render={({ field: f }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-xs">Type</FormLabel>
                                <Select
                                  value={f.value}
                                  onValueChange={f.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TYPE_PRIX_OPTIONS.map((opt) => {
                                      const isDisabled =
                                        (opt.value === "abonnement" &&
                                          hasAbonnement) ||
                                        (opt.value === "installation" &&
                                          hasInstallation);
                                      return (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                          disabled={isDisabled}
                                        >
                                          {opt.label}
                                          {isDisabled && " (déjà utilisé)"}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                {f.value && (
                                  <p className="text-muted-foreground text-[11px] leading-tight">
                                    {TYPE_PRIX_HELP[f.value]}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`prix.${index}.montantHt`}
                            render={({ field: f }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-xs">
                                  {montantLabel}
                                  {!showIntermediaire && " *"}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-8"
                                    readOnly={showIntermediaire}
                                    tabIndex={
                                      showIntermediaire ? -1 : undefined
                                    }
                                    {...f}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {showIntermediaire && (
                          <div className="grid grid-cols-2 items-start gap-3">
                            <FormField
                              control={form.control}
                              name={`prix.${index}.coutPrestataireHt`}
                              render={({ field: f }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-xs">
                                    Coût prestataire HT (€) *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="h-8"
                                      {...f}
                                      onChange={(e) => {
                                        f.onChange(e);
                                        recalculateMontant(
                                          index,
                                          e.target.value,
                                          form.getValues(
                                            `prix.${index}.margePourcent`,
                                          ) ?? "",
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`prix.${index}.margePourcent`}
                              render={({ field: f }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-xs">
                                    Marge FM4ALL (%) *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      placeholder="0"
                                      className="h-8"
                                      {...f}
                                      onChange={(e) => {
                                        f.onChange(e);
                                        recalculateMontant(
                                          index,
                                          form.getValues(
                                            `prix.${index}.coutPrestataireHt`,
                                          ) ?? "",
                                          e.target.value,
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {isAbonnement && (
                          <div className="grid grid-cols-2 items-start gap-3">
                            <FormField
                              control={form.control}
                              name={`prix.${index}.periodeFacturation`}
                              render={({ field: f }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-xs">
                                    Période *
                                  </FormLabel>
                                  <Select
                                    value={f.value ?? ""}
                                    onValueChange={f.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Choisir" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {PERIODE_OPTIONS.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`prix.${index}.nbOccurrencesIncluses`}
                              render={({ field: f }) => {
                                const isLimited = f.value !== "";
                                return (
                                  <FormItem className="flex flex-col gap-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                      <Checkbox
                                        checked={isLimited}
                                        onCheckedChange={(checked) => {
                                          form.setValue(
                                            `prix.${index}.nbOccurrencesIncluses`,
                                            checked ? "1" : "",
                                            { shouldValidate: true },
                                          );
                                        }}
                                      />
                                      <span className="text-xs">
                                        Limiter les interventions incluses /
                                        période
                                      </span>
                                    </label>
                                    {isLimited && (
                                      <>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            className="h-8"
                                            {...f}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </>
                                    )}
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {form.formState.errors.prix?.root && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.prix.root.message}
                    </p>
                  )}
                  {typeof form.formState.errors.prix?.message === "string" && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.prix.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Section Checklist */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <ListChecks className="text-primary h-4 w-4 shrink-0" />
                      Checklist par défaut
                    </span>
                    <p className="text-muted-foreground text-xs">
                      Utilisée pour toutes les interventions de cette exécution (sauf override par règle).
                    </p>
                    {localChecklistName ? (
                      <div className="mt-1 overflow-hidden rounded-lg border">
                        <div className="flex items-center gap-2 p-3">
                          {localChecklistItems.length > 0 ? (
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
                            {localChecklistName}
                          </span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {localChecklistItems.length} tâche
                            {localChecklistItems.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {checklistExpanded && localChecklistItems.length > 0 && (
                          <div className="bg-muted/30 divide-y border-t">
                            {localChecklistItems.map((item, idx) => (
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
                        Aucune checklist assignée.
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
              </div>
            </div>

            <TacheListePickerDialog
              open={checklistPickerOpen}
              onOpenChange={setChecklistPickerOpen}
              executionId={execution.id}
              prestationId={prestationId}
              serviceId={serviceId}
              serviceNom={serviceNom}
              entrepriseId={entrepriseId}
              currentPackId={execution.tacheListeTemplateId}
              onSuccess={(pack) => {
                setLocalChecklistName(pack?.nom ?? null);
                setLocalChecklistItems(pack?.items ?? []);
                setChecklistPickerOpen(false);
              }}
            />
            <TacheListeManagerDialog
              open={checklistManagerOpen}
              onOpenChange={setChecklistManagerOpen}
              serviceId={serviceId}
              serviceNom={serviceNom}
              proprietaireEntrepriseId={
                postureActive === "plateforme" ? null : entrepriseId
              }
              clientEntrepriseId={
                postureActive === "plateforme" ? entrepriseId : undefined
              }
              clientEntrepriseNom={
                postureActive === "plateforme" ? clientNom : undefined
              }
              prestataireEntrepriseId={execution.prestataireEntrepriseId ?? undefined}
              prestataireEntrepriseNom={execution.prestataireNom ?? undefined}
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
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}
                Enregistrer les modifications
              </Button>
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
