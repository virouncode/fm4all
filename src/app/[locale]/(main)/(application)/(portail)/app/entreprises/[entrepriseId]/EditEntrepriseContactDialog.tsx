"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledContent,
  DialogStyledHeader,
  DialogStyledBody,
  DialogStyledFooter,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { RhfInput } from "@/components/rhf/RhfInput";
import {
  insertEntrepriseContactAction,
  updateEntrepriseContactAction,
} from "@/server/actions/entreprisesActions";
import {
  insertEntrepriseContactSchema,
  updateEntrepriseContactSchema,
  type InsertEntrepriseContactType,
  type UpdateEntrepriseContactType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import type { EntrepriseContactSelectType } from "@/zod-schemas/entreprise.schema";

type CreateMode = {
  mode: "create";
  entrepriseId: string;
  contact?: never;
};

type EditMode = {
  mode: "edit";
  entrepriseId?: never;
  contact: EntrepriseContactSelectType;
};

type Props = (CreateMode | EditMode) & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function EditEntrepriseContactDialog({
  open,
  onOpenChange,
  onSuccess,
  ...rest
}: Props) {
  const isCreate = rest.mode === "create";

  const insertForm = useForm<InsertEntrepriseContactType>({
    resolver: zodResolver(insertEntrepriseContactSchema),
    mode: "onTouched",
    defaultValues: {
      entrepriseId: isCreate ? rest.entrepriseId : "",
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      fonction: "",
    },
  });

  const editForm = useForm<UpdateEntrepriseContactType>({
    resolver: zodResolver(updateEntrepriseContactSchema),
    mode: "onTouched",
    defaultValues: {
      contactId: !isCreate ? rest.contact.id : "",
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      fonction: "",
    },
  });

  const insertState = useFormState({ control: insertForm.control });
  const editState = useFormState({ control: editForm.control });
  const isSubmitting = isCreate ? insertState.isSubmitting : editState.isSubmitting;
  const isDirty = isCreate ? insertState.isDirty : editState.isDirty;

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      insertForm.reset({
        entrepriseId: rest.entrepriseId,
        prenom: "",
        nom: "",
        email: "",
        phone: "",
        fonction: "",
      });
    } else {
      editForm.reset({
        contactId: rest.contact.id,
        prenom: rest.contact.prenom,
        nom: rest.contact.nom,
        email: rest.contact.email ?? "",
        phone: rest.contact.phone ?? "",
        fonction: rest.contact.fonction ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmitCreate = async (data: InsertEntrepriseContactType) => {
    const result = await insertEntrepriseContactAction(data);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    toast.success("Contact créé");
    onOpenChange(false);
    onSuccess();
  };

  const onSubmitEdit = async (data: UpdateEntrepriseContactType) => {
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
      <DialogStyledContent className="max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary h-5 w-5" />
              {isCreate ? "Ajouter un contact" : "Modifier le contact"}
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        {isCreate ? (
          <Form {...insertForm}>
            <form
              onSubmit={insertForm.handleSubmit(onSubmitCreate)}
            >
              <DialogStyledBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <RhfInput<InsertEntrepriseContactType>
                      name="prenom"
                      label="Prénom"
                      requiredMark
                    />
                    <RhfInput<InsertEntrepriseContactType>
                      name="nom"
                      label="Nom"
                      requiredMark
                    />
                  </div>
                  <RhfInput<InsertEntrepriseContactType>
                    name="email"
                    label="Email"
                    type="email"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <RhfInput<InsertEntrepriseContactType>
                      name="phone"
                      label="Téléphone"
                      type="tel"
                    />
                    <RhfInput<InsertEntrepriseContactType>
                      name="fonction"
                      label="Fonction"
                    />
                  </div>
                </div>
              </DialogStyledBody>
              <DialogStyledFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Créer
                </Button>
              </DialogStyledFooter>
            </form>
          </Form>
        ) : (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onSubmitEdit)}
            >
              <DialogStyledBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <RhfInput<UpdateEntrepriseContactType>
                      name="prenom"
                      label="Prénom"
                      requiredMark
                    />
                    <RhfInput<UpdateEntrepriseContactType>
                      name="nom"
                      label="Nom"
                      requiredMark
                    />
                  </div>
                  <RhfInput<UpdateEntrepriseContactType>
                    name="email"
                    label="Email"
                    type="email"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <RhfInput<UpdateEntrepriseContactType>
                      name="phone"
                      label="Téléphone"
                      type="tel"
                    />
                    <RhfInput<UpdateEntrepriseContactType>
                      name="fonction"
                      label="Fonction"
                    />
                  </div>
                </div>
              </DialogStyledBody>
              <DialogStyledFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogStyledFooter>
            </form>
          </Form>
        )}
      </DialogStyledContent>
    </Dialog>
  );
}
