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
  updatePrestataireServicesAsProxyAction,
} from "@/server/actions/entreprisesActions";
import { AlertTriangle, Check, HandPlatter, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ServiceItemType = { id: string; nom: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestataireEntrepriseId: string;
  currentServiceIds: string[];
  onSuccess: () => void;
};

export function EditPrestataireServicesDialog({
  open,
  onOpenChange,
  prestataireEntrepriseId,
  currentServiceIds,
  onSuccess,
}: Props) {
  const [localServiceIds, setLocalServiceIds] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<ServiceItemType[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Initialiser à l'ouverture
  useEffect(() => {
    if (!open) return;
    setLocalServiceIds(currentServiceIds);
    setError(undefined);
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

  const isDirty =
    JSON.stringify([...localServiceIds].sort()) !==
    JSON.stringify([...currentServiceIds].sort());

  const toggleService = (serviceId: string) => {
    const nextServiceIds = localServiceIds.includes(serviceId)
      ? localServiceIds.filter((id) => id !== serviceId)
      : [...localServiceIds, serviceId];

    setLocalServiceIds(nextServiceIds);

    if (nextServiceIds.length === 0) {
      setError("Sélectionnez au moins un service");
    } else if (error) {
      setError(undefined);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (localServiceIds.length === 0) {
      setError("Sélectionnez au moins un service");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePrestataireServicesAsProxyAction({
      prestataireEntrepriseId,
      serviceIds: localServiceIds,
    });
    setIsSubmitting(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Services mis à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <HandPlatter className="h-5 w-5 text-primary" />
            Modifier les services
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
                Vous pouvez ajouter des services librement. Le{" "}
                <strong>retrait</strong> d&apos;un service est bloqué si des
                prestations ou exécutions actives y sont associées.
              </p>
            </div>

            {/* Services */}
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
              {error && (
                <p className="text-xs text-destructive">{error}</p>
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
