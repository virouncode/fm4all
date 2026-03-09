"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { modePilotageCT } from "@/constants/codeTables";
import {
  getPrestatairesForServiceAction,
  insertExecutionWithPrixAction,
} from "@/server/actions/clientServiceExecutionsActions";
import type { ExecutionWithPrix } from "@/server/queries/clientServiceExecutions.query";
import { useAppStore } from "@/stores/application/appStore";
import {
  type InsertExecutionFormType,
  insertExecutionFormSchema,
} from "@/zod-schemas/clientServiceExecutions.schema";
import type { ModeCommercialType } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";

type ExecutionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestationId: string;
  entrepriseId: string;
  siteId: string;
  serviceId: string;
  modeCommercial: ModeCommercialType;
  isPlateforme: boolean;
  canChangeModePilotage: boolean;
  clientHasActiveAdmin: boolean;
  clientNom: string;
  serviceNom: string;
  onSuccess: (executions: ExecutionWithPrix[]) => void;
};

type PrestatairItemType = {
  serviceEntrepriseId: string;
  entrepriseId: string;
  nom: string;
  hasActiveAdmin: boolean;
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
  par_occurrence:
    "Facturé à chaque intervention réalisée. Si un abonnement avec quota existe, s'applique uniquement aux dépassements.",
  installation:
    "Facturé une seule fois au démarrage (1ère intervention réalisée). Ne se répète pas.",
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

export function ExecutionFormDialog({
  open,
  onOpenChange,
  prestationId,
  entrepriseId,
  siteId,
  serviceId,
  modeCommercial,
  isPlateforme,
  canChangeModePilotage,
  clientHasActiveAdmin,
  clientNom,
  serviceNom,
  onSuccess,
}: ExecutionFormDialogProps) {
  const [prestataires, setPrestataires] = useState<PrestatairItemType[]>([]);
  const [loadingPrestataires, setLoadingPrestataires] = useState(false);
  const [prestataireHasActiveAdmin, setPrestataireHasActiveAdmin] = useState(true);

  // Mode intermédiaire : uniquement plateforme + modeCommercial=intermediaire_fm4all
  const showIntermediaire =
    isPlateforme && modeCommercial === "intermediaire_fm4all";

  const postureActive = useAppStore((state) => state.postureActive);
  // Client ghost → only "prestataire" mode; prestataire posture → "prestataire" mode
  const defaultModePilotage =
    postureActive === "prestataire"
      ? "prestataire"
      : !clientHasActiveAdmin
        ? "prestataire"
        : "client";

  const form = useForm<InsertExecutionFormType>({
    resolver: zodResolver(insertExecutionFormSchema),
    mode: "onTouched",
    defaultValues: {
      prestationId,
      entrepriseId,
      siteId,
      serviceEntrepriseId: "",
      dateDebutValidite: "",
      dateFinValidite: "",
      priorite: "0",
      modePilotage: defaultModePilotage,
      prix: [emptyPrixItem()],
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prix",
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      prestationId,
      entrepriseId,
      siteId,
      serviceEntrepriseId: "",
      dateDebutValidite: "",
      dateFinValidite: "",
      priorite: "0",
      modePilotage: defaultModePilotage,
      prix: [emptyPrixItem()],
    });

    async function loadPrestataires() {
      setLoadingPrestataires(true);
      const result = await getPrestatairesForServiceAction({
        serviceId,
        entrepriseId,
        modeCommercial,
      });
      if (result?.data?.prestataires) {
        const list = result.data.prestataires;
        setPrestataires(list);
        // En posture prestataire, auto-sélectionner le seul prestataire disponible
        // et marquer comme non-ghost (l'utilisateur connecté est admin de son entreprise)
        if (postureActive === "prestataire" && list.length === 1) {
          form.setValue("serviceEntrepriseId", list[0]!.serviceEntrepriseId);
          setPrestataireHasActiveAdmin(true);
        }
      }
      setLoadingPrestataires(false);
    }

    loadPrestataires();
  }, [
    open,
    serviceId,
    entrepriseId,
    prestationId,
    siteId,
    modeCommercial,
    postureActive,
    defaultModePilotage,
    form,
  ]);

  const onSubmit = async (data: InsertExecutionFormType) => {
    const result = await insertExecutionWithPrixAction(data);

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

  const watchedPrix = useWatch({ control: form.control, name: "prix" });
  const selectedServiceEntrepriseId = useWatch({
    control: form.control,
    name: "serviceEntrepriseId",
  });
  const currentModePilotage = useWatch({
    control: form.control,
    name: "modePilotage",
  });

  // Mettre à jour le statut ghost du prestataire sélectionné
  useEffect(() => {
    if (postureActive === "prestataire") {
      // L'utilisateur connecté est admin de son entreprise → jamais ghost
      setPrestataireHasActiveAdmin(true);
      return;
    }
    if (!selectedServiceEntrepriseId) {
      setPrestataireHasActiveAdmin(true);
      return;
    }
    const selected = prestataires.find(
      (p) => p.serviceEntrepriseId === selectedServiceEntrepriseId,
    );
    setPrestataireHasActiveAdmin(selected?.hasActiveAdmin ?? true);
  }, [selectedServiceEntrepriseId, prestataires, postureActive]);

  function recalculateMontant(index: number, cout: string, marge: string) {
    const coutNum = Number(cout) || 0;
    const margeNum = Number(marge) || 0;
    const montant = coutNum * (1 + margeNum / 100);
    form.setValue(`prix.${index}.montantHt`, montant.toFixed(2), {
      shouldValidate: true,
    });
  }

  const clientGhost = !clientHasActiveAdmin;
  const prestataireGhost = !prestataireHasActiveAdmin;
  const availableModePilotage = clientGhost
    ? modePilotageCT.filter((m) => m.code === "prestataire")
    : prestataireGhost
      ? modePilotageCT.filter((m) => m.code === "client")
      : modePilotageCT;

  // Auto-corriger modePilotage si la valeur actuelle n'est plus disponible
  useEffect(() => {
    if (
      currentModePilotage &&
      !availableModePilotage.find((m) => m.code === currentModePilotage)
    ) {
      form.setValue("modePilotage", availableModePilotage[0]!.code, {
        shouldValidate: true,
      });
    }
  }, [availableModePilotage, currentModePilotage, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Ajouter une exécution</DialogTitle>
          {postureActive === "prestataire" && (
            <p className="text-muted-foreground text-sm">
              {clientNom} — {serviceNom}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              <div className="space-y-5 py-2 pb-4">
                {/* ── SECTION PRESTATAIRE ── */}
                {postureActive !== "prestataire" && (
                  <div className="space-y-3">
                    <RhfControlledSelect<InsertExecutionFormType>
                      name="serviceEntrepriseId"
                      label="Prestataire"
                      requiredMark
                      disabled={loadingPrestataires || prestataires.length === 0}
                      placeholder={
                        loadingPrestataires
                          ? "Chargement..."
                          : prestataires.length === 0
                            ? "Aucun prestataire disponible"
                            : "Sélectionnez un prestataire"
                      }
                      selectClassName="w-full"
                    >
                      {prestataires.map((p) => (
                        <SelectItem
                          key={p.serviceEntrepriseId}
                          value={p.serviceEntrepriseId}
                        >
                          {p.nom}
                        </SelectItem>
                      ))}
                    </RhfControlledSelect>
                  </div>
                )}

                {/* Mode de pilotage */}
                <RhfControlledSelect<InsertExecutionFormType>
                  name="modePilotage"
                  label="Mode de pilotage"
                  requiredMark
                  placeholder="Sélectionnez un mode"
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
                  <RhfDatePicker<InsertExecutionFormType>
                    name="dateDebutValidite"
                    label="Date de début"
                    requiredMark
                    buttonClassName="w-full"
                  />
                  <RhfDatePicker<InsertExecutionFormType>
                    name="dateFinValidite"
                    label="Date de fin (optionnelle)"
                    buttonClassName="w-full"
                  />
                </div>

                {/* Priorité */}
                <RhfInput<InsertExecutionFormType>
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
                      Tarifs <span>*</span>
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
                                      <SelectTrigger className="h-8 w-full">
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
              </div>
            </div>

            <DialogFooter className="bg-background flex-shrink-0 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                Ajouter une exécution
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
