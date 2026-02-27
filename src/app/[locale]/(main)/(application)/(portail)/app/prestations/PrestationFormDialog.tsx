"use client";

import {
  buildSiteTree,
  findSiteInTree,
  getAllDescendantIds,
} from "@/app/[locale]/(main)/(application)/(portail)/app/sites/helpers";
import { AttributionSitesTree } from "@/app/[locale]/(main)/(application)/(portail)/app/utilisateurs/AttributionSitesTree";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  frequenceSchema,
  modeCommercialSchema,
  type ModeCommercialType,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import { type SelectSiteType } from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandPlatter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schéma unifié pour les deux modes (create et edit)
const prestationFormSchema = z
  .object({
    id: z.uuid().optional(),
    entrepriseId: z.string().optional(),
    serviceId: z.string().optional(),
    siteAnchorId: z.string().optional(), // champ caché pour valider la sélection de site
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
    dateDebut: z.string().optional(),
    dateFin: z.string().optional(),
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
    modePlanning: clientServiceModePlanningSchema.optional(),
    modeCommercial: modeCommercialSchema.optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validations obligatoires en mode création (pas d'id)
    if (!data.id) {
      if (!data.entrepriseId || data.entrepriseId === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entrepriseId"],
          message: "Client obligatoire",
        });
      }
      if (!data.serviceId || data.serviceId === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["serviceId"],
          message: "Service obligatoire",
        });
      }
      if (!data.siteAnchorId || data.siteAnchorId === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["siteAnchorId"],
          message: "Veuillez sélectionner au moins un site",
        });
      }
    }
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

// Vérifie si un site a un ancêtre dans un ensemble de siteIds sélectionnés
function hasCheckedAncestor(
  siteId: string,
  selectedSet: Set<string>,
  allSites: SelectSiteType[],
): boolean {
  const site = allSites.find((s) => s.id === siteId);
  if (!site?.parentId) return false;
  if (selectedSet.has(site.parentId)) return true;
  return hasCheckedAncestor(site.parentId, selectedSet, allSites);
}

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
  const [sites, setSites] = useState<SelectSiteType[]>([]);
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

  // Sites sélectionnés via l'arbre (ancrage + sous-sites inclus)
  // Un seul "root" autorisé à la fois (= le site d'ancrage)
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  // Indique si l'utilisateur a déjà interagi avec l'arbre (pour la validation onTouched)
  const [siteTreeTouched, setSiteTreeTouched] = useState(false);

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
          modeCommercial: prestation.modeCommercial ?? "direct",
          notes: prestation.notes ?? "",
        }
      : {
          entrepriseId: posture === "plateforme" ? "" : (entreprise?.id ?? ""),
          serviceId: "",
          frequence: "hebdomadaire",
          frequenceParPeriode: "",
          intervalleJours: "",
          dateDebut: "",
          dateFin: "",
          joursPreference: [],
          heureDebutPreference: "",
          dureeEstimeeMinutes: "",
          modePlanning: "planifie",
          modeCommercial: "direct" as ModeCommercialType,
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

  const frequenceParPeriodeLabel =
    frequenceValue === "hebdomadaire"
      ? "Interventions par semaine"
      : frequenceValue === "mensuelle"
        ? "Interventions par mois"
        : frequenceValue === "trimestrielle"
          ? "Interventions par trimestre"
          : frequenceValue === "semestrielle"
            ? "Interventions par semestre"
            : frequenceValue === "annuelle"
              ? "Interventions par an"
              : "Interventions par cycle";
  const showPlanificationDetails = modePlanningValue === "planifie";

  // Arbre complet des sites du client
  const siteTree = useMemo(() => buildSiteTree(sites), [sites]);

  // Site racine actuellement sélectionné (le "site d'ancrage")
  const anchorId = useMemo(() => {
    if (selectedSiteIds.length === 0) return null;
    const selectedSet = new Set(selectedSiteIds);
    return (
      selectedSiteIds.find(
        (id) => !hasCheckedAncestor(id, selectedSet, sites),
      ) ?? null
    );
  }, [selectedSiteIds, sites]);

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

  // Charger les sites selon le client (avec parentId pour arborescence)
  useEffect(() => {
    if (isEdit || !selectedClientId || !open) return;
    async function loadSites() {
      setLoadingSites(true);
      const result = await getAccessibleSitesAction({
        entrepriseId: selectedClientId,
        // En posture client : filtrer uniquement les sites où l'utilisateur est responsable_site
        // En posture plateforme : l'action retourne tous les sites (early return plateforme)
        filterByRole: "responsable_site",
      });
      if (result?.data) {
        setSites(Array.isArray(result.data) ? result.data : []);
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
        modeCommercial: prestation.modeCommercial ?? "direct",
        notes: prestation.notes ?? "",
      });
    } else {
      const defaultClientId =
        posture === "plateforme" ? "" : (entreprise?.id ?? "");
      form.reset({
        entrepriseId: defaultClientId,
        serviceId: "",
        siteAnchorId: "",
        frequence: "hebdomadaire",
        frequenceParPeriode: "",
        intervalleJours: "",
        dateDebut: "",
        dateFin: "",
        joursPreference: [],
        heureDebutPreference: "",
        dureeEstimeeMinutes: "",
        modePlanning: "planifie",
        modeCommercial: "direct",
        notes: "",
      });
      setSelectedClientId(defaultClientId);
      setSites([]);
      setSelectedSiteIds([]);
      setSiteTreeTouched(false);
    }
  }, [open, isEdit, prestation, form, posture, entreprise?.id]);

  // Synchronise l'ancrage de site avec le champ caché pour validation RHF
  useEffect(() => {
    if (isEdit) return;
    form.setValue("siteAnchorId", anchorId ?? "", {
      shouldValidate:
        form.formState.isSubmitted ||
        !!form.formState.errors.siteAnchorId ||
        // Afficher l'erreur immédiatement si l'utilisateur a déjà interagi et décoché tout
        (siteTreeTouched && anchorId === null),
    });
  }, [anchorId, form, isEdit, siteTreeTouched]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue("entrepriseId", clientId);
    setSites([]);
    setSelectedSiteIds([]);
  };

  /**
   * Toggle d'un site dans l'arbre avec cascade (scope = subtree)
   * Contrainte : un seul site racine à la fois (= siteId de la prestation)
   * Si l'utilisateur coche un 2e site racine, l'ancienne sélection est remplacée.
   */
  const handleSiteToggle = (siteId: string, isChecked: boolean) => {
    setSiteTreeTouched(true);
    if (isChecked) {
      const currentSelectedSet = new Set(selectedSiteIds);
      const isNewRoot = !hasCheckedAncestor(siteId, currentSelectedSet, sites);

      if (isNewRoot && selectedSiteIds.length > 0) {
        // Nouveau site racine : remplace toute la sélection précédente
        const node = findSiteInTree(siteTree, siteId);
        const newIds = node ? getAllDescendantIds(node) : [siteId];
        setSelectedSiteIds(newIds);
      } else {
        // Sous-site d'un racine existant : ajouter + cascade descendants
        const node = findSiteInTree(siteTree, siteId);
        if (node) {
          const descendantIds = getAllDescendantIds(node);
          setSelectedSiteIds((prev) => [
            ...new Set([...prev, ...descendantIds]),
          ]);
        } else {
          setSelectedSiteIds((prev) => [...new Set([...prev, siteId])]);
        }
      }
    } else {
      // Décocher : retirer ce site et tous ses descendants
      const node = findSiteInTree(siteTree, siteId);
      const idsToRemove = node ? getAllDescendantIds(node) : [siteId];
      setSelectedSiteIds((prev) =>
        prev.filter((id) => !idsToRemove.includes(id)),
      );
    }
  };

  /**
   * Calcule les entrées de périmètre à partir de la sélection dans l'arbre.
   * Algorithme (minimum de lignes DB) :
   * - Tout sélectionné → { anchorId, inclure, subtree } = 1 ligne
   * - Rien sélectionné sous le racine → { anchorId, inclure, self } = 1 ligne
   * - Partiel → { anchorId, inclure, subtree } + N × { excludedId, exclure, self }
   */
  const computePerimetre = (
    rootId: string,
  ): Array<{
    siteId: string;
    mode: "inclure" | "exclure";
    scope: "self" | "subtree";
  }> => {
    const rootNode = findSiteInTree(siteTree, rootId);
    if (!rootNode) return [{ siteId: rootId, mode: "inclure", scope: "self" }];

    const allDescendants = getAllDescendantIds(rootNode).filter(
      (id) => id !== rootId,
    );

    if (allDescendants.length === 0) {
      return [{ siteId: rootId, mode: "inclure", scope: "self" }];
    }

    const selectedSet = new Set(selectedSiteIds);
    const allSelected = allDescendants.every((id) => selectedSet.has(id));
    const noneSelected = allDescendants.every((id) => !selectedSet.has(id));

    if (allSelected) {
      return [{ siteId: rootId, mode: "inclure", scope: "subtree" }];
    }

    if (noneSelected) {
      return [{ siteId: rootId, mode: "inclure", scope: "self" }];
    }

    const excluded = allDescendants.filter((id) => !selectedSet.has(id));
    return [
      { siteId: rootId, mode: "inclure", scope: "subtree" },
      ...excluded.map((id) => ({
        siteId: id,
        mode: "exclure" as const,
        scope: "self" as const,
      })),
    ];
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
        modeCommercial: data.modeCommercial,
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
      // anchorId est garanti non-null par la validation du schema (siteAnchorId)
      const perimetre = computePerimetre(anchorId!);

      const result = await insertPrestationAction({
        entrepriseId: data.entrepriseId!,
        siteId: anchorId!,
        serviceId: data.serviceId!,
        frequence: data.frequence!,
        frequenceParPeriode: data.frequenceParPeriode,
        intervalleJours: data.intervalleJours,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        joursPreference: data.joursPreference,
        heureDebutPreference: data.heureDebutPreference,
        dureeEstimeeMinutes: data.dureeEstimeeMinutes,
        modePlanning: data.modePlanning,
        modeCommercial: data.modeCommercial,
        notes: data.notes,
        perimetre,
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

  // Texte informatif sur la sélection actuelle
  const selectionSummary = useMemo(() => {
    if (selectedSiteIds.length === 0) return null;
    if (!anchorId) return null;

    const anchorNode = findSiteInTree(siteTree, anchorId);
    if (!anchorNode) return null;

    const anchorNom = anchorNode.nom;
    const allDescendants = getAllDescendantIds(anchorNode).filter(
      (id) => id !== anchorId,
    );
    const selectedDescendants = allDescendants.filter((id) =>
      selectedSiteIds.includes(id),
    );

    if (allDescendants.length === 0) {
      return `Site d'ancrage : "${anchorNom}" (aucun sous-site)`;
    }
    if (selectedDescendants.length === allDescendants.length) {
      return `Site d'ancrage : "${anchorNom}" + ${allDescendants.length} sous-site(s)`;
    }
    return `Site d'ancrage : "${anchorNom}" + ${selectedDescendants.length}/${allDescendants.length} sous-site(s)`;
  }, [selectedSiteIds, anchorId, siteTree]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <HandPlatter className="text-primary" />
              {isEdit ? "Modifier la prestation" : "Nouvelle prestation"}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les paramètres de planification de cette prestation."
              : "Définissez un service récurrent ou ponctuel assigné à un site client."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
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

                  {/* Arbre de sélection des sites — même pattern que l'attribution */}
                  <div
                    className="space-y-2"
                    onBlur={(e) => {
                      // Déclencher la validation quand le focus quitte complètement la zone
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        void form.trigger("siteAnchorId");
                      }
                    }}
                  >
                    <Label>
                      Sites à couvrir <span>*</span>
                    </Label>
                    <ScrollArea className="h-[220px] rounded-md border p-3">
                      {loadingSites ? (
                        <p className="text-muted-foreground text-sm">
                          Chargement...
                        </p>
                      ) : sites.length === 0 && selectedClientId ? (
                        <p className="text-muted-foreground text-sm">
                          Aucun site disponible
                        </p>
                      ) : sites.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          {posture === "plateforme"
                            ? "Sélectionnez d'abord un client"
                            : "Aucun site disponible"}
                        </p>
                      ) : (
                        <AttributionSitesTree
                          tree={siteTree}
                          selectedSiteIds={selectedSiteIds}
                          onSiteToggle={handleSiteToggle}
                          scope="subtree"
                        />
                      )}
                    </ScrollArea>
                    {form.formState.errors.siteAnchorId && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.siteAnchorId.message}
                      </p>
                    )}
                    {!form.formState.errors.siteAnchorId &&
                      selectionSummary && (
                        <p className="text-muted-foreground text-xs">
                          {selectionSummary}
                        </p>
                      )}
                    {!form.formState.errors.siteAnchorId &&
                      !selectionSummary && (
                        <p className="text-muted-foreground text-xs">
                          {selectedSiteIds.length} site(s) sélectionné(s)
                        </p>
                      )}
                  </div>

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

                {posture === "plateforme" && (
                  <RhfControlledSelect<PrestationFormValues>
                    name="modeCommercial"
                    label="Mode commercial"
                    selectClassName="w-full"
                  >
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="intermediaire_fm4all">
                      Intermédiaire FM4ALL
                    </SelectItem>
                  </RhfControlledSelect>
                )}

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
                    label={frequenceParPeriodeLabel}
                    placeholder="Ex: 2"
                    type="number"
                    inputClassName="w-full"
                  />
                )}

                {showIntervalleJours && (
                  <RhfInput<PrestationFormValues>
                    name="intervalleJours"
                    label="Intervalle (en jours)"
                    placeholder="Ex: 14"
                    type="number"
                    inputClassName="w-full"
                  />
                )}
              </div>

              <Separator />

              {/* ==================== PÉRIODE ==================== */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Période</h3>
                <div className="grid grid-cols-2 gap-4">
                  <RhfDatePicker<PrestationFormValues>
                    name="dateDebut"
                    label="Date de début"
                    buttonClassName="w-full"
                  />
                  <RhfDatePicker<PrestationFormValues>
                    name="dateFin"
                    label="Date de fin"
                    buttonClassName="w-full"
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
                    <div>
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
                            <div className="mt-2 mb-6 flex flex-wrap gap-3">
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

                    <div className="grid grid-cols-2 gap-4">
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
