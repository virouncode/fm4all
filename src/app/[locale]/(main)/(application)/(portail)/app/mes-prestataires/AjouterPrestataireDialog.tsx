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
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import {
  createOrLinkPrestataireAction,
  findEntrepriseBySiretAction,
  getServicesForPickerAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type SiretStateType =
  | { status: "idle" }
  | { status: "searching" }
  // Entreprise trouvée, sans rôle prestataire → on peut ajouter le rôle + services
  | { status: "found_new"; entreprise: { id: string; nom: string; siret: string } }
  // Entreprise trouvée, déjà prestataire :
  // - hasActiveAdmin=true  → le prestataire gère son profil → services lecture seule pour le client
  // - hasActiveAdmin=false → géré par le client → services modifiables (pré-cochés)
  | {
      status: "found_prestataire";
      entreprise: { id: string; nom: string; siret: string };
      existingServices: Array<{ id: string; nom: string }>;
      hasActiveAdmin: boolean;
    }
  | { status: "already_linked"; entreprise: { id: string; nom: string } }
  | { status: "self" } // SIRET = propre entreprise du client
  | { status: "not_found" }
  | { status: "error"; message: string };

const step1FormSchema = z.object({
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  prenomContact: z.string(),
  nomContact: z.string(),
  emailContact: z.string().email("Email invalide").or(z.literal("")),
  phoneContact: z.string(),
});

type Step1FormType = z.infer<typeof step1FormSchema>;

type AjouterPrestataireDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientEntrepriseId: string;
  onSuccess: () => void;
};

export function AjouterPrestataireDialog({
  open,
  onOpenChange,
  clientEntrepriseId,
  onSuccess,
}: AjouterPrestataireDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [siretInput, setSiretInput] = useState("");
  const [siretState, setSiretState] = useState<SiretStateType>({ status: "idle" });
  const [creating, setCreating] = useState(false);
  const [services, setServices] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const siretValide = isValidSIRET(siretInput);
  const siretResolved =
    siretState.status === "found_new" ||
    siretState.status === "found_prestataire" ||
    siretState.status === "not_found" ||
    siretState.status === "already_linked" ||
    siretState.status === "self";

  const form = useForm<Step1FormType>({
    resolver: zodResolver(step1FormSchema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setSiretInput("");
    setSiretState({ status: "idle" });
    setSelectedServiceIds([]);
    form.reset({
      nom: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
    });
  }, [open, form]);

  // Charger le catalogue de services au passage à l'étape 2
  // Sauf si l'entreprise est déjà prestataire AVEC admin actif (services en lecture seule, catalogue inutile)
  const skipLoadServices =
    siretState.status === "found_prestataire" && siretState.hasActiveAdmin;

  useEffect(() => {
    if (step !== 2 || services.length > 0 || skipLoadServices) return;

    setLoadingServices(true);
    getServicesForPickerAction().then((result) => {
      setLoadingServices(false);
      if (result?.data?.services) {
        setServices(result.data.services);
      }
    });
  }, [step, services.length, skipLoadServices]);

  const handleSearchSiret = async () => {
    setSiretState({ status: "searching" });
    const result = await findEntrepriseBySiretAction({
      siret: siretInput,
      clientEntrepriseId,
    });
    if (result?.serverError) {
      setSiretState({ status: "error", message: result.serverError.message });
      return;
    }
    if (result?.data?.isSelf) {
      setSiretState({ status: "self" });
      return;
    }
    if (result?.data?.entreprise) {
      if (result.data.alreadyLinked) {
        setSiretState({
          status: "already_linked",
          entreprise: result.data.entreprise,
        });
      } else if (result.data.hasPrestataireRole) {
        setSiretState({
          status: "found_prestataire",
          entreprise: result.data.entreprise,
          existingServices: result.data.existingServices,
          hasActiveAdmin: result.data.hasActiveAdmin,
        });
        form.setValue("nom", result.data.entreprise.nom, {
          shouldValidate: true,
        });
        // Pré-cocher les services existants si le client peut les modifier
        if (!result.data.hasActiveAdmin) {
          setSelectedServiceIds(
            result.data.existingServices.map((s) => s.id),
          );
        }
      } else {
        setSiretState({
          status: "found_new",
          entreprise: result.data.entreprise,
        });
        form.setValue("nom", result.data.entreprise.nom, {
          shouldValidate: true,
        });
      }
    } else {
      setSiretState({ status: "not_found" });
      form.setValue("nom", "");
    }
  };

  const handleResetSiret = () => {
    setSiretInput("");
    setSiretState({ status: "idle" });
    form.reset({
      nom: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
    });
  };

  const handleNext = async () => {
    const valid = await form.trigger(["nom"]);
    if (!valid) return;
    setStep(2);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSubmit = async () => {
    const data = form.getValues();
    setCreating(true);
    // Pour un prestataire avec admin actif, on ne touche pas à ses services (serviceIds vide)
    // Pour un prestataire sans admin (géré par le client), on envoie les services sélectionnés
    // → l'action remplacera la liste de services
    const serviceIdsToSubmit =
      siretState.status === "found_prestataire" && siretState.hasActiveAdmin
        ? []
        : selectedServiceIds;
    const result = await createOrLinkPrestataireAction({
      siret: siretInput,
      nom: data.nom,
      serviceIds: serviceIdsToSubmit,
      entrepriseId: clientEntrepriseId,
      prenomContact: data.prenomContact || undefined,
      nomContact: data.nomContact || undefined,
      emailContact: data.emailContact || undefined,
      phoneContact: data.phoneContact || undefined,
    });
    setCreating(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      onSuccess();
      onOpenChange(false);
    }
  };

  const prestataireNom =
    siretState.status === "found_new" || siretState.status === "found_prestataire"
      ? siretState.entreprise.nom
      : form.getValues("nom");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle>Ajouter un prestataire</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Étape {step} sur 2 —{" "}
            {step === 1
              ? "Identification du prestataire"
              : "Services proposés"}
          </p>
        </DialogHeader>

        <Form {...form}>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              <div className="space-y-4 py-4">
                {step === 1 ? (
                  <>
                    {/* SIRET */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        SIRET <span>*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            className={`font-mono pr-8 ${siretResolved ? "bg-muted cursor-default" : ""}`}
                            placeholder="14 chiffres"
                            maxLength={14}
                            value={siretInput}
                            readOnly={
                              siretState.status === "found_new" ||
                              siretState.status === "found_prestataire" ||
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
                              !siretValide ||
                              siretState.status === "searching"
                            }
                            onClick={handleSearchSiret}
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
                      {siretState.status === "found_new" && (
                        <p className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Trouvé dans le système : {siretState.entreprise.nom}{" "}
                          — vous pouvez définir les services proposés.
                        </p>
                      )}
                      {siretState.status === "found_prestataire" && (
                        <p className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Trouvé dans le système : {siretState.entreprise.nom}{" "}
                          — prestataire enregistré.
                        </p>
                      )}
                      {siretState.status === "already_linked" && (
                        <p className="text-destructive flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          {siretState.entreprise.nom} est déjà dans votre liste
                          de prestataires.
                        </p>
                      )}
                      {siretState.status === "self" && (
                        <p className="text-destructive flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          Vous ne pouvez pas ajouter votre propre entreprise
                          comme prestataire.
                        </p>
                      )}
                      {siretState.status === "not_found" && (
                        <p className="text-muted-foreground text-xs">
                          Prestataire non trouvé — renseignez les informations
                          ci-dessous.
                        </p>
                      )}
                    </div>

                    {/* Nom (après recherche) */}
                    {(siretState.status === "found_new" ||
                      siretState.status === "found_prestataire") && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Nom de l&apos;entreprise
                        </p>
                        <p className="text-foreground text-sm">
                          {siretState.entreprise.nom}
                        </p>
                      </div>
                    )}
                    {siretState.status === "not_found" && (
                      <RhfInput<Step1FormType>
                        name="nom"
                        label="Nom de l'entreprise"
                        requiredMark
                      />
                    )}

                    {/* Contact (uniquement si prestataire inconnu du système) */}
                    {siretState.status === "not_found" && (
                      <>
                        <Separator />
                        <p className="text-muted-foreground text-sm">
                          Contact (optionnel)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <RhfInput<Step1FormType>
                            name="prenomContact"
                            label="Prénom"
                          />
                          <RhfInput<Step1FormType>
                            name="nomContact"
                            label="Nom"
                          />
                          <RhfInput<Step1FormType>
                            name="emailContact"
                            label="Email"
                            type="email"
                          />
                          <RhfInput<Step1FormType>
                            name="phoneContact"
                            label="Téléphone"
                            type="tel"
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : siretState.status === "found_prestataire" &&
                  siretState.hasActiveAdmin ? (
                  /* Étape 2 : Prestataire avec compte — services en lecture seule */
                  <div className="space-y-3">
                    <div>
                      <Label>Services proposés</Label>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        <strong>{prestataireNom}</strong> gère son propre
                        profil. La modification de ses services est réservée à
                        l&apos;administration.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {siretState.existingServices.length === 0 ? (
                        <p className="text-muted-foreground col-span-2 text-sm">
                          Aucun service associé.
                        </p>
                      ) : (
                        siretState.existingServices.map((service) => (
                          <div
                            key={service.id}
                            className="bg-muted/50 flex items-center gap-2 rounded-md border p-2 text-sm"
                          >
                            <Checkbox checked disabled />
                            <span>{service.nom}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* Étape 2 : Nouveau prestataire ou entreprise sans rôle prestataire — picker services */
                  <div className="space-y-3">
                    <div>
                      <Label>
                        Services proposés <span>*</span>
                      </Label>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Cochez les services que{" "}
                        <strong>{prestataireNom}</strong> propose
                      </p>
                    </div>
                    {loadingServices ? (
                      <p className="text-muted-foreground text-sm">
                        Chargement des services...
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {services.map((service) => (
                          <label
                            key={service.id}
                            className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
                          >
                            <Checkbox
                              checked={selectedServiceIds.includes(service.id)}
                              onCheckedChange={() =>
                                handleServiceToggle(service.id)
                              }
                            />
                            <span>{service.nom}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {!loadingServices && selectedServiceIds.length === 0 && (
                      <p className="text-destructive text-xs">
                        Sélectionnez au moins un service pour ce prestataire.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="bg-background flex-shrink-0 border-t px-6 pt-4 pb-6">
              {step === 1 ? (
                <>
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
                    disabled={
                      !siretResolved ||
                      siretState.status === "already_linked" ||
                      siretState.status === "self" ||
                      isSubmitting
                    }
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
                    disabled={creating}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      creating ||
                      (!(
                        siretState.status === "found_prestataire" &&
                        siretState.hasActiveAdmin
                      ) &&
                        selectedServiceIds.length === 0)
                    }
                    onClick={handleSubmit}
                  >
                    {creating && <Spinner />}
                    Confirmer
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
