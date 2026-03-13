"use client";

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
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { roleEntrepriseCodes } from "@/constants/codeTables";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import { findEntrepriseBySiretAction } from "@/server/actions/clientServiceExecutionsActions";
import {
  createEntrepriseAction,
  getAllServicesAction,
} from "@/server/actions/entreprisesActions";
import {
  type RoleEntrepriseType,
  type SelectProspectType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Lock,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getRoleBadgeStyles } from "./helpers";
import { ProspectPickerDialog } from "./ProspectPickerDialog";

type SireneDataType = {
  nom: string;
  formeJuridique: string | null;
  adresseLigne1: string;
  adresseLigne2: string | null;
  codePostal: string;
  ville: string;
  numeroTva: string;
  etatActif: boolean;
};

type SiretStateType =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; entreprise: { id: string; nom: string; siret: string } }
  | { status: "not_found"; sireneData: SireneDataType }
  | { status: "error"; message: string };

const FR_TVA_REGEX = /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/;

const dialogFormSchema = z
  .object({
    nom: z.string().min(1, "Nom de l'entreprise obligatoire"),
    // Champs SIRENE
    adresseLigne1: z.string().optional(),
    adresseLigne2: z.string().optional(),
    codePostal: z.string().optional(),
    ville: z.string().optional(),
    formeJuridique: z.string().optional(),
    numeroTva: z
      .string()
      .regex(
        FR_TVA_REGEX,
        "Format attendu : FR + 2 caractères + 9 chiffres (ex: FR71941928640)",
      )
      .or(z.literal(""))
      .optional(),
    roles: z
      .array(z.enum(roleEntrepriseCodes))
      .min(1, "Sélectionnez au moins un rôle"),
    serviceIds: z.array(z.uuid()),
  })
  .superRefine((data, ctx) => {
    if (data.roles.includes("prestataire") && data.serviceIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sélectionnez au moins un service pour ce prestataire",
        path: ["serviceIds"],
      });
    }
  });

type DialogFormType = z.infer<typeof dialogFormSchema>;

type ServiceItemType = { id: string; nom: string };

const ROLES: {
  value: RoleEntrepriseType;
  label: string;
  description: string;
}[] = [
  {
    value: "client",
    label: "Client",
    description: "Cette entreprise commande des prestations",
  },
  {
    value: "prestataire",
    label: "Prestataire",
    description: "Cette entreprise fournit des prestations",
  },
];

type EntrepriseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function EntrepriseFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: EntrepriseFormDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [siretInput, setSiretInput] = useState("");
  const [siretState, setSiretState] = useState<SiretStateType>({
    status: "idle",
  });
  const [services, setServices] = useState<ServiceItemType[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [prospectPickerOpen, setProspectPickerOpen] = useState(false);

  const siretValide = isValidSIRET(siretInput);
  const siretResolved =
    siretState.status === "found" || siretState.status === "not_found";

  const form = useForm<DialogFormType>({
    resolver: zodResolver(dialogFormSchema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
      roles: [],
      serviceIds: [],
    },
  });

  const { isSubmitting, errors } = useFormState({ control: form.control });
  const watchedRoles = useWatch({ control: form.control, name: "roles" });
  const watchedServiceIds = useWatch({
    control: form.control,
    name: "serviceIds",
  });
  const isPrestataire = watchedRoles.includes("prestataire");

  // Reset on close
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSiretInput("");
    setSiretState({ status: "idle" });
    form.reset({
      nom: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
      roles: [],
      serviceIds: [],
    });
  }, [open, form]);

  // Load services when prestataire is selected in step 2
  useEffect(() => {
    if (!isPrestataire || services.length > 0) return;

    setLoadingServices(true);
    getAllServicesAction()
      .then((result) => {
        if (result?.data?.services) {
          setServices(result.data.services);
        }
      })
      .catch(() => toast.error("Erreur lors du chargement des services"))
      .finally(() => setLoadingServices(false));
  }, [isPrestataire, services.length]);

  const searchSiret = async (siretValue: string) => {
    setSiretState({ status: "searching" });
    const result = await findEntrepriseBySiretAction({ siret: siretValue });
    if (result?.serverError) {
      setSiretState({ status: "error", message: result.serverError.message });
      return;
    }

    // SIRENE indisponible → bloquer
    if (result?.data?.sireneUnavailable) {
      setSiretState({ status: "idle" });
      toast.error(
        "Service INSEE indisponible — impossible de vérifier ce SIRET. Réessayez dans quelques instants.",
      );
      return;
    }

    if (result?.data?.entreprise) {
      setSiretState({ status: "found", entreprise: result.data.entreprise });
    } else {
      // SIRET non en DB → utiliser les données SIRENE
      const sireneData = result?.data?.sireneData as SireneDataType | null;
      if (!sireneData) {
        setSiretState({
          status: "error",
          message: "Impossible de récupérer les données depuis l'API SIRENE.",
        });
        return;
      }
      setSiretState({ status: "not_found", sireneData });
      form.setValue("nom", sireneData.nom, { shouldValidate: true });
      form.setValue("adresseLigne1", sireneData.adresseLigne1 ?? "");
      form.setValue("adresseLigne2", sireneData.adresseLigne2 ?? "");
      form.setValue("codePostal", sireneData.codePostal ?? "");
      form.setValue("ville", sireneData.ville ?? "");
      form.setValue("formeJuridique", sireneData.formeJuridique ?? "");
      form.setValue("numeroTva", sireneData.numeroTva ?? "");
    }
  };

  const handleResetSiret = () => {
    setSiretInput("");
    setSiretState({ status: "idle" });
    form.reset({
      nom: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
      roles: form.getValues("roles"),
      serviceIds: form.getValues("serviceIds"),
    });
  };

  const handleProspectSelected = (prospect: SelectProspectType) => {
    form.setValue("nom", prospect.nomEntreprise, { shouldValidate: true });

    if (prospect.siret) {
      setSiretInput(prospect.siret);
      searchSiret(prospect.siret);
    }
    // Si pas de SIRET : laisser l'état idle, l'utilisateur saisit le SIRET manuellement

    toast.success(
      `Formulaire pré-rempli depuis le prospect "${prospect.nomEntreprise}"`,
    );
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleRoleToggle = (role: RoleEntrepriseType) => {
    const currentRoles = form.getValues("roles");
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    form.setValue("roles", newRoles, { shouldValidate: true });

    if (role === "prestataire" && currentRoles.includes("prestataire")) {
      form.setValue("serviceIds", []);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const currentIds = form.getValues("serviceIds") ?? [];
    const newIds = currentIds.includes(serviceId)
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];
    form.setValue("serviceIds", newIds);
  };

  const onSubmit = async (data: DialogFormType) => {
    const result = await createEntrepriseAction({
      siret: siretInput,
      nom: data.nom,
      adresseLigne1: data.adresseLigne1 || undefined,
      adresseLigne2: data.adresseLigne2 || undefined,
      codePostal: data.codePostal || undefined,
      ville: data.ville || undefined,
      formeJuridique: data.formeJuridique || undefined,
      numeroTva: data.numeroTva || undefined,
      roles: data.roles,
      serviceIds: data.serviceIds,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      toast.success(result.data.message);
      onSuccess();
      onOpenChange(false);
    }
  };

  const entrepriseNom =
    siretState.status === "found"
      ? siretState.entreprise.nom
      : form.getValues("nom");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Building2 className="text-primary size-5" />
                Nouvelle entreprise
              </div>
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Étape {step} sur 2 —{" "}
              {step === 1
                ? "Identification de l'entreprise"
                : "Rôles et services"}
            </p>
          </DialogHeader>

          <Separator />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {step === 1 ? (
                  <div className="space-y-4">
                    {/* Prospect picker */}
                    {/* {siretState.status === "idle" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed"
                        onClick={() => setProspectPickerOpen(true)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Remplir depuis un prospect existant
                      </Button>
                    )} */}

                    {/* SIRET */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        SIRET <span>*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            className={`pr-8 font-mono ${siretResolved ? "bg-muted cursor-default" : ""}`}
                            placeholder="14 chiffres"
                            maxLength={14}
                            value={siretInput}
                            readOnly={
                              siretState.status === "found" ||
                              siretState.status === "not_found" ||
                              siretState.status === "searching"
                            }
                            onChange={(e) => {
                              setSiretInput(e.target.value.replace(/\D/g, ""));
                              setSiretState({ status: "idle" });
                            }}
                          />
                          {siretInput.length > 0 && !siretResolved && (
                            <span className="absolute top-1/2 right-2.5 -translate-y-1/2">
                              {siretValide ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="text-destructive h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                        {siretResolved ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={handleResetSiret}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Modifier
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            disabled={
                              !siretValide || siretState.status === "searching"
                            }
                            onClick={() => searchSiret(siretInput)}
                          >
                            {siretState.status === "searching" ? (
                              <Spinner />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            Rechercher
                          </Button>
                        )}
                      </div>

                      {siretState.status === "error" && (
                        <p className="text-destructive text-xs">
                          {siretState.message}
                        </p>
                      )}
                      {siretState.status === "found" && (
                        <p className="text-destructive flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          {siretState.entreprise.nom} est déjà enregistrée dans
                          le système.
                        </p>
                      )}
                      {siretState.status === "not_found" && (
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Données récupérées depuis l&apos;API SIRENE — non
                          modifiables.
                        </p>
                      )}
                    </div>

                    {/* Champs SIRENE pré-remplis (lecture seule) + contact si SIRET non trouvé */}
                    {siretState.status === "not_found" && (
                      <>
                        {/* Informations SIRENE — lecture seule */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                              Nom de l&apos;entreprise
                              <Lock className="h-3 w-3" />
                            </label>
                            <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                              {siretState.sireneData.nom}
                            </p>
                          </div>

                          {siretState.sireneData.formeJuridique && (
                            <div className="space-y-1">
                              <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                Forme juridique
                                <Lock className="h-3 w-3" />
                              </label>
                              <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                                {siretState.sireneData.formeJuridique}
                              </p>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                              Adresse
                              <Lock className="h-3 w-3" />
                            </label>
                            <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                              {siretState.sireneData.adresseLigne1}
                              {", "}
                              {siretState.sireneData.codePostal}{" "}
                              {siretState.sireneData.ville}
                            </p>
                          </div>

                          <RhfInput<DialogFormType>
                            name="adresseLigne2"
                            label="Complément d'adresse"
                            placeholder="Bâtiment B, étage 3..."
                          />

                          {siretState.sireneData.numeroTva && (
                            <div className="space-y-1">
                              <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                N° TVA
                                <Lock className="h-3 w-3" />
                              </label>
                              <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 font-mono text-sm">
                                {siretState.sireneData.numeroTva}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Étape 2 : Rôles + Services */
                  <div className="space-y-6">
                    {/* Rôles */}
                    <div className="space-y-2">
                      <Label>
                        Rôle(s) <span>*</span>
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        Sélectionnez un ou plusieurs rôles pour{" "}
                        <strong>{entrepriseNom}</strong>
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ROLES.map((role) => {
                          const badge = getRoleBadgeStyles(role.value);
                          const isSelected = watchedRoles.includes(role.value);
                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => handleRoleToggle(role.value)}
                              className={`hover:border-primary/50 flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-primary ring-1"
                                  : "border-border bg-background"
                              }`}
                            >
                              <div className="flex w-full items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${badge.className} rounded px-1.5 py-0.5`}
                                >
                                  {badge.label}
                                </span>
                                {isSelected && (
                                  <Check className="text-primary h-4 w-4" />
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {role.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                      {errors.roles && (
                        <p className="text-destructive text-xs">
                          {errors.roles.message}
                        </p>
                      )}
                    </div>

                    {/* Services (si prestataire) */}
                    {isPrestataire && (
                      <div className="space-y-2">
                        <Label>
                          Services proposés <span>*</span>
                        </Label>
                        <p className="text-muted-foreground text-xs">
                          Cochez les services que ce prestataire propose
                        </p>
                        {loadingServices ? (
                          <p className="text-muted-foreground text-sm">
                            Chargement des services...
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {services.map((service) => {
                              const isChecked = (
                                watchedServiceIds ?? []
                              ).includes(service.id);
                              return (
                                <label
                                  key={service.id}
                                  className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      handleServiceToggle(service.id)
                                    }
                                  />
                                  <span>{service.nom}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {!loadingServices &&
                          (watchedServiceIds ?? []).length === 0 && (
                            <p className="text-destructive text-xs">
                              Sélectionnez au moins un service pour ce
                              prestataire.
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <DialogFooter className="bg-background px-6 py-4">
                {step === 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      disabled={!siretResolved || siretState.status === "found"}
                      onClick={handleNext}
                    >
                      Suivant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (isPrestataire &&
                          (watchedServiceIds ?? []).length === 0)
                      }
                    >
                      {isSubmitting && <Spinner />}
                      <Check className="h-4 w-4" />
                      Créer l&apos;entreprise
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProspectPickerDialog
        open={prospectPickerOpen}
        onOpenChange={setProspectPickerOpen}
        onSelect={handleProspectSelected}
      />
    </>
  );
}
