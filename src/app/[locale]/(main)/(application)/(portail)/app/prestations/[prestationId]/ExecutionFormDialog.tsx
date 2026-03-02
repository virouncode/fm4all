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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  createOrLinkPrestataireAction,
  findEntrepriseBySiretAction,
  getPrestatairesForServiceAction,
  insertExecutionWithPrixAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { getAssignableUsersForOccurrenceAction } from "@/server/actions/clientServiceOccurrencesActions";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import type { ExecutionWithPrix } from "@/server/queries/clientServiceExecutions.query";
import {
  type InsertExecutionFormType,
  insertExecutionFormSchema,
} from "@/zod-schemas/clientServiceExecutions.schema";
import type { ModeCommercialType } from "@/zod-schemas/clientServices.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
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
  onSuccess: (executions: ExecutionWithPrix[]) => void;
}

type PrestatairItem = {
  serviceEntrepriseId: string;
  entrepriseId: string;
  nom: string;
};

type SiretState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; entreprise: { id: string; nom: string; siret: string } }
  | { status: "not_found" }
  | { status: "error"; message: string };

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
  onSuccess,
}: ExecutionFormDialogProps) {
  const [prestataires, setPrestataires] = useState<PrestatairItem[]>([]);
  const [loadingPrestataires, setLoadingPrestataires] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<Array<{ id: string; prenom: string; nom: string }>>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);

  // Sous-formulaire "nouveau prestataire"
  const [showNouveauPrestataire, setShowNouveauPrestataire] = useState(false);
  const [siretInput, setSiretInput] = useState("");
  const [siretState, setSiretState] = useState<SiretState>({ status: "idle" });
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauContact, setNouveauContact] = useState({
    prenom: "",
    nom: "",
    email: "",
    phone: "",
  });
  const [creatingPrestataire, setCreatingPrestataire] = useState(false);

  // Mode intermédiaire : uniquement plateforme + modeCommercial=intermediaire_fm4all
  const showIntermediaire =
    isPlateforme && modeCommercial === "intermediaire_fm4all";

  // En mode direct : le client peut créer un nouveau prestataire
  const canCreatePrestataire = modeCommercial === "direct";

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
      assigneeUserIdDefault: "",
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
      assigneeUserIdDefault: "",
      prix: [emptyPrixItem()],
    });
    setAssignableUsers([]);
    setShowNouveauPrestataire(false);
    setSiretInput("");
    setSiretState({ status: "idle" });
    setNouveauNom("");
    setNouveauContact({ prenom: "", nom: "", email: "", phone: "" });

    async function loadPrestataires() {
      setLoadingPrestataires(true);
      const result = await getPrestatairesForServiceAction({
        serviceId,
        entrepriseId,
        modeCommercial,
      });
      if (result?.data?.prestataires) {
        setPrestataires(result.data.prestataires);
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
    form,
  ]);

  // siretInput contient déjà uniquement des chiffres (onChange filtre les non-digits)
  const siretValide = isValidSIRET(siretInput);

  const handleSearchSiret = async () => {
    setSiretState({ status: "searching" });
    const result = await findEntrepriseBySiretAction({ siret: siretInput });
    if (result?.serverError) {
      setSiretState({ status: "error", message: result.serverError.message });
      return;
    }
    if (result?.data?.entreprise) {
      setSiretState({ status: "found", entreprise: result.data.entreprise });
      setNouveauNom(result.data.entreprise.nom);
    } else {
      setSiretState({ status: "not_found" });
      setNouveauNom("");
    }
  };

  const handleConfirmPrestataire = async () => {
    const siret = siretInput.replace(/\s/g, "");
    if (!nouveauNom.trim()) {
      toast.error("Le nom du prestataire est requis");
      return;
    }
    setCreatingPrestataire(true);
    const result = await createOrLinkPrestataireAction({
      siret,
      nom: nouveauNom.trim(),
      serviceId,
      entrepriseId,
      prenomContact: nouveauContact.prenom || undefined,
      nomContact: nouveauContact.nom || undefined,
      emailContact: nouveauContact.email || undefined,
      phoneContact: nouveauContact.phone || undefined,
    });
    setCreatingPrestataire(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.serviceEntrepriseId) {
      const seId = result.data.serviceEntrepriseId;
      form.setValue("serviceEntrepriseId", seId, { shouldValidate: true });

      // Ajouter à la liste locale si pas déjà présent
      if (!prestataires.find((p) => p.serviceEntrepriseId === seId)) {
        setPrestataires((prev) => [
          ...prev,
          {
            serviceEntrepriseId: seId,
            entrepriseId: "",
            nom: nouveauNom.trim(),
          },
        ]);
      }

      setShowNouveauPrestataire(false);
      setSiretInput("");
      setSiretState({ status: "idle" });
      setNouveauNom("");
      setNouveauContact({ prenom: "", nom: "", email: "", phone: "" });
      toast.success("Prestataire lié avec succès");
    }
  };

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
  const watchedServiceEntrepriseId = form.watch("serviceEntrepriseId");

  // Load assignable users when prestataire changes
  useEffect(() => {
    const selectedPrestataire = prestataires.find(
      (p) => p.serviceEntrepriseId === watchedServiceEntrepriseId,
    );
    const prestataireEntrepriseId = selectedPrestataire?.entrepriseId;

    if (!prestataireEntrepriseId) {
      setAssignableUsers([]);
      form.setValue("assigneeUserIdDefault", "");
      return;
    }

    setLoadingAssignees(true);
    getAssignableUsersForOccurrenceAction({ entrepriseId: prestataireEntrepriseId })
      .then((result) => {
        if (result?.data?.users) {
          setAssignableUsers(result.data.users);
        } else {
          setAssignableUsers([]);
        }
      })
      .finally(() => setLoadingAssignees(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedServiceEntrepriseId, prestataires]);

  function recalculateMontant(index: number, cout: string, marge: string) {
    const coutNum = Number(cout) || 0;
    const margeNum = Number(marge) || 0;
    const montant = coutNum * (1 + margeNum / 100);
    form.setValue(`prix.${index}.montantHt`, montant.toFixed(2), {
      shouldValidate: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Ajouter un prestataire</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              <div className="space-y-5 py-2 pb-4">
                {/* ── SECTION PRESTATAIRE ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      Prestataire <span className="text-destructive">*</span>
                    </Label>
                    {canCreatePrestataire && !showNouveauPrestataire && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowNouveauPrestataire(true)}
                      >
                        <Plus className="h-3 w-3" />
                        Nouveau prestataire
                      </Button>
                    )}
                  </div>

                  {/* Select prestataires existants */}
                  <RhfControlledSelect<InsertExecutionFormType>
                    name="serviceEntrepriseId"
                    label=""
                    disabled={
                      loadingPrestataires ||
                      (prestataires.length === 0 && !showNouveauPrestataire)
                    }
                    placeholder={
                      loadingPrestataires
                        ? "Chargement..."
                        : prestataires.length === 0
                          ? canCreatePrestataire
                            ? "Aucun prestataire — créez-en un ci-dessous"
                            : "Aucun prestataire disponible"
                          : "Sélectionnez un prestataire"
                    }
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

                  {/* Sous-formulaire nouveau prestataire */}
                  {showNouveauPrestataire && (
                    <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Nouveau prestataire
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setShowNouveauPrestataire(false);
                            setSiretInput("");
                            setSiretState({ status: "idle" });
                            setNouveauNom("");
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* SIRET */}
                      <div className="space-y-1">
                        <Label className="text-xs">
                          SIRET <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              className="h-8 font-mono pr-7"
                              placeholder="14 chiffres"
                              maxLength={14}
                              value={siretInput}
                              onChange={(e) => {
                                setSiretInput(e.target.value.replace(/\D/g, ""));
                                setSiretState({ status: "idle" });
                              }}
                            />
                            {siretInput.length > 0 && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                {siretValide ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0"
                            onClick={handleSearchSiret}
                            disabled={!siretValide || siretState.status === "searching"}
                          >
                            {siretState.status === "searching" ? (
                              <Spinner />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            Rechercher
                          </Button>
                        </div>
                        {siretState.status === "error" && (
                          <p className="text-destructive text-xs">
                            {siretState.message}
                          </p>
                        )}
                        {siretState.status === "found" && (
                          <p className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Trouvé dans le système : {siretState.entreprise.nom}
                          </p>
                        )}
                        {siretState.status === "not_found" && (
                          <p className="text-muted-foreground text-xs">
                            Prestataire non trouvé — renseignez les informations
                            ci-dessous.
                          </p>
                        )}
                      </div>

                      {/* Nom (toujours visible après recherche) */}
                      {(siretState.status === "found" ||
                        siretState.status === "not_found") && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Nom de l&apos;entreprise{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              className="h-8"
                              value={nouveauNom}
                              onChange={(e) => setNouveauNom(e.target.value)}
                              readOnly={siretState.status === "found"}
                            />
                          </div>

                          {/* Infos contact (uniquement si nouveau) */}
                          {siretState.status === "not_found" && (
                            <>
                              <Separator />
                              <p className="text-muted-foreground text-xs">
                                Contact (optionnel)
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Prénom</Label>
                                  <Input
                                    className="h-8"
                                    value={nouveauContact.prenom}
                                    onChange={(e) =>
                                      setNouveauContact((c) => ({
                                        ...c,
                                        prenom: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Nom</Label>
                                  <Input
                                    className="h-8"
                                    value={nouveauContact.nom}
                                    onChange={(e) =>
                                      setNouveauContact((c) => ({
                                        ...c,
                                        nom: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Email</Label>
                                  <Input
                                    className="h-8"
                                    type="email"
                                    value={nouveauContact.email}
                                    onChange={(e) =>
                                      setNouveauContact((c) => ({
                                        ...c,
                                        email: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Téléphone</Label>
                                  <Input
                                    className="h-8"
                                    value={nouveauContact.phone}
                                    onChange={(e) =>
                                      setNouveauContact((c) => ({
                                        ...c,
                                        phone: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            className="w-full"
                            onClick={handleConfirmPrestataire}
                            disabled={creatingPrestataire || !nouveauNom.trim()}
                          >
                            {creatingPrestataire && <Spinner />}
                            {siretState.status === "found"
                              ? "Lier ce prestataire"
                              : "Créer et lier ce prestataire"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

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

                {/* Intervenant par défaut */}
                {watchedServiceEntrepriseId && (
                  <FormField
                    control={form.control}
                    name="assigneeUserIdDefault"
                    render={({ field: f }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm">
                          Intervenant par défaut{" "}
                          <span className="text-muted-foreground font-normal">
                            (optionnel)
                          </span>
                        </FormLabel>
                        <Select
                          value={f.value ?? ""}
                          onValueChange={f.onChange}
                          disabled={loadingAssignees}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingAssignees
                                    ? "Chargement..."
                                    : assignableUsers.length === 0
                                      ? "Aucun utilisateur disponible"
                                      : "Sélectionnez un intervenant"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">
                              <span className="text-muted-foreground italic">
                                Aucun (à assigner manuellement)
                              </span>
                            </SelectItem>
                            {assignableUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.prenom} {u.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                          Propagé automatiquement aux nouvelles interventions générées.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                Ajouter le prestataire
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
