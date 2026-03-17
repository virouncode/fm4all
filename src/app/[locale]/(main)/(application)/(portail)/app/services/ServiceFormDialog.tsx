"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
  insertServiceAction,
  updateServiceAction,
} from "@/server/actions/servicesActions";
import {
  insertServiceFormSchema,
  updateServiceFormSchema,
  type InsertServiceFormType,
  type ServiceWithStatsType,
  type UpdateServiceFormType,
} from "@/zod-schemas/service.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type CreateProps = {
  mode: "create";
  service?: undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (service: ServiceWithStatsType) => void;
};

type EditProps = {
  mode: "edit";
  service: ServiceWithStatsType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (service: ServiceWithStatsType) => void;
};

type Props = CreateProps | EditProps;

export function ServiceFormDialog({
  mode,
  service,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const form = useForm<InsertServiceFormType | UpdateServiceFormType>({
    resolver: zodResolver(
      isEdit ? updateServiceFormSchema : insertServiceFormSchema,
    ),
    mode: "onTouched",
    defaultValues: isEdit
      ? {
          id: service.id,
          nom: service.nom,
          description: service.description ?? "",
        }
      : {
          nom: "",
          description: "",
        },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      form.reset({
        id: service.id,
        nom: service.nom,
        description: service.description ?? "",
      });
    } else {
      form.reset({ nom: "", description: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (
    data: InsertServiceFormType | UpdateServiceFormType,
  ) => {
    if (isEdit) {
      const result = await updateServiceAction(data as UpdateServiceFormType);

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.service) {
        toast.success("Service mis à jour");
        onOpenChange(false);
        onSuccess({
          ...service,
          nom: result.data.service.nom,
          description: result.data.service.description,
          updatedAt: result.data.service.updatedAt,
        });
      }
    } else {
      const result = await insertServiceAction(data as InsertServiceFormType);

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.service) {
        toast.success("Service créé");
        onOpenChange(false);
        onSuccess({
          id: result.data.service.id,
          nom: result.data.service.nom,
          description: result.data.service.description,
          createdAt: result.data.service.createdAt,
          updatedAt: result.data.service.updatedAt,
          nbClients: 0,
          nbPrestataires: 0,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary size-5" />
              {isEdit ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogStyledBody>
              <div className="space-y-4">
                <RhfInput<InsertServiceFormType | UpdateServiceFormType>
                  name="nom"
                  label="Nom du service"
                  requiredMark
                  placeholder="Ex : Nettoyage & propreté"
                />

                <RhfTextArea<InsertServiceFormType | UpdateServiceFormType>
                  name="description"
                  label="Description"
                  placeholder="Description du service proposé..."
                  rows={4}
                />
              </div>
            </DialogStyledBody>

            <DialogStyledFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <Spinner className="size-3" />
                ) : (
                  <ClipboardList className="size-3" />
                )}
                {isEdit ? "Enregistrer" : "Créer"}
              </Button>
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
