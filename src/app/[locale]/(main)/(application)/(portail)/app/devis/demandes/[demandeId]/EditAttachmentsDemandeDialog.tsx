"use client";

import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  deleteDevisDemandeAttachmentAction,
  updateDevisDemandeAction,
} from "@/server/actions/devisDemandesActions";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import type { DevisDemandeAttachmentItemType } from "@/server/queries/devisDemandes.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editAttachmentsFormSchema = z.object({
  attachments: z.array(
    z.object({
      documentId: z.string().optional(), // présent pour les existants
      storageKey: z.string(),
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      previewUrl: z.string().optional(),
    }),
  ),
});

type EditAttachmentsFormType = z.infer<typeof editAttachmentsFormSchema>;

type EditAttachmentsDemandeDialogProps = {
  demandeId: string;
  entrepriseId: string;
  proprietaireEntrepriseId: string;
  currentAttachments: DevisDemandeAttachmentItemType[];
  onUpdate: () => void;
};

export function EditAttachmentsDemandeDialog({
  demandeId,
  entrepriseId,
  proprietaireEntrepriseId,
  currentAttachments,
  onUpdate,
}: EditAttachmentsDemandeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);

  const form = useForm<EditAttachmentsFormType>({
    resolver: zodResolver(editAttachmentsFormSchema),
    mode: "onTouched",
    defaultValues: {
      attachments: currentAttachments.map((a) => ({
        documentId: a.documentId,
        storageKey: a.storageKey,
        filename: a.filename,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Vérifier si un attachement est en cours d'upload (pas encore de storageKey)
  const attachments = form.watch("attachments");
  const hasPendingAttachment = attachments?.some(
    (att) => !att || !att.storageKey,
  );

  // Charger les URLs présignées quand le dialog s'ouvre
  useEffect(() => {
    async function loadAttachmentUrls() {
      if (!open || currentAttachments.length === 0) {
        return;
      }

      setLoadingUrls(true);

      const attachmentsWithUrls = await Promise.all(
        currentAttachments.map(async (attachment) => {
          try {
            const result = await getPresignedReadUrlAction({
              proprietaireEntrepriseId,
              key: attachment.storageKey,
            });

            return {
              documentId: attachment.documentId,
              storageKey: attachment.storageKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              previewUrl: result?.data?.url || "",
            };
          } catch {
            return {
              documentId: attachment.documentId,
              storageKey: attachment.storageKey,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              previewUrl: "",
            };
          }
        }),
      );

      // Reset le form avec les URLs fraîches
      form.reset({
        attachments: attachmentsWithUrls,
      });

      setLoadingUrls(false);
    }

    loadAttachmentUrls();
  }, [open, currentAttachments, proprietaireEntrepriseId, form]);

  const handleAddAttachment = () => {
    append({
      storageKey: "",
      filename: "",
      mimeType: "",
      sizeBytes: 0,
      previewUrl: "",
    });
  };

  const onSubmit = async (data: EditAttachmentsFormType) => {
    const initialDocumentIds = new Set(
      currentAttachments.map((a) => a.documentId),
    );
    const finalDocumentIds = new Set(
      data.attachments
        .filter((a) => a.documentId)
        .map((a) => a.documentId as string),
    );

    // Supprimer les existants qui ont été retirés du formulaire
    const toDelete = currentAttachments.filter(
      (a) => !finalDocumentIds.has(a.documentId),
    );

    for (const att of toDelete) {
      const result = await deleteDevisDemandeAttachmentAction({
        documentId: att.documentId,
        devisDemandeId: demandeId,
        entrepriseId,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
    }

    // Ajouter les nouveaux (sans documentId = pas encore en base)
    const toAdd = data.attachments.filter(
      (a) => !a.documentId && a.storageKey,
    );

    if (toAdd.length > 0) {
      const result = await updateDevisDemandeAction({
        id: demandeId,
        entrepriseId,
        attachments: toAdd,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
    }

    const hasDeletedSomething = toDelete.length > 0;
    const hasAddedSomething = toAdd.length > 0;

    // Vérifier si on a touché aux existants sans les supprimer (juste vérification de cohérence)
    const hasExistingChanged =
      initialDocumentIds.size !== finalDocumentIds.size ||
      [...initialDocumentIds].some((id) => !finalDocumentIds.has(id));

    if (hasDeletedSomething || hasAddedSomething || hasExistingChanged) {
      toast.success("Pièces jointes mises à jour");
      onUpdate();
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-2">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Paperclip className="text-primary h-4 w-4" />
              Modifier les pièces jointes
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Contenu scrollable */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Pièces jointes (max 10 Mo)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAttachment}
                    disabled={hasPendingAttachment || loadingUrls}
                  >
                    Ajouter
                  </Button>
                </div>

                {loadingUrls ? (
                  <p className="text-muted-foreground text-sm">
                    Chargement des pièces jointes...
                  </p>
                ) : fields.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    Aucune pièce jointe
                  </p>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <RhfFileInput<EditAttachmentsFormType>
                        key={field.id}
                        name={`attachments.${index}` as const}
                        proprietaireEntrepriseId={proprietaireEntrepriseId}
                        categorie="devis_demande"
                        onClear={() => remove(index)}
                        deleteOnClear
                        maxSizeBytes={10 * 1024 * 1024}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer sticky */}
            <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 justify-end gap-2 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty || loadingUrls}
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
