"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getAllServicesAction,
  updateEntrepriseRolesAction,
} from "@/server/actions/entreprisesActions";
import type { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { AlertTriangle, Check, Loader2, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getRoleBadgeStyles } from "../helpers";

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

// "plateforme" ne peut jamais être attribué via cette UI (réservé à FM4ALL en DB)

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  currentRoles: RoleEntrepriseType[];
  currentServiceIds: string[];
  onSuccess: () => void;
};

export function EditEntrepriseRolesDialog({
  open,
  onOpenChange,
  entrepriseId,
  currentRoles,
  currentServiceIds,
  onSuccess,
}: Props) {
  const [localRoles, setLocalRoles] = useState<RoleEntrepriseType[]>([]);
  const [localServiceIds, setLocalServiceIds] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<ServiceItemType[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    roles?: string;
    serviceIds?: string;
  }>({});

  // Initialiser à l'ouverture
  useEffect(() => {
    if (!open) return;
    setLocalRoles(currentRoles);
    setLocalServiceIds(currentServiceIds);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Charger les services une seule fois au montage
  useEffect(() => {
    async function loadServices() {
      setLoadingServices(true);
      const result = await getAllServicesAction();
      if (result?.data?.services) {
        setAllServices(result.data.services);
      }
      setLoadingServices(false);
    }
    loadServices();
  }, []);

  const isPrestataire = localRoles.includes("prestataire");

  const isDirty =
    JSON.stringify([...localRoles].sort()) !==
      JSON.stringify([...currentRoles].sort()) ||
    JSON.stringify([...localServiceIds].sort()) !==
      JSON.stringify([...currentServiceIds].sort());

  const toggleRole = (role: RoleEntrepriseType) => {
    const isCurrentlyChecked = localRoles.includes(role);

    if (role === "prestataire") {
      if (isCurrentlyChecked) {
        // On retire prestataire → vider services + effacer l'erreur
        setLocalServiceIds([]);
        setErrors((prev) => ({ ...prev, serviceIds: undefined }));
      } else if (localServiceIds.length === 0) {
        // On coche prestataire sans services → afficher l'erreur immédiatement
        setErrors((prev) => ({
          ...prev,
          serviceIds: "Sélectionnez au moins un service pour ce prestataire",
        }));
      }
    }

    setLocalRoles((prev) =>
      isCurrentlyChecked ? prev.filter((r) => r !== role) : [...prev, role],
    );

    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: undefined }));
    }
  };

  const toggleService = (serviceId: string) => {
    const nextServiceIds = localServiceIds.includes(serviceId)
      ? localServiceIds.filter((id) => id !== serviceId)
      : [...localServiceIds, serviceId];

    setLocalServiceIds(nextServiceIds);

    if (isPrestataire && nextServiceIds.length === 0) {
      setErrors((prev) => ({
        ...prev,
        serviceIds: "Sélectionnez au moins un service pour ce prestataire",
      }));
    } else if (errors.serviceIds) {
      setErrors((prev) => ({ ...prev, serviceIds: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (localRoles.length === 0) {
      newErrors.roles = "Au moins un rôle est obligatoire";
    }
    if (isPrestataire && localServiceIds.length === 0) {
      newErrors.serviceIds =
        "Sélectionnez au moins un service pour ce prestataire";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await updateEntrepriseRolesAction({
      entrepriseId,
      roles: localRoles,
      serviceIds: localServiceIds,
    });
    setIsSubmitting(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Rôles mis à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Modifier les rôles
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-2">
            {/* Disclaimer */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <p>
                Vous pouvez ajouter des rôles ou des services librement.
                Le <strong>retrait</strong> d&apos;un rôle ou d&apos;un service est bloqué
                si des prestations ou exécutions actives y sont associées.
              </p>
            </div>

            {/* Rôles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Rôles <span aria-hidden="true">*</span>
              </Label>
              <div className="space-y-2">
                {ROLES.map((role) => {
                  const { className, label } = getRoleBadgeStyles(role.value);
                  const checked = localRoles.includes(role.value);
                  return (
                    <button
                      key={role.value}
                      type="button"
                      className={`w-full flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors text-left ${
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => toggleRole(role.value)}
                    >
                      {/* Indicateur visuel simple — pas de Radix Checkbox pour éviter usePresence */}
                      <div
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                          checked
                            ? "bg-primary border-primary"
                            : "border-input bg-background"
                        }`}
                      >
                        {checked && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Rôle "plateforme" : affiché en lecture seule si présent */}
                {currentRoles.includes("plateforme") && (() => {
                  const { className, label } = getRoleBadgeStyles("plateforme");
                  return (
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 opacity-70 cursor-not-allowed">
                      <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 border-primary bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rôle réservé à FM4ALL — non modifiable via cette interface
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {errors.roles && (
                <p className="text-xs text-destructive">{errors.roles}</p>
              )}
            </div>

            {/* Services (si prestataire) — toujours rendu, masqué via CSS
                pour éviter le démontage massif lors du toggle prestataire */}
            <div className={isPrestataire ? "space-y-2" : "hidden"}>
              <Label className="text-sm font-medium">
                Services proposés <span aria-hidden="true">*</span>
              </Label>
              {loadingServices ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des services...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {allServices.map((service) => {
                    const checked = localServiceIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className="flex items-center gap-2 cursor-pointer text-left py-0.5"
                        onClick={() => toggleService(service.id)}
                      >
                        <div
                          className={`h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                            checked
                              ? "bg-primary border-primary"
                              : "border-input bg-background"
                          }`}
                        >
                          {checked && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm">{service.nom}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.serviceIds && (
                <p className="text-xs text-destructive">{errors.serviceIds}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
