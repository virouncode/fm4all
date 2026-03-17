"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Building2,
  CheckCircle2,
  Lock,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  | {
      status: "found_new";
      entreprise: { id: string; nom: string; siret: string };
    }
  | {
      status: "found_prestataire";
      entreprise: { id: string; nom: string; siret: string };
      existingServices: Array<{ id: string; nom: string }>;
      hasActiveAdmin: boolean;
    }
  | { status: "already_linked"; entreprise: { id: string; nom: string } }
  | { status: "self" }
  | { status: "not_found"; sireneData: SireneDataType }
  | { status: "error"; message: string };

const step1FormSchema = z.object({
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: z.string().optional(),
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
  const [siretState, setSiretState] = useState<SiretStateType>({
    status: "idle",
  });
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
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
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
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
    });
  }, [open, form]);

  // Charger le catalogue de services au passage à l'étape 2
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

    if (result?.data?.sireneUnavailable) {
      setSiretState({ status: "idle" });
      toast.error(
        "Service INSEE indisponible — impossible de vérifier ce SIRET. Réessayez dans quelques instants.",
      );
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
        if (!result.data.hasActiveAdmin) {
          setSelectedServiceIds(result.data.existingServices.map((s) => s.id));
        }
      } else {
        setSiretState({
          status: "found_new",
          entreprise: result.data.entreprise,
        });
      }
    } else {
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
    const serviceIdsToSubmit =
      siretState.status === "found_prestataire" && siretState.hasActiveAdmin
        ? []
        : selectedServiceIds;
    const result = await createOrLinkPrestataireAction({
      siret: siretInput,
      nom: data.nom,
      adresseLigne1: data.adresseLigne1 || undefined,
      adresseLigne2: data.adresseLigne2 || undefined,
      codePostal: data.codePostal || undefined,
      ville: data.ville || undefined,
      formeJuridique: data.formeJuridique || undefined,
      numeroTva: data.numeroTva || undefined,
      serviceIds: serviceIdsToSubmit,
      entrepriseId: clientEntrepriseId,
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
    siretState.status === "found_new" ||
    siretState.status === "found_prestataire"
      ? siretState.entreprise.nom
      : siretState.status === "not_found"
        ? siretState.sireneData.nom
        : form.getValues("nom");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogStyledHeader className="flex-shrink-0 px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="text-primary size-5" />
            Ajouter un prestataire
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Étape {step} sur 2 —{" "}
            {step === 1 ? "Identification du prestataire" : "Services proposés"}
          </p>
        </DialogStyledHeader>
        <DialogStyledBody>
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
                              className={`pr-8 font-mono ${siretResolved ? "bg-muted cursor-default" : ""}`}
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
                                setSiretInput(
                                  e.target.value.replace(/\D/g, ""),
                                );
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
                            Trouvé dans le système : {
                              siretState.entreprise.nom
                            }{" "}
                            — vous pouvez définir les services proposés.
                          </p>
                        )}
                        {siretState.status === "found_prestataire" && (
                          <p className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Trouvé dans le système : {
                              siretState.entreprise.nom
                            }{" "}
                            — prestataire enregistré.
                          </p>
                        )}
                        {siretState.status === "already_linked" && (
                          <p className="text-destructive flex items-center gap-1 text-xs">
                            <XCircle className="h-3 w-3" />
                            {siretState.entreprise.nom} est déjà dans votre
                            liste de prestataires.
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
                            Données récupérées depuis l&apos;API SIRENE — non
                            modifiables.
                          </p>
                        )}
                      </div>

                      {/* Nom affiché en lecture seule si déjà en DB */}
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

                      {/* Champs SIRENE pré-remplis (création uniquement) */}
                      {siretState.status === "not_found" && (
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

                          <RhfInput<Step1FormType>
                            name="adresseLigne2"
                            label="Complément d'adresse"
                            placeholder="Bâtiment B, étage 3..."
                          />
                        </div>
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
                    /* Étape 2 : Nouveau prestataire ou entreprise sans rôle prestataire */
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
                                checked={selectedServiceIds.includes(
                                  service.id,
                                )}
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
                      {!loadingServices && (
                        <p className="text-muted-foreground text-xs">
                          Si vous ne trouvez pas un service, merci de demander
                          l&apos;ajout du service au{" "}
                          <a
                            href="mailto:contact@fm4all.com"
                            className="hover:text-foreground underline"
                          >
                            catalogue
                          </a>
                          .
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex-shrink-0 border-t px-6 pt-4 pb-3">
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
        </DialogStyledBody>
      </DialogStyledContent>
    </Dialog>
  );
}
