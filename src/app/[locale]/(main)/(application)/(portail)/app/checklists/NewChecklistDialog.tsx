"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getServicesAction } from "@/server/actions/servicesActions";
import { insertTacheListeTemplateAction } from "@/server/actions/tacheListesTemplatesActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListChecks, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const newChecklistFormSchema = z.object({
  serviceId: z.string().min(1, "Service obligatoire"),
  nom: z
    .string()
    .min(1, "Nom obligatoire")
    .max(255, "Nom trop long (255 caractères max)"),
});

type NewChecklistFormType = z.infer<typeof newChecklistFormSchema>;

type NewChecklistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = checklist système (plateforme) ; string = checklist de l'entreprise */
  proprietaireEntrepriseId: string | null;
  /** Pré-sélectionne un service si fourni */
  defaultServiceId?: string;
  /** Si fourni, limite les services affichés à ces IDs (ex: services du prestataire) */
  allowedServiceIds?: string[];
  onSuccess: () => void;
};

export function NewChecklistDialog({
  open,
  onOpenChange,
  proprietaireEntrepriseId,
  defaultServiceId,
  allowedServiceIds,
  onSuccess,
}: NewChecklistDialogProps) {
  const [services, setServices] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [loadingServices, setLoadingServices] = useState(false);

  const form = useForm<NewChecklistFormType>({
    resolver: zodResolver(newChecklistFormSchema),
    defaultValues: { serviceId: defaultServiceId ?? "", nom: "" },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;
    form.reset({ serviceId: defaultServiceId ?? "", nom: "" });
    setLoadingServices(true);
    getServicesAction()
      .then((r) => {
        if (r?.data?.services) {
          const all = r.data.services;
          setServices(
            allowedServiceIds
              ? all.filter((s) => allowedServiceIds.includes(s.id))
              : all,
          );
        }
      })
      .finally(() => setLoadingServices(false));
  }, [open, defaultServiceId, allowedServiceIds, form]);

  const onSubmit = async (data: NewChecklistFormType) => {
    const result = await insertTacheListeTemplateAction({
      nom: data.nom,
      serviceId: data.serviceId,
      proprietaireEntrepriseId,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    const serviceNom =
      services.find((s) => s.id === data.serviceId)?.nom ?? data.serviceId;
    toast.success("Checklist créée.");
    onOpenChange(false);
    onSuccess();
  };

  const isSystem = proprietaireEntrepriseId === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="text-primary h-5 w-5" />
            {isSystem ? "Nouvelle checklist système" : "Nouvelle checklist"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {loadingServices ? (
              <div className="text-muted-foreground flex h-9 items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des services...
              </div>
            ) : (
              <RhfControlledSelect<NewChecklistFormType>
                name="serviceId"
                label="Service"
                requiredMark
                placeholder="Sélectionnez un service"
                disabled={isSubmitting}
                selectClassName="w-full"
              >
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            )}

            <RhfInput<NewChecklistFormType>
              name="nom"
              label="Nom de la checklist"
              requiredMark
              placeholder="Ex : Protocole nettoyage standard"
              autoFocus
              disabled={isSubmitting}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingServices}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
