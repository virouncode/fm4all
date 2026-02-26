"use client";

import { Button } from "@/components/ui/button";
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
import {
  getPrestatairesForServiceAction,
  insertExecutionWithPrixAction,
} from "@/server/actions/clientServiceExecutionsActions";
import type { ExecutionWithPrix } from "@/server/queries/clientServiceExecutions.query";
import {
  type InsertExecutionFormType,
  insertExecutionFormSchema,
} from "@/zod-schemas/clientServiceExecutions.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

interface ExecutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestationId: string;
  entrepriseId: string;
  siteId: string;
  serviceId: string;
  onSuccess: (executions: ExecutionWithPrix[]) => void;
}

type PrestatairItem = {
  serviceEntrepriseId: string;
  entrepriseId: string;
  nom: string;
};

const TYPE_PRIX_OPTIONS = [
  { value: "abonnement", label: "Abonnement" },
  { value: "par_occurrence", label: "Par occurrence" },
  { value: "installation", label: "Installation" },
  { value: "frais_livraison", label: "Frais de livraison" },
] as const;

const PERIODE_OPTIONS = [
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
  { value: "annee", label: "Année" },
] as const;

export function ExecutionFormDialog({
  open,
  onOpenChange,
  prestationId,
  entrepriseId,
  siteId,
  serviceId,
  onSuccess,
}: ExecutionFormDialogProps) {
  const [prestataires, setPrestataires] = useState<PrestatairItem[]>([]);
  const [loadingPrestataires, setLoadingPrestataires] = useState(false);

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
      prix: [
        {
          typePrix: "par_occurrence",
          montantHt: "",
          coutPrestataireHt: "",
          periodeFacturation: undefined,
          nbOccurrencesIncluses: "",
        },
      ],
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prix",
  });

  // Charger les prestataires à l'ouverture
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
      prix: [
        {
          typePrix: "par_occurrence",
          montantHt: "",
          coutPrestataireHt: "",
          periodeFacturation: undefined,
          nbOccurrencesIncluses: "",
        },
      ],
    });

    async function loadPrestataires() {
      setLoadingPrestataires(true);
      const result = await getPrestatairesForServiceAction({
        serviceId,
        entrepriseId,
      });
      if (result?.data?.prestataires) {
        setPrestataires(result.data.prestataires);
      }
      setLoadingPrestataires(false);
    }

    loadPrestataires();
  }, [open, serviceId, entrepriseId, prestationId, siteId, form]);

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

  const watchedPrix = form.watch("prix");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle>Ajouter un prestataire</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6">
              {/* Prestataire */}
              <FormField
                control={form.control}
                name="serviceEntrepriseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prestataire <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingPrestataires}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingPrestataires
                                ? "Chargement..."
                                : prestataires.length === 0
                                  ? "Aucun prestataire disponible pour ce service"
                                  : "Sélectionnez un prestataire"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prestataires.map((p) => (
                          <SelectItem
                            key={p.serviceEntrepriseId}
                            value={p.serviceEntrepriseId}
                          >
                            {p.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates de validité */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateDebutValidite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date de début <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateFinValidite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin (optionnelle)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Priorité */}
              <FormField
                control={form.control}
                name="priorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Priorité <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      Plus grand = prioritaire. 0 = global, 10 = bâtiment, 20 = zone.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
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
                    onClick={() =>
                      append({
                        typePrix: "par_occurrence",
                        montantHt: "",
                        coutPrestataireHt: "",
                        periodeFacturation: undefined,
                        nbOccurrencesIncluses: "",
                      })
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Ajouter un tarif
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const typePrix = watchedPrix?.[index]?.typePrix;
                  const isAbonnement = typePrix === "abonnement";

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
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Type de prix */}
                        <FormField
                          control={form.control}
                          name={`prix.${index}.typePrix`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Type</FormLabel>
                              <Select
                                value={f.value}
                                onValueChange={f.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TYPE_PRIX_OPTIONS.map((opt) => (
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

                        {/* Montant HT */}
                        <FormField
                          control={form.control}
                          name={`prix.${index}.montantHt`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Montant HT (€) <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="h-8 text-xs"
                                  {...f}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Période facturation (si abonnement) */}
                      {isAbonnement && (
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`prix.${index}.periodeFacturation`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Période <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  value={f.value ?? ""}
                                  onValueChange={f.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-xs">
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
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Occurrences incluses
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Illimitées"
                                    className="h-8 text-xs"
                                    {...f}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
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

            <DialogFooter className="sticky bottom-0 border-t bg-background px-6 pb-6 pt-4">
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
                Ajouter le prestataire
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
