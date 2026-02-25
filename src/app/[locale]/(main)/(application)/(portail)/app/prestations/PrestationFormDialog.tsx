"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  insertPrestationAction,
  updatePrestationAction,
} from "@/server/actions/clientServicesActions";
import { getEntreprisesClientesAction } from "@/server/actions/entreprisesActions";
import { getServicesAction } from "@/server/actions/servicesActions";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  clientServiceModePlanningSchema,
  clientServiceStatutSchema,
  frequenceSchema,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schéma unifié pour les deux modes (create et edit)
// Tous les champs sont optionnels au niveau schema — la validation requise est faite côté serveur
const prestationFormSchema = z.object({
  // Champs identité (edit uniquement, mais présents dans le state)
  id: z.string().uuid().optional(),
  entrepriseId: z.string().optional(),

  // Relations (create uniquement)
  siteId: z.string().optional(),
  serviceId: z.string().optional(),

  // Fréquence
  frequence: frequenceSchema.optional(),
  frequenceParPeriode: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 365),
      "La fréquence par période doit être un nombre entre 1 et 365",
    ),
  intervalleJours: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 365),
      "L'intervalle doit être un nombre entre 1 et 365 jours",
    ),

  // Dates
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),

  // Planification
  joursPreference: z.array(z.number().int().min(1).max(7)).optional(),
  heureDebutPreference: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined || v === "" || /^([0-1]?\d|2[0-3]):[0-5]\d$/.test(v),
      "Format invalide (ex: 08:00)",
    ),
  dureeEstimeeMinutes: z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 720),
      "La durée doit être un nombre entre 1 et 720 minutes",
    ),

  // Planning
  statut: clientServiceStatutSchema.optional(),
  modePlanning: clientServiceModePlanningSchema.optional(),

  // Notes
  notes: z.string().optional(),
});

type PrestationFormValues = z.infer<typeof prestationFormSchema>;

interface PrestationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prestation?: PrestationListItem;
}

const JOURS_SEMAINE = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 7, label: "Dim" },
] as const;

export function PrestationFormDialog({
  open,
  onOpenChange,
  onSuccess,
  prestation,
}: PrestationFormDialogProps) {
  const isEdit = !!prestation;
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);

  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [services, setServices] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [loadingSites, setLoadingSites] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isEdit
      ? prestation.entrepriseId
      : posture === "plateforme"
        ? ""
        : (entreprise?.id ?? ""),
  );

  const form = useForm<PrestationFormValues>({
    resolver: zodResolver(prestationFormSchema),
    mode: "onTouched",
    defaultValues: isEdit
      ? {
          id: prestation.id,
          entrepriseId: prestation.entrepriseId,
          frequence: prestation.frequence,
          frequenceParPeriode: prestation.frequenceParPeriode?.toString() ?? "",
          intervalleJours: prestation.intervalleJours?.toString() ?? "",
          dateDebut: prestation.dateDebut
            ? prestation.dateDebut.toISOString().split("T")[0]
            : "",
          dateFin: prestation.dateFin
            ? prestation.dateFin.toISOString().split("T")[0]
            : "",
          joursPreference: prestation.joursPreference ?? [],
          heureDebutPreference: prestation.heureDebutPreference ?? "",
          dureeEstimeeMinutes: prestation.dureeEstimeeMinutes?.toString() ?? "",
          modePlanning: prestation.modePlanning ?? "planifie",
          notes: prestation.notes ?? "",
        }
      : {
          entrepriseId: posture === "plateforme" ? "" : (entreprise?.id ?? ""),
          siteId: "",
          serviceId: "",
          frequence: "hebdomadaire",
          frequenceParPeriode: "",
          intervalleJours: "",
          dateDebut: "",
          dateFin: "",
          joursPreference: [],
          heureDebutPreference: "",
          dureeEstimeeMinutes: "",
          statut: "brouillon",
          modePlanning: "planifie",
          notes: "",
        },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  const frequenceValue = form.watch("frequence");
  const modePlanningValue = form.watch("modePlanning");

  const showFrequenceParPeriode =
    frequenceValue !== undefined &&
    frequenceValue !== "one_shot" &&
    frequenceValue !== "tous_les_x_jours";
  const showIntervalleJours = frequenceValue === "tous_les_x_jours";
  const showPlanificationDetails = modePlanningValue === "planifie";

  // Charger les clients (posture plateforme, mode création)
  useEffect(() => {
    if (isEdit || posture !== "plateforme" || !open) return;
    async function loadClients() {
      const result = await getEntreprisesClientesAction();
      if (result?.data?.clients) setClients(result.data.clients);
    }
    loadClients();
  }, [isEdit, posture, open]);

  // Charger les services (mode création)
  useEffect(() => {
    if (isEdit || !open) return;
    async function loadServices() {
      const result = await getServicesAction();
      if (result?.data?.services) setServices(result.data.services);
    }
    loadServices();
  }, [isEdit, open]);

  // Charger les sites selon le client
  useEffect(() => {
    if (isEdit || !selectedClientId || !open) return;
    async function loadSites() {
      setLoadingSites(true);
      const result = await getAccessibleSitesAction({
        entrepriseId: selectedClientId,
      });
      if (result?.data) {
        const sitesData = Array.isArray(result.data) ? result.data : [];
        setSites(sitesData.map((s) => ({ id: s.id, nom: s.nom })));
      }
      setLoadingSites(false);
    }
    loadSites();
  }, [isEdit, selectedClientId, open]);

  // Réinitialiser à l'ouverture
  useEffect(() => {
    if (!open) return;
    if (isEdit && prestation) {
      form.reset({
        id: prestation.id,
        entrepriseId: prestation.entrepriseId,
        frequence: prestation.frequence,
        frequenceParPeriode: prestation.frequenceParPeriode?.toString() ?? "",
        intervalleJours: prestation.intervalleJours?.toString() ?? "",
        dateDebut: prestation.dateDebut
          ? prestation.dateDebut.toISOString().split("T")[0]
          : "",
        dateFin: prestation.dateFin
          ? prestation.dateFin.toISOString().split("T")[0]
          : "",
        joursPreference: prestation.joursPreference ?? [],
        heureDebutPreference: prestation.heureDebutPreference ?? "",
        dureeEstimeeMinutes: prestation.dureeEstimeeMinutes?.toString() ?? "",
        modePlanning: prestation.modePlanning ?? "planifie",
        notes: prestation.notes ?? "",
      });
    } else {
      const defaultClientId =
        posture === "plateforme" ? "" : (entreprise?.id ?? "");
      form.reset({
        entrepriseId: defaultClientId,
        siteId: "",
        serviceId: "",
        frequence: "hebdomadaire",
        frequenceParPeriode: "",
        intervalleJours: "",
        dateDebut: "",
        dateFin: "",
        joursPreference: [],
        heureDebutPreference: "",
        dureeEstimeeMinutes: "",
        statut: "brouillon",
        modePlanning: "planifie",
        notes: "",
      });
      setSelectedClientId(defaultClientId);
    }
  }, [open, isEdit, prestation, form, posture, entreprise?.id]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue("entrepriseId", clientId);
    form.setValue("siteId", "");
    setSites([]);
  };

  const onSubmit = async (data: PrestationFormValues) => {
    if (isEdit) {
      const result = await updatePrestationAction({
        id: data.id!,
        entrepriseId: data.entrepriseId!,
        frequence: data.frequence,
        frequenceParPeriode: data.frequenceParPeriode,
        intervalleJours: data.intervalleJours,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        joursPreference: data.joursPreference,
        heureDebutPreference: data.heureDebutPreference,
        dureeEstimeeMinutes: data.dureeEstimeeMinutes,
        modePlanning: data.modePlanning,
        notes: data.notes,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.prestation) {
        toast.success("Prestation mise à jour avec succès");
        onSuccess();
        onOpenChange(false);
      }
    } else {
      const result = await insertPrestationAction({
        entrepriseId: data.entrepriseId!,
        siteId: data.siteId!,
        serviceId: data.serviceId!,
        frequence: data.frequence!,
        frequenceParPeriode: data.frequenceParPeriode,
        intervalleJours: data.intervalleJours,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        joursPreference: data.joursPreference,
        heureDebutPreference: data.heureDebutPreference,
        dureeEstimeeMinutes: data.dureeEstimeeMinutes,
        statut: data.statut,
        modePlanning: data.modePlanning,
        notes: data.notes,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.prestation) {
        toast.success("Prestation créée avec succès");
        onSuccess();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              {isEdit ? "Modifier la prestation" : "Nouvelle prestation"}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-2">
              {/* ==================== CLIENT / SITE / SERVICE ==================== */}
              {isEdit ? (
                <div className="bg-muted/50 space-y-1.5 rounded-md px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[80px]">
                      Client
                    </span>
                    <span className="font-medium">
                      {prestation.entrepriseNom}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[80px]">
                      Site
                    </span>
                    <span className="font-medium">{prestation.siteNom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[80px]">
                      Service
                    </span>
                    <span className="font-medium">{prestation.serviceNom}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {posture === "plateforme" && (
                    <RhfControlledSelect<PrestationFormValues>
                      name="entrepriseId"
                      label="Client"
                      requiredMark
                      placeholder="Sélectionnez un client"
                      onChange={(value) => handleClientChange(value as string)}
                      selectClassName="w-full"
                    >
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nom}
                        </SelectItem>
                      ))}
                    </RhfControlledSelect>
                  )}

                  <RhfControlledSelect<PrestationFormValues>
                    name="siteId"
                    label="Site"
                    requiredMark
                    placeholder={
                      !selectedClientId
                        ? "Sélectionnez d'abord un client"
                        : loadingSites
                          ? "Chargement..."
                          : sites.length === 0
                            ? "Aucun site disponible"
                            : "Sélectionnez un site"
                    }
                    disabled={
                      !selectedClientId || loadingSites || sites.length === 0
                    }
                    selectClassName="w-full"
                  >
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>

                  <RhfControlledSelect<PrestationFormValues>
                    name="serviceId"
                    label="Service"
                    requiredMark
                    placeholder="Sélectionnez un service"
                    selectClassName="w-full"
                  >
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nom}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                </div>
              )}

              <Separator />

              {/* ==================== FRÉQUENCE & MODE ==================== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  Fréquence & planification
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <RhfControlledSelect<PrestationFormValues>
                    name="frequence"
                    label="Fréquence"
                    requiredMark
                    selectClassName="w-full"
                  >
                    <SelectItem value="one_shot">One shot</SelectItem>
                    <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="mensuelle">Mensuelle</SelectItem>
                    <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                    <SelectItem value="semestrielle">Semestrielle</SelectItem>
                    <SelectItem value="annuelle">Annuelle</SelectItem>
                    <SelectItem value="tous_les_x_jours">
                      Tous les X jours
                    </SelectItem>
                  </RhfControlledSelect>

                  <RhfControlledSelect<PrestationFormValues>
                    name="modePlanning"
                    label="Mode de planification"
                    selectClassName="w-full"
                  >
                    <SelectItem value="planifie">Planifié</SelectItem>
                    <SelectItem value="a_la_demande">À la demande</SelectItem>
                  </RhfControlledSelect>
                </div>

                {showFrequenceParPeriode && (
                  <RhfInput<PrestationFormValues>
                    name="frequenceParPeriode"
                    label="Nombre d'interventions par période"
                    placeholder="Ex: 2"
                    type="number"
                    inputClassName="w-40"
                    description="Nombre de fois que le service est réalisé par période"
                  />
                )}

                {showIntervalleJours && (
                  <RhfInput<PrestationFormValues>
                    name="intervalleJours"
                    label="Intervalle (en jours)"
                    placeholder="Ex: 14"
                    type="number"
                    inputClassName="w-40"
                  />
                )}
              </div>

              <Separator />

              {/* ==================== PÉRIODE ==================== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Période</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <RhfDatePicker<PrestationFormValues>
                    name="dateDebut"
                    label="Date de début"
                    buttonClassName="w-44"
                  />
                  <RhfDatePicker<PrestationFormValues>
                    name="dateFin"
                    label="Date de fin"
                    buttonClassName="w-44"
                  />
                </div>
              </div>

              {/* ==================== PRÉFÉRENCES DE PLANIFICATION ==================== */}
              {showPlanificationDetails && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                      Préférences de planification
                    </h3>

                    {/* Jours préférés */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium">
                        Jours préférés
                      </label>
                      <Controller
                        control={form.control}
                        name="joursPreference"
                        render={({ field }) => {
                          const current: number[] = Array.isArray(field.value)
                            ? field.value
                            : [];
                          return (
                            <div className="flex flex-wrap gap-3">
                              {JOURS_SEMAINE.map((jour) => {
                                const checked = current.includes(jour.value);
                                return (
                                  <label
                                    key={jour.value}
                                    className="flex cursor-pointer items-center gap-1.5"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(c) => {
                                        const next = c
                                          ? [...current, jour.value]
                                          : current.filter(
                                              (v) => v !== jour.value,
                                            );
                                        field.onChange(next);
                                      }}
                                    />
                                    <span className="text-sm">
                                      {jour.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <RhfInput<PrestationFormValues>
                        name="heureDebutPreference"
                        label="Heure de début préférée"
                        placeholder="Ex: 08:00"
                        description="Format HH:MM"
                      />
                      <RhfInput<PrestationFormValues>
                        name="dureeEstimeeMinutes"
                        label="Durée estimée (min)"
                        placeholder="Ex: 120"
                        type="number"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ==================== STATUT INITIAL (création uniquement) ==================== */}
              {!isEdit && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Statut initial</h3>
                    <RhfControlledSelect<PrestationFormValues>
                      name="statut"
                      label="Statut"
                      selectClassName="w-full max-w-xs"
                    >
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="actif">Actif</SelectItem>
                    </RhfControlledSelect>
                  </div>
                </>
              )}

              <Separator />

              {/* ==================== NOTES ==================== */}
              <div className="pb-2">
                <RhfTextArea<PrestationFormValues>
                  name="notes"
                  label="Notes"
                  placeholder="Informations complémentaires, consignes particulières..."
                  textareaClassName="h-24"
                />
              </div>
            </div>

            {/* ==================== FOOTER ==================== */}
            <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 justify-end gap-2 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}
                {isEdit ? "Enregistrer" : "Créer la prestation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
