"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { RhfFileInput, type AttachmentFormType } from "@/components/rhf/RhfFileInput";
import { updateEntrepriseLogoAction } from "@/server/actions/entreprisesActions";
import {
  updateEntrepriseLogoSchema,
  type UpdateEntrepriseLogoType,
} from "@/zod-schemas/entreprise.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  currentLogoStorageKey: string | null;
  currentLogoUrl: string | null;
  onSuccess: () => void;
};

export function EditEntrepriseLogoDialog({
  open,
  onOpenChange,
  entrepriseId,
  currentLogoStorageKey,
  currentLogoUrl,
  onSuccess,
}: Props) {
  const currentLogoValue: AttachmentFormType | undefined =
    currentLogoStorageKey
      ? {
          storageKey: currentLogoStorageKey,
          filename: "logo_actuel",
          mimeType: "image/jpeg",
          sizeBytes: 0,
          previewUrl: currentLogoUrl ?? undefined,
        }
      : undefined;

  const form = useForm<UpdateEntrepriseLogoType>({
    resolver: zodResolver(updateEntrepriseLogoSchema),
    mode: "onTouched",
    defaultValues: {
      entrepriseId,
      logo: currentLogoValue,
    },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        entrepriseId,
        logo: currentLogoValue,
      });
    }
    // currentLogoValue is rebuilt on each render — deps are the stable primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entrepriseId, currentLogoStorageKey, currentLogoUrl]);

  const onSubmit = async (data: UpdateEntrepriseLogoType) => {
    const result = await updateEntrepriseLogoAction(data);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Logo mis à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Modifier le logo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RhfFileInput<UpdateEntrepriseLogoType>
              name="logo"
              label="Logo de l'entreprise"
              proprietaireEntrepriseId={entrepriseId}
              categorie="logo"
              accept="image/jpeg,image/png,image/webp"
              maxSizeBytes={2 * 1024 * 1024}
              description="JPG, PNG ou WebP · max 2 Mo"
              deleteOnClear={false}
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
