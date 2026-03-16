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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { modePilotageCT } from "@/constants/codeTables";
import { Link } from "@/i18n/navigation";
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import {
  insertPrestationAction,
  insertPrestationWithExecutionAction,
  updatePrestationAction,
} from "@/server/actions/clientServicesActions";
import { getEntreprisesClientesAction } from "@/server/actions/entreprisesActions";
import {
  getServicesAction,
  getServicesByPrestataireAction,
} from "@/server/actions/servicesActions";
import { getSitesForPrestationAction } from "@/server/actions/sitesActions";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertExecutionPrixFormSchema,
  type InsertExecutionPrixFormType,
} from "@/zod-schemas/clientServiceExecutions.schema";
import {
  famillePlanificationSchema,
  modeCommercialSchema,
  type ModeCommercialType,
  type PrestationListItem,
} from "@/zod-schemas/clientServices.schema";
import { type SelectSiteType } from "@/zod-schemas/sites.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, HandPlatter, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ──────────────────────────────────────────────
// Schémas
// ──────────────────────────────────────────────

const prestationFormSchema = z
  .object({
    id: z.uuid().optional(),
    entrepriseId: z.string().optional(),
    serviceId: z.string().optional(),
    siteAnchorId: z.string().optional(),
    famillePlanification: famillePlanificationSchema.optional(),
    dateDebut: z.string().optional(),
    dateFin: z.string().optional(),
    modeCommercial: modeCommercialSchema.optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
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

type PrestationFormValuesType = z.infer<typeof prestationFormSchema>;

// Schéma step 2 (exécution) — utilisé uniquement en posture prestataire
const executionStep2Schema = z
  .object({
    dateDebutValidite: z
      .string()
      .min(1, "Date de début de validité obligatoire"),
    dateFinValidite: z.string().optional(),
    priorite: z
      .string()
      .refine(
        (v) =>
          !isNaN(Number(v)) &&
          Number(v) >= 0 &&
          Number(v) <= 100 &&
          Number.isInteger(Number(v)),
        "La priorité doit être un entier entre 0 et 100",
      ),
    modePilotage: z.enum(["client", "prestataire", "collaboration"]),
    prix: z
      .array(insertExecutionPrixFormSchema)
      .min(1, "Au moins une ligne de tarif est requise"),
  })
  .superRefine((data, ctx) => {
    const abonnementCount = data.prix.filter(
      (p) => p.typePrix === "abonnement",
    ).length;
    if (abonnementCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'abonnement est autorisée par exécution",
      });
    }
    const installationCount = data.prix.filter(
      (p) => p.typePrix === "installation",
    ).length;
    if (installationCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["prix"],
        message: "Une seule ligne d'installation est autorisée par exécution",
      });
    }
  });

type ExecutionStep2ValuesType = z.infer<typeof executionStep2Schema>;

// ──────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────

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

function emptyPrixItem(): InsertExecutionPrixFormType {
  return {
    typePrix: "par_occurrence" as const,
    montantHt: "",
    coutPrestataireHt: "",
    margePourcent: "",
    periodeFacturation: undefined,
    nbOccurrencesIncluses: "",
  };
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

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

function getMontantLabel(
  typePrix: string,
  periodeFacturation: string | undefined,
): string {
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

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type PrestationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prestation?: PrestationListItem;
};

type ServiceOptionType = {
  id: string;
  nom: string;
  serviceEntrepriseId?: string; // Défini uniquement en posture prestataire
};

// ──────────────────────────────────────────────
// Composant
// ──────────────────────────────────────────────

export function PrestationFormDialog({
  open,
  onOpenChange,
  onSuccess,
  prestation,
}: PrestationFormDialogProps) {
  const isEdit = !!prestation;
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);

  // Formulaire prestataire = mode 2-étapes à la création
  const isPrestataireCreate = posture === "prestataire" && !isEdit;

  const [step, setStep] = useState<1 | 2>(1);
  const step2ScrollRef = useRef<HTMLDivElement>(null);

  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [allSites, setAllSites] = useState<SelectSiteType[]>([]);
  const [responsableSiteIds, setResponsableSiteIds] = useState<string[] | null>(
    null,
  );
  const [services, setServices] = useState<ServiceOptionType[]>([]);
  // serviceEntrepriseId résolu depuis la sélection de service (posture prestataire)
  const [selectedServiceEntrepriseId, setSelectedServiceEntrepriseId] =
    useState<string>("");
  const [loadingSites, setLoadingSites] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isEdit
      ? prestation.entrepriseId
      : posture === "plateforme" || posture === "prestataire"
        ? ""
        : (entreprise?.id ?? ""),
  );

  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [siteTreeTouched, setSiteTreeTouched] = useState(false);

  // ── Form step 1 ──
  const form = useForm<PrestationFormValuesType>({
    resolver: zodResolver(prestationFormSchema),
    mode: "onTouched",
    defaultValues: isEdit
      ? {
          id: prestation.id,
          entrepriseId: prestation.entrepriseId,
          famillePlanification: prestation.famillePlanification,
          dateDebut: prestation.dateDebut
            ? prestation.dateDebut.toISOString().split("T")[0]
            : "",
          dateFin: prestation.dateFin
            ? prestation.dateFin.toISOString().split("T")[0]
            : "",
          modeCommercial: prestation.modeCommercial ?? "direct",
          notes: prestation.notes ?? "",
        }
      : {
          entrepriseId:
            posture === "plateforme" || posture === "prestataire"
              ? ""
              : (entreprise?.id ?? ""),
          serviceId: "",
          famillePlanification: "recurrence_auto" as const,
          dateDebut: "",
          dateFin: "",
          modeCommercial: "direct" as ModeCommercialType,
          notes: "",
        },
  });

  const { isSubmitting: isSubmittingStep1 } = useFormState({
    control: form.control,
  });

  const watchedFamille = useWatch({
    control: form.control,
    name: "famillePlanification",
  });

  // ── Form step 2 (uniquement posture prestataire) ──
  const execForm = useForm<ExecutionStep2ValuesType>({
    resolver: zodResolver(executionStep2Schema),
    mode: "onTouched",
    defaultValues: {
      dateDebutValidite: "",
      dateFinValidite: "",
      priorite: "0",
      modePilotage: "prestataire",
      prix: [emptyPrixItem()],
    },
  });

  const { isSubmitting: isSubmittingStep2 } = useFormState({
    control: execForm.control,
  });

  const {
    fields: prixFields,
    append: appendPrix,
    remove: removePrix,
  } = useFieldArray({
    control: execForm.control,
    name: "prix",
  });

  const watchedPrix = useWatch({ control: execForm.control, name: "prix" });

  // ── Sites visibles (responsables + ancêtres + descendants) ──
  const visibleSites = useMemo((): SelectSiteType[] => {
    if (responsableSiteIds === null) return allSites;
    if (responsableSiteIds.length === 0) return [];

    const visibleSet = new Set<string>(responsableSiteIds);

    for (const siteId of responsableSiteIds) {
      let current: SelectSiteType | undefined = allSites.find(
        (s) => s.id === siteId,
      );
      while (current?.parentId) {
        visibleSet.add(current.parentId);
        const parentId = current.parentId;
        current = allSites.find((s) => s.id === parentId);
      }
    }

    const addDescendants = (siteId: string) => {
      for (const child of allSites.filter((s) => s.parentId === siteId)) {
        visibleSet.add(child.id);
        addDescendants(child.id);
      }
    };
    for (const siteId of responsableSiteIds) {
      addDescendants(siteId);
    }

    return allSites.filter((s) => visibleSet.has(s.id));
  }, [allSites, responsableSiteIds]);

  const siteTree = useMemo(() => buildSiteTree(visibleSites), [visibleSites]);

  const anchorId = useMemo(() => {
    if (selectedSiteIds.length === 0) return null;
    const selectedSet = new Set(selectedSiteIds);
    return (
      selectedSiteIds.find(
        (id) => !hasCheckedAncestor(id, selectedSet, visibleSites),
      ) ?? null
    );
  }, [selectedSiteIds, visibleSites]);

  // ── Chargement clients ──
  useEffect(() => {
    if (isEdit || !open) return;
    if (posture === "plateforme") {
      async function loadClientsPlateforme() {
        const result = await getEntreprisesClientesAction();
        if (result?.data?.clients) setClients(result.data.clients);
      }
      loadClientsPlateforme();
    } else if (posture === "prestataire" && entreprise?.id) {
      async function loadClientsPrestataire() {
        const result = await getMesClientsAction({
          entrepriseId: entreprise!.id,
        });
        if (result?.data?.clients) setClients(result.data.clients);
      }
      loadClientsPrestataire();
    }
  }, [isEdit, posture, open, entreprise?.id]);

  // ── Chargement services (filtré prestataire ou global) ──
  useEffect(() => {
    if (isEdit || !open) return;
    if (posture === "prestataire" && entreprise?.id) {
      async function loadServicesPrestataire() {
        const result = await getServicesByPrestataireAction({
          prestataireEntrepriseId: entreprise!.id,
        });
        if (result?.data?.services) {
          setServices(result.data.services);
        }
      }
      loadServicesPrestataire();
    } else {
      async function loadServices() {
        const result = await getServicesAction();
        if (result?.data?.services) setServices(result.data.services);
      }
      loadServices();
    }
  }, [isEdit, posture, open, entreprise?.id]);

  // ── Chargement sites ──
  useEffect(() => {
    if (isEdit || !selectedClientId || !open) return;
    async function loadSites() {
      setLoadingSites(true);
      const result = await getSitesForPrestationAction({
        entrepriseId: selectedClientId,
        posture: posture ?? undefined,
      });
      if (result?.data) {
        setAllSites(result.data.allSites);
        setResponsableSiteIds(result.data.responsableSiteIds);
      }
      setLoadingSites(false);
    }
    loadSites();
  }, [isEdit, selectedClientId, open]);

  // ── Reset à l'ouverture ──
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelectedServiceEntrepriseId("");
    if (isEdit && prestation) {
      form.reset({
        id: prestation.id,
        entrepriseId: prestation.entrepriseId,
        famillePlanification: prestation.famillePlanification,
        dateDebut: prestation.dateDebut
          ? prestation.dateDebut.toISOString().split("T")[0]
          : "",
        dateFin: prestation.dateFin
          ? prestation.dateFin.toISOString().split("T")[0]
          : "",
        modeCommercial: prestation.modeCommercial ?? "direct",
        notes: prestation.notes ?? "",
      });
    } else {
      const defaultClientId =
        posture === "plateforme" || posture === "prestataire"
          ? ""
          : (entreprise?.id ?? "");
      form.reset({
        entrepriseId: defaultClientId,
        serviceId: "",
        siteAnchorId: "",
        famillePlanification: "recurrence_auto",
        dateDebut: "",
        dateFin: "",
        modeCommercial: "direct",
        notes: "",
      });
      execForm.reset({
        dateDebutValidite: "",
        dateFinValidite: "",
        priorite: "0",
        modePilotage: "prestataire",
        prix: [emptyPrixItem()],
      });
      setSelectedClientId(defaultClientId);
      setAllSites([]);
      setResponsableSiteIds(null);
      setSelectedSiteIds([]);
      setSiteTreeTouched(false);
    }
  }, [open, isEdit, prestation, form, execForm, posture, entreprise?.id]);

  // ── Synchronise anchorId → siteAnchorId (validation RHF) ──
  useEffect(() => {
    if (isEdit) return;
    form.setValue("siteAnchorId", anchorId ?? "", {
      shouldValidate:
        form.formState.isSubmitted ||
        !!form.formState.errors.siteAnchorId ||
        (siteTreeTouched && anchorId === null),
    });
  }, [anchorId, form, isEdit, siteTreeTouched]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue("entrepriseId", clientId);
    setAllSites([]);
    setResponsableSiteIds(null);
    setSelectedSiteIds([]);
  };

  const handleServiceChange = (serviceId: string) => {
    form.setValue("serviceId", serviceId);
    // Résoudre le serviceEntrepriseId si posture prestataire
    if (posture === "prestataire") {
      const found = services.find((s) => s.id === serviceId);
      setSelectedServiceEntrepriseId(found?.serviceEntrepriseId ?? "");
    }
  };

  const handleSiteToggle = (siteId: string, isChecked: boolean) => {
    setSiteTreeTouched(true);
    if (isChecked) {
      const currentSelectedSet = new Set(selectedSiteIds);
      const isNewRoot = !hasCheckedAncestor(
        siteId,
        currentSelectedSet,
        visibleSites,
      );

      if (isNewRoot && selectedSiteIds.length > 0) {
        const node = findSiteInTree(siteTree, siteId);
        const newIds = node ? getAllDescendantIds(node) : [siteId];
        setSelectedSiteIds(newIds);
      } else {
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
      const node = findSiteInTree(siteTree, siteId);
      const idsToRemove = node ? getAllDescendantIds(node) : [siteId];
      setSelectedSiteIds((prev) =>
        prev.filter((id) => !idsToRemove.includes(id)),
      );
    }
  };

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

  // ── Passer à l'étape 2 (posture prestataire) ──
  const handleNextStep = form.handleSubmit(async () => {
    setStep(2);
    // Scroll au top du conteneur step 2 après le rendu
    requestAnimationFrame(() => {
      step2ScrollRef.current?.scrollTo({ top: 0 });
    });
  });

  // ── Submit final ──
  const onSubmitStep1 = async (data: PrestationFormValuesType) => {
    if (isEdit) {
      const result = await updatePrestationAction({
        id: data.id!,
        entrepriseId: data.entrepriseId!,
        famillePlanification: data.famillePlanification,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
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
      const perimetre = computePerimetre(anchorId!);
      const result = await insertPrestationAction({
        entrepriseId: data.entrepriseId!,
        siteId: anchorId!,
        serviceId: data.serviceId!,
        famillePlanification: data.famillePlanification!,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
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

  // Submit combiné (posture prestataire, step 2)
  const onSubmitPrestataire = execForm.handleSubmit(
    async (execData: ExecutionStep2ValuesType) => {
      const step1Data = form.getValues();
      const perimetre = computePerimetre(anchorId!);

      const result = await insertPrestationWithExecutionAction({
        entrepriseId: step1Data.entrepriseId!,
        siteId: anchorId!,
        serviceId: step1Data.serviceId!,
        serviceEntrepriseId: selectedServiceEntrepriseId,
        famillePlanification: step1Data.famillePlanification!,
        dateDebut: step1Data.dateDebut,
        dateFin: step1Data.dateFin,
        modeCommercial: step1Data.modeCommercial,
        notes: step1Data.notes,
        perimetre,
        dateDebutValidite: execData.dateDebutValidite,
        dateFinValidite: execData.dateFinValidite,
        priorite: execData.priorite,
        modePilotage: execData.modePilotage,
        prix: execData.prix,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.prestation) {
        toast.success("Prestation et exécution créées avec succès");
        onSuccess();
        onOpenChange(false);
      }
    },
  );

  // ── Résumé sélection de sites ──
  const selectionSummary = useMemo(() => {
    if (selectedSiteIds.length === 0 || !anchorId) return null;
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

  // ──────────────────────────────────────────────
  // Rendu : indicateur d'étapes (prestataire create)
  // ──────────────────────────────────────────────

  const stepIndicator = isPrestataireCreate ? (
    <div className="flex items-center gap-1 px-6 pb-2 text-sm">
      <span
        className={
          step === 1 ? "text-primary font-semibold" : "text-muted-foreground"
        }
      >
        1. Prestation
      </span>
      <span className="text-muted-foreground mx-1">›</span>
      <span
        className={
          step === 2 ? "text-primary font-semibold" : "text-muted-foreground"
        }
      >
        2. Exécution &amp; tarifs
      </span>
    </div>
  ) : null;

  // ──────────────────────────────────────────────
  // Rendu step 2 (exécution, posture prestataire)
  // ──────────────────────────────────────────────

  const renderStep2 = () => (
    <Form {...execForm}>
      <form
        onSubmit={onSubmitPrestataire}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div ref={step2ScrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
          <div className="bg-muted/50 space-y-1 rounded-md px-4 py-3 text-sm">
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Prestataire (vous)
            </p>
            <p className="font-medium">{entreprise?.nom ?? "—"}</p>
            <p className="text-muted-foreground text-xs">
              Mode de pilotage sélectionné ci-dessous
            </p>
          </div>

          {/* Mode de pilotage */}
          <RhfControlledSelect<ExecutionStep2ValuesType>
            name="modePilotage"
            label="Mode de pilotage"
            requiredMark
            description="Détermine quelle entreprise pilote le workflow de cette exécution."
            selectClassName="w-full"
          >
            {modePilotageCT.map((m) => (
              <SelectItem key={m.code} value={m.code}>
                {m.name}
              </SelectItem>
            ))}
          </RhfControlledSelect>

          {/* Dates de validité */}
          <div className="grid grid-cols-2 gap-4">
            <RhfDatePicker<ExecutionStep2ValuesType>
              name="dateDebutValidite"
              label="Date de début"
              requiredMark
              buttonClassName="w-full"
            />
            <RhfDatePicker<ExecutionStep2ValuesType>
              name="dateFinValidite"
              label="Date de fin (optionnelle)"
              buttonClassName="w-full"
            />
          </div>

          {/* Priorité */}
          <RhfInput<ExecutionStep2ValuesType>
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

          <Separator />

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
                onClick={() => appendPrix(emptyPrixItem())}
              >
                <Plus className="h-4 w-4" />
                Ajouter un tarif
              </Button>
            </div>

            {prixFields.map((field, index) => {
              const typePrix = watchedPrix?.[index]?.typePrix;
              const periodeFacturation =
                watchedPrix?.[index]?.periodeFacturation;
              const isAbonnement = typePrix === "abonnement";
              const montantLabel = getMontantLabel(
                typePrix ?? "",
                periodeFacturation,
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
                    {prixFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={() => removePrix(index)}
                        aria-label="Supprimer ce tarif"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 items-start gap-3">
                    <FormField
                      control={execForm.control}
                      name={`prix.${index}.typePrix`}
                      render={({ field: f }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs">Type</FormLabel>
                          <Select value={f.value} onValueChange={f.onChange}>
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
                      control={execForm.control}
                      name={`prix.${index}.montantHt`}
                      render={({ field: f }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs">
                            {montantLabel} *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isAbonnement && (
                    <div className="grid grid-cols-2 items-start gap-3">
                      <FormField
                        control={execForm.control}
                        name={`prix.${index}.periodeFacturation`}
                        render={({ field: f }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs">Période *</FormLabel>
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
                                  <SelectItem key={opt.value} value={opt.value}>
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
                        control={execForm.control}
                        name={`prix.${index}.nbOccurrencesIncluses`}
                        render={({ field: f }) => {
                          const isLimited = f.value !== "";
                          return (
                            <FormItem className="flex flex-col gap-2">
                              <label className="flex cursor-pointer items-center gap-2">
                                <Checkbox
                                  checked={isLimited}
                                  onCheckedChange={(checked) => {
                                    execForm.setValue(
                                      `prix.${index}.nbOccurrencesIncluses`,
                                      checked ? "1" : "",
                                      { shouldValidate: true },
                                    );
                                  }}
                                />
                                <span className="text-xs">
                                  Limiter les interventions incluses / période
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

            {execForm.formState.errors.prix?.root && (
              <p className="text-destructive text-sm">
                {execForm.formState.errors.prix.root.message}
              </p>
            )}
            {typeof execForm.formState.errors.prix?.message === "string" && (
              <p className="text-destructive text-sm">
                {execForm.formState.errors.prix.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 items-center justify-between gap-2 border-t px-6 pt-4 pb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(1)}
            disabled={isSubmittingStep2}
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button type="submit" disabled={isSubmittingStep2}>
            {isSubmittingStep2 && <Spinner />}
            Créer prestation + exécution
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // ──────────────────────────────────────────────
  // Rendu principal
  // ──────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <HandPlatter className="text-primary" />
              {isEdit ? "Modifier la prestation" : "Nouvelle prestation"}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les paramètres de planification de cette prestation."
              : isPrestataireCreate
                ? "Définissez la prestation et son exécution en deux étapes."
                : "Définissez un service récurrent ou ponctuel assigné à un site client."}
          </DialogDescription>
        </DialogHeader>

        {stepIndicator}

        {/* ── Step 2 (prestataire posture only) ── */}
        {isPrestataireCreate && step === 2 ? (
          renderStep2()
        ) : (
          // ── Step 1 (toujours affiché sauf prestataire create step 2) ──
          <Form {...form}>
            <form
              onSubmit={
                isPrestataireCreate
                  ? handleNextStep
                  : form.handleSubmit(onSubmitStep1)
              }
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
                {/* ── CLIENT / SITE / SERVICE ── */}
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
                      <span className="font-medium">
                        {prestation.serviceNom}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(posture === "plateforme" ||
                      posture === "prestataire") && (
                      <div className="space-y-3">
                        <Label>
                          Client <span className="text-destructive">*</span>
                        </Label>
                        <RhfControlledSelect<PrestationFormValuesType>
                          name="entrepriseId"
                          label=""
                          placeholder="Sélectionnez un client"
                          onChange={(value) =>
                            handleClientChange(value as string)
                          }
                          selectClassName="w-full"
                        >
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nom}
                            </SelectItem>
                          ))}
                        </RhfControlledSelect>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <RhfControlledSelect<PrestationFormValuesType>
                        name="serviceId"
                        label="Service"
                        requiredMark
                        placeholder="Sélectionnez un service"
                        selectClassName="w-full"
                        onChange={
                          posture === "prestataire"
                            ? (value) => handleServiceChange(value as string)
                            : undefined
                        }
                      >
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nom}
                          </SelectItem>
                        ))}
                      </RhfControlledSelect>

                      {posture !== "plateforme" &&
                        posture !== "prestataire" && (
                          <p className="text-muted-foreground text-xs">
                            Service non trouvé dans la liste ?{" "}
                            <a
                              href="mailto:contact@fm4all.com"
                              className="text-primary underline-offset-2 hover:underline"
                            >
                              Contactez un administrateur FM4ALL
                            </a>
                            .
                          </p>
                        )}

                      {posture === "prestataire" && services.length === 0 && (
                        <p className="text-muted-foreground text-xs">
                          Aucun service configuré pour votre entreprise.{" "}
                          <a
                            href="mailto:contact@fm4all.com"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            Contactez FM4ALL
                          </a>{" "}
                          pour paramétrer vos services.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* ── FAMILLE DE PLANIFICATION & MODE ── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Planification</h3>

                  {posture === "plateforme" && (
                    <RhfControlledSelect<PrestationFormValuesType>
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

                  <RhfControlledSelect<PrestationFormValuesType>
                    name="famillePlanification"
                    label="Mode de planification"
                    requiredMark
                    selectClassName="w-full"
                  >
                    <SelectItem value="recurrence_auto">Récurrence automatique (quotidien, hebdo, mensuel…)</SelectItem>
                    <SelectItem value="quota_manuel">Quota (trimestriel, semestriel, annuel…)</SelectItem>
                    <SelectItem value="ponctuel">Ponctuel (intervention unique)</SelectItem>
                  </RhfControlledSelect>
                  {watchedFamille === "recurrence_auto" && (
                    <p className="text-muted-foreground text-xs">
                      Les interventions se répètent automatiquement selon un planning que vous définirez dans la fiche prestation (ex : chaque lundi, le 1er du mois…).
                    </p>
                  )}
                  {watchedFamille === "quota_manuel" && (
                    <p className="text-muted-foreground text-xs">
                      Un nombre d&apos;interventions fixe est alloué sur une période (ex : 4 fois par an). Vous les planifiez manuellement dans l&apos;enveloppe disponible.
                    </p>
                  )}
                  {watchedFamille === "ponctuel" && (
                    <p className="text-muted-foreground text-xs">
                      Aucune planification automatique. Chaque intervention est créée manuellement, à la demande.
                    </p>
                  )}
                </div>

                <Separator />

                {/* ── PÉRIODE ── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Période</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <RhfDatePicker<PrestationFormValuesType>
                      name="dateDebut"
                      label="Date de début"
                      buttonClassName="w-full"
                    />
                    <RhfDatePicker<PrestationFormValuesType>
                      name="dateFin"
                      label="Date de fin"
                      buttonClassName="w-full"
                    />
                  </div>
                </div>


                <Separator />

                {/* ── NOTES ── */}
                <div className="pb-2">
                  <RhfTextArea<PrestationFormValuesType>
                    name="notes"
                    label="Notes"
                    placeholder="Informations complémentaires, consignes particulières..."
                    textareaClassName="h-24"
                  />
                </div>

                {/* ── SITES À COUVRIR (création uniquement) ── */}
                {!isEdit && (
                  <>
                    <Separator />
                    <div
                      className="space-y-2 pb-2"
                      onBlur={(e) => {
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
                        ) : allSites.length === 0 && selectedClientId ? (
                          <p className="text-muted-foreground text-sm">
                            Ce client n&apos;a pas encore de sites.{" "}
                            <Link
                              href={
                                posture === "prestataire"
                                  ? {
                                      pathname:
                                        "/app/mes-sites-clients" as const,
                                      query: { clientId: selectedClientId },
                                    }
                                  : "/app/sites"
                              }
                              className="text-primary underline-offset-2 hover:underline"
                            >
                              Créer des sites
                            </Link>
                          </p>
                        ) : allSites.length > 0 &&
                          responsableSiteIds !== null &&
                          responsableSiteIds.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            Vous n&apos;êtes pas responsable de site chez ce
                            client. Contactez un administrateur ou supérieur
                            hiérarchique pour vous attribuer des sites.
                          </p>
                        ) : allSites.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            {posture === "plateforme" ||
                            posture === "prestataire"
                              ? "Sélectionnez d'abord un client"
                              : "Aucun site disponible"}
                          </p>
                        ) : (
                          <AttributionSitesTree
                            tree={siteTree}
                            selectedSiteIds={selectedSiteIds}
                            onSiteToggle={handleSiteToggle}
                            scope="subtree"
                            enabledSiteIds={responsableSiteIds ?? undefined}
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
                  </>
                )}
              </div>

              {/* ── FOOTER step 1 ── */}
              <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 justify-end gap-2 border-t px-6 pt-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmittingStep1 || (!isEdit && !isDirtyStep1Check())
                  }
                >
                  {isSubmittingStep1 && <Spinner />}
                  {isEdit
                    ? "Enregistrer"
                    : isPrestataireCreate
                      ? "Suivant →"
                      : "Créer la prestation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );

  function isDirtyStep1Check() {
    return form.formState.isDirty;
  }
}
