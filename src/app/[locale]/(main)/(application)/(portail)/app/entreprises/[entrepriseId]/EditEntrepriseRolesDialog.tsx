"use client";

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
import {
  getAllServicesAction,
  updateEntrepriseRolesAction,
} from "@/server/actions/entreprisesActions";
import {
  updateEntrepriseRolesSchema,
  type RoleEntrepriseType,
  type UpdateEntrepriseRolesType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { getRoleBadgeStyles } from "../helpers";

type ServiceItem = { id: string; nom: string };

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
  {
    value: "plateforme",
    label: "Plateforme",
    description: "Entreprise FM4ALL",
  },
];

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
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const form = useForm<UpdateEntrepriseRolesType>({
    resolver: zodResolver(updateEntrepriseRolesSchema),
    mode: "onTouched",
    defaultValues: {
      entrepriseId,
      roles: currentRoles,
      serviceIds: currentServiceIds,
    },
  });

  const { isSubmitting, isDirty, errors } = useFormState({ control: form.control });
  const watchedRoles = useWatch({ control: form.control, name: "roles" }) ?? [];
  const watchedServiceIds = useWatch({ control: form.control, name: "serviceIds" }) ?? [];
  const isPrestataire = watchedRoles.includes("prestataire");
  const rolesError = errors.roles;
  const serviceIdsError = errors.serviceIds;

  // Reset form quand dialog s'ouvre
  useEffect(() => {
    if (open) {
      form.reset({
        entrepriseId,
        roles: currentRoles,
        serviceIds: currentServiceIds,
      });
    }
  }, [open, entrepriseId, currentRoles, currentServiceIds, form]);

  // Charger les services au montage
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

  const toggleRole = (role: RoleEntrepriseType) => {
    const current = form.getValues("roles");
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];

    // Si on retire prestataire, vider les services en même temps
    if (role === "prestataire" && current.includes(role)) {
      form.setValue("serviceIds", [], { shouldDirty: true });
    }

    form.setValue("roles", updated, { shouldDirty: true });
  };

  const toggleService = (serviceId: string) => {
    const current = form.getValues("serviceIds") ?? [];
    const updated = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    form.setValue("serviceIds", updated, { shouldDirty: true });
  };

  const onSubmit = async (data: UpdateEntrepriseRolesType) => {
    const result = await updateEntrepriseRolesAction(data);

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
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Modifier les rôles
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-2">
              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <p>
                  Vous pouvez ajouter des rôles ou des services librement.
                  Le <strong>retrait</strong> d'un rôle ou d'un service est bloqué
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
                    const checked = watchedRoles.includes(role.value);
                    return (
                      <div
                        key={role.value}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => toggleRole(role.value)}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleRole(role.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
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
                      </div>
                    );
                  })}
                </div>
                {rolesError && (
                  <p className="text-xs text-destructive">{rolesError.message}</p>
                )}
              </div>

              {/* Services (si prestataire) */}
              {isPrestataire && (
                <div className="space-y-2">
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
                      {allServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleService(service.id)}
                        >
                          <Checkbox
                            checked={watchedServiceIds.includes(service.id)}
                            onCheckedChange={() => toggleService(service.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Label
                            className="text-sm font-normal cursor-pointer"
                            onClick={() => toggleService(service.id)}
                          >
                            {service.nom}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {serviceIdsError && (
                    <p className="text-xs text-destructive">
                      {serviceIdsError.message}
                    </p>
                  )}
                </div>
              )}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
