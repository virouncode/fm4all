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
import { updateEntrepriseContactAction } from "@/server/actions/entreprisesActions";
import {
  updateEntrepriseContactSchema,
  type UpdateEntrepriseContactType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  currentPrenomContact: string | null;
  currentNomContact: string | null;
  currentEmailContact: string | null;
  currentPhoneContact: string | null;
  onSuccess: () => void;
};

export function EditEntrepriseContactDialog({
  open,
  onOpenChange,
  entrepriseId,
  currentPrenomContact,
  currentNomContact,
  currentEmailContact,
  currentPhoneContact,
  onSuccess,
}: Props) {
  const form = useForm<UpdateEntrepriseContactType>({
    resolver: zodResolver(updateEntrepriseContactSchema),
    mode: "onTouched",
    defaultValues: {
      entrepriseId,
      prenomContact: currentPrenomContact ?? "",
      nomContact: currentNomContact ?? "",
      emailContact: currentEmailContact ?? "",
      phoneContact: currentPhoneContact ?? "",
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;
    form.reset({
      entrepriseId,
      prenomContact: currentPrenomContact ?? "",
      nomContact: currentNomContact ?? "",
      emailContact: currentEmailContact ?? "",
      phoneContact: currentPhoneContact ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: UpdateEntrepriseContactType) => {
    const result = await updateEntrepriseContactAction(data);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Contact mis à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Modifier le contact
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <RhfInput<UpdateEntrepriseContactType>
                name="prenomContact"
                label="Prénom"
              />
              <RhfInput<UpdateEntrepriseContactType>
                name="nomContact"
                label="Nom"
              />
            </div>
            <RhfInput<UpdateEntrepriseContactType>
              name="emailContact"
              label="Email"
              type="email"
            />
            <RhfInput<UpdateEntrepriseContactType>
              name="phoneContact"
              label="Téléphone"
              type="tel"
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
