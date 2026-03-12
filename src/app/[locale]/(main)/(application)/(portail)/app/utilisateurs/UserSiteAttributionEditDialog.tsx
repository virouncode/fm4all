"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
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
import {
  bulkInsertMixedAttributionsAction,
  updateUserSiteAttributionAction,
} from "@/server/actions/userSiteAttributionsActions";
import { useAppStore } from "@/stores/application/appStore";
import type { SelectUserSiteAttributionWithInheritanceType } from "@/zod-schemas/userSiteAttribution.schema";
import {
  updateUserSiteAttributionFormSchema,
  type UpdateUserSiteAttributionFormType,
} from "@/zod-schemas/userSiteAttribution.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import {
  getAvailableRolesByPostureAndLevel,
  roleLabels,
  scopeLabels,
} from "./helpers";

type UserSiteAttributionEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribution: SelectUserSiteAttributionWithInheritanceType;
  userId: string;
  entrepriseId: string;
  onSuccess: () => void;
};

export function UserSiteAttributionEditDialog({
  open,
  onOpenChange,
  attribution,
  userId,
  entrepriseId,
  onSuccess,
}: UserSiteAttributionEditDialogProps) {
  // Récupérer la posture active et le rôle de l'utilisateur actuel
  const posture = useAppStore((state) => state.postureActive);
  const currentUserRole = useAppStore((state) => state.roleClientAdhesion);

  // Filtrer les rôles disponibles selon la posture ET le niveau de l'utilisateur
  const availableRoles = getAvailableRolesByPostureAndLevel(
    posture,
    currentUserRole,
  );
  const roleOptions = availableRoles.map((role) => ({
    value: role,
    label: roleLabels[role],
  }));

  const form = useForm<
    Omit<UpdateUserSiteAttributionFormType, "id" | "userId" | "entrepriseId">
  >({
    resolver: zodResolver(
      updateUserSiteAttributionFormSchema.omit({
        id: true,
        userId: true,
        entrepriseId: true,
      }),
    ),
    mode: "onTouched",
    defaultValues: {
      mode: attribution.mode,
      role: attribution.role,
      scope: attribution.scope,
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Reset form when dialog opens with new attribution
  useEffect(() => {
    if (open) {
      form.reset({
        mode: attribution.mode,
        role: attribution.role,
        scope: attribution.scope,
      });
    }
  }, [open, attribution, form]);

  const onSubmit = async (
    data: Omit<
      UpdateUserSiteAttributionFormType,
      "id" | "userId" | "entrepriseId"
    >,
  ) => {
    // Si attribution héritée, créer un override au lieu d'UPDATE
    if (attribution.isInherited) {
      const result = await bulkInsertMixedAttributionsAction({
        userId,
        entrepriseId,
        attributions: [
          {
            siteId: attribution.siteId,
            mode: "inclure",
            scope: data.scope,
            role: data.role,
          },
        ],
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data) {
        toast.success("Override créé avec succès");
        onSuccess();
        onOpenChange(false);
      }
      return;
    }

    // Attribution directe: UPDATE classique
    const result = await updateUserSiteAttributionAction({
      id: attribution.id,
      userId,
      entrepriseId,
      mode: data.mode,
      role: data.role,
      scope: data.scope,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      // attribution null = ligne supprimée car rôle identique au parent subtree
      const message = result.data.attribution
        ? "Attribution mise à jour avec succès"
        : "Rôle rétabli — exception supprimée";
      toast.success(message);
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {attribution.isInherited
              ? "Créer un override"
              : "Modifier l'attribution"}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm font-medium">Site : {attribution.site.nom}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RhfControlledSelect
              name="role"
              label="Rôle"
              requiredMark
              selectClassName="w-full"
            >
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            <RhfControlledSelect
              name="scope"
              label="Périmètre"
              requiredMark
              selectClassName="w-full"
            >
              <SelectItem value="self">{scopeLabels.self}</SelectItem>
              <SelectItem value="subtree">{scopeLabels.subtree}</SelectItem>
            </RhfControlledSelect>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
