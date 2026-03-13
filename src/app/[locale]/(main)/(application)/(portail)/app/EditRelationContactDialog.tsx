"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RhfCheckbox } from "@/components/rhf/RhfCheckbox";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Spinner } from "@/components/ui/spinner";
import { updateRelationContactAction } from "@/server/actions/entreprisesActions";
import type { UpdateRelationContactType } from "@/zod-schemas/entreprise.schema";
import { updateRelationContactSchema } from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type EditRelationContactDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  linkId: string;
  contactNom: string;
  currentRole: string | null;
  currentEstPrincipal: boolean;
  onSuccess: () => void;
};

export function EditRelationContactDialog({
  open,
  onOpenChange,
  linkId,
  contactNom,
  currentRole,
  currentEstPrincipal,
  onSuccess,
}: EditRelationContactDialogProps) {
  const form = useForm<UpdateRelationContactType>({
    resolver: zodResolver(updateRelationContactSchema),
    mode: "onTouched",
    defaultValues: {
      linkId,
      role: currentRole ?? "",
      estPrincipal: currentEstPrincipal,
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        linkId,
        role: currentRole ?? "",
        estPrincipal: currentEstPrincipal,
      });
    }
  }, [open, linkId, currentRole, currentEstPrincipal]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: UpdateRelationContactType) => {
    const result = await updateRelationContactAction(data);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    toast.success("Contact mis à jour.");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="text-primary h-5 w-5" />
            Modifier le contact
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{contactNom}</span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RhfInput<UpdateRelationContactType>
              name="role"
              label="Rôle dans la relation"
              placeholder="ex: Responsable compte"
            />

            <RhfCheckbox<UpdateRelationContactType>
              name="estPrincipal"
              label="Interlocuteur principal"
              orientation="horizontal"
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
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Spinner />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
