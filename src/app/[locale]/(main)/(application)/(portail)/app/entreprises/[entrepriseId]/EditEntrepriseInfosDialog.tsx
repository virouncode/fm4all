"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RhfInput } from "@/components/rhf/RhfInput";
import { updateEntrepriseInfosAction } from "@/server/actions/entreprisesActions";
import {
  updateEntrepriseInfosSchema,
  type UpdateEntrepriseInfosType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  currentNom: string;
  currentSiret: string;
  onSuccess: () => void;
};

export function EditEntrepriseInfosDialog({
  open,
  onOpenChange,
  entrepriseId,
  currentNom,
  currentSiret,
  onSuccess,
}: Props) {
  const form = useForm<UpdateEntrepriseInfosType>({
    resolver: zodResolver(updateEntrepriseInfosSchema),
    mode: "onTouched",
    defaultValues: {
      entrepriseId,
      nom: currentNom,
      siret: currentSiret,
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;
    form.reset({ entrepriseId, nom: currentNom, siret: currentSiret });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: UpdateEntrepriseInfosType) => {
    const result = await updateEntrepriseInfosAction(data);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Informations mises à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Modifier les informations
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RhfInput<UpdateEntrepriseInfosType>
              name="nom"
              label="Nom de l'entreprise"
              requiredMark
            />
            <RhfInput<UpdateEntrepriseInfosType>
              name="siret"
              label="SIRET"
              requiredMark
              placeholder="123 456 789 00000"
            />

            <div className="flex justify-end gap-2 pt-2">
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
