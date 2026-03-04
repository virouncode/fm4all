"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  createEntrepriseAction,
  getAllServicesAction,
} from "@/server/actions/entreprisesActions";
import {
  insertEntrepriseStep1Schema,
  insertEntrepriseStep2Schema,
  type InsertEntrepriseFormType,
  type InsertEntrepriseStep1Type,
  type InsertEntrepriseStep2Type,
  type RoleEntrepriseType,
  type SelectProspectType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { getRoleBadgeStyles } from "./helpers";
import { ProspectPickerDialog } from "./ProspectPickerDialog";

type EntrepriseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type ServiceItem = { id: string; nom: string };

const STEPS = [
  { id: 1, label: "Entreprise", icon: Building2 },
  { id: 2, label: "Administrateur", icon: User },
];

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

export function EntrepriseFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: EntrepriseFormDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [prospectPickerOpen, setProspectPickerOpen] = useState(false);

  // ===== Step 1 Form =====
  const form1 = useForm<InsertEntrepriseStep1Type>({
    resolver: zodResolver(insertEntrepriseStep1Schema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      siret: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
      roles: [],
      serviceIds: [],
    },
  });

  const { isSubmitting: isSubmitting1 } = useFormState({
    control: form1.control,
  });
  const watchedRoles = form1.watch("roles");
  const watchedServiceIds = form1.watch("serviceIds");
  const isPrestataire = watchedRoles.includes("prestataire");

  // ===== Step 2 Form =====
  const form2 = useForm<InsertEntrepriseStep2Type>({
    resolver: zodResolver(insertEntrepriseStep2Schema),
    mode: "onTouched",
    defaultValues: {
      adminPrenom: "",
      adminNom: "",
      adminEmail: "",
      adminPhone: "",
    },
  });

  const { isSubmitting: isSubmitting2 } = useFormState({
    control: form2.control,
  });

  // Reset quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      form1.reset({
        nom: "",
        siret: "",
        prenomContact: "",
        nomContact: "",
        emailContact: "",
        phoneContact: "",
        roles: [],
        serviceIds: [],
      });
      form2.reset({
        adminPrenom: "",
        adminNom: "",
        adminEmail: "",
        adminPhone: "",
      });
    }
  }, [open, form1, form2]);

  // Charger les services quand prestataire est sélectionné
  useEffect(() => {
    if (!isPrestataire || services.length > 0) return;

    async function loadServices() {
      setLoadingServices(true);
      try {
        const result = await getAllServicesAction();
        if (result?.data?.services) {
          setServices(result.data.services);
        }
      } catch {
        toast.error("Erreur lors du chargement des services");
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [isPrestataire, services.length]);

  // ===== Auto-fill depuis un prospect =====
  const handleProspectSelected = (prospect: SelectProspectType) => {
    form1.setValue("nom", prospect.nomEntreprise, { shouldValidate: true });
    form1.setValue("siret", prospect.siret ?? "", {
      shouldValidate: !!prospect.siret,
    });
    form1.setValue("prenomContact", prospect.prenomContact, {
      shouldValidate: true,
    });
    form1.setValue("nomContact", prospect.nomContact, { shouldValidate: true });
    form1.setValue("emailContact", prospect.emailContact, {
      shouldValidate: true,
    });
    form1.setValue("phoneContact", prospect.phoneContact, {
      shouldValidate: true,
    });

    // Pré-remplir aussi l'admin avec les données de contact du prospect
    form2.setValue("adminPrenom", prospect.prenomContact, {
      shouldValidate: true,
    });
    form2.setValue("adminNom", prospect.nomContact, { shouldValidate: true });
    form2.setValue("adminEmail", prospect.emailContact, {
      shouldValidate: true,
    });

    toast.success(
      `Formulaire pré-rempli depuis le prospect "${prospect.nomEntreprise}"`,
    );
  };

  // ===== Gestion des rôles (toggle) =====
  const handleRoleToggle = (role: RoleEntrepriseType) => {
    const currentRoles = form1.getValues("roles");
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    form1.setValue("roles", newRoles, { shouldValidate: true });

    // Si on retire prestataire, vider les services
    if (role === "prestataire" && currentRoles.includes("prestataire")) {
      form1.setValue("serviceIds", []);
    }
  };

  // ===== Gestion des services (toggle) =====
  const handleServiceToggle = (serviceId: string) => {
    const currentIds = form1.getValues("serviceIds") ?? [];
    const newIds = currentIds.includes(serviceId)
      ? currentIds.filter((id) => id !== serviceId)
      : [...currentIds, serviceId];
    form1.setValue("serviceIds", newIds);
  };

  // ===== Navigation entre steps =====
  const handleNext = async () => {
    const valid = await form1.trigger();
    if (!valid) return;

    // Pré-remplir les champs admin depuis les infos contact (si vides)
    const { prenomContact, nomContact, emailContact } = form1.getValues();
    if (!form2.getValues("adminPrenom") && prenomContact)
      form2.setValue("adminPrenom", prenomContact);
    if (!form2.getValues("adminNom") && nomContact)
      form2.setValue("adminNom", nomContact);
    if (!form2.getValues("adminEmail") && emailContact)
      form2.setValue("adminEmail", emailContact);

    setCurrentStep(2);
  };

  const handleBack = () => setCurrentStep(1);

  // ===== Soumission finale =====
  const handleSubmit = async () => {
    const valid2 = await form2.trigger();
    if (!valid2) return;

    const formData: InsertEntrepriseFormType = {
      ...form1.getValues(),
      ...form2.getValues(),
    };

    const result = await createEntrepriseAction(formData);

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

  const isSubmitting = isSubmitting1 || isSubmitting2;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Building2 className="text-primary size-5" />
                Nouvelle entreprise
              </div>
            </DialogTitle>

            {/* Progress bar */}
            <div className="mt-4 space-y-3">
              <Progress
                value={(currentStep / STEPS.length) * 100}
                className="h-1.5"
              />
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isDone = step.id < currentStep;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-primary"
                          : isDone
                            ? "text-green-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogHeader>

          <Separator />

          {/* Content scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* ===== STEP 1: Entreprise ===== */}
            {currentStep === 1 && (
              <Form {...form1}>
                <div className="space-y-4">
                  {/* Bouton prospect */}
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

                  {/* Nom + SIRET */}
                  <div className="grid grid-cols-2 gap-4">
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="nom"
                      label="Nom de l'entreprise"
                      requiredMark
                    />
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="siret"
                      label="SIRET"
                      requiredMark
                      maxLength={14}
                    />
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4">
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="prenomContact"
                      label="Prénom du contact"
                      withError={false}
                    />
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="nomContact"
                      label="Nom du contact"
                      withError={false}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="emailContact"
                      label="Email du contact"
                      type="email"
                    />
                    <RhfInput<InsertEntrepriseStep1Type>
                      name="phoneContact"
                      label="Téléphone du contact"
                      withError={false}
                    />
                  </div>

                  <Separator />

                  {/* Rôles */}
                  <div className="space-y-2">
                    <Label>
                      Rôle(s) <span>*</span>
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Sélectionnez un ou plusieurs rôles pour cette entreprise
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
                    {form1.formState.errors.roles && (
                      <p className="text-destructive text-xs">
                        {form1.formState.errors.roles.message}
                      </p>
                    )}
                  </div>

                  {/* Services si prestataire */}
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
                      {form1.formState.errors.serviceIds && (
                        <p className="text-destructive text-xs">
                          {form1.formState.errors.serviceIds.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Form>
            )}

            {/* ===== STEP 2: Administrateur ===== */}
            {currentStep === 2 && (
              <Form {...form2}>
                <div className="space-y-4">
                  <div className="bg-muted/30 space-y-1 rounded-lg border p-4">
                    <p className="text-sm font-medium">
                      Création de l&apos;administrateur principal
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Un compte utilisateur sera créé et un email
                      d&apos;activation lui sera envoyé pour définir son mot de
                      passe.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <RhfInput<InsertEntrepriseStep2Type>
                      name="adminPrenom"
                      label="Prénom"
                      requiredMark
                    />
                    <RhfInput<InsertEntrepriseStep2Type>
                      name="adminNom"
                      label="Nom"
                      requiredMark
                    />
                  </div>

                  <RhfInput<InsertEntrepriseStep2Type>
                    name="adminEmail"
                    label="Adresse email"
                    requiredMark
                    type="email"
                  />

                  <RhfInput<InsertEntrepriseStep2Type>
                    name="adminPhone"
                    label="Téléphone (optionnel)"
                    withError={false}
                  />
                </div>
              </Form>
            )}
          </div>

          <Separator />

          {/* Footer sticky */}
          <div className="bg-background flex items-center justify-between px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={
                currentStep === 1 ? () => onOpenChange(false) : handleBack
              }
            >
              {currentStep === 1 ? (
                "Annuler"
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </>
              )}
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Création en cours..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Créer l&apos;entreprise
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Prospect Picker Dialog */}
      <ProspectPickerDialog
        open={prospectPickerOpen}
        onOpenChange={setProspectPickerOpen}
        onSelect={handleProspectSelected}
      />
    </>
  );
}
