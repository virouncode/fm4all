"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { insertTicketMessageAction } from "@/server/actions/ticketsActions";
import { type TicketMessageVisibiliteType } from "@/zod-schemas/enums";
import {
  insertTicketMessageFormSchema,
  type InsertTicketMessageFormType,
} from "@/zod-schemas/ticket.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Paperclip, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type MessageAttachment = {
  id: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

type Message = {
  id: string;
  ticketId: string;
  auteurUserId: string | null;
  message: string;
  visibilite: TicketMessageVisibiliteType;
  createdAt: Date;
  auteurPrenom: string | null;
  auteurNom: string | null;
  attachments: MessageAttachment[];
};

type TicketMessagesSectionProps = {
  ticketId: string;
  entrepriseId: string;
  proprietaireEntrepriseId: string;
  currentUserId: string;
  initialMessages: Message[];
  posture: "client" | "prestataire" | "plateforme";
};

/**
 * Composant pour afficher une pièce jointe avec thumbnail si c'est une image
 */
function AttachmentThumbnail({
  attachment,
  proprietaireEntrepriseId,
  isCurrentUser,
  onClick,
}: {
  attachment: MessageAttachment;
  proprietaireEntrepriseId: string;
  isCurrentUser: boolean;
  onClick: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isImage = attachment.mimeType.startsWith("image/");

  useEffect(() => {
    if (!isImage) {
      setIsLoading(false);
      return;
    }

    // Charger l'URL presignée pour les images
    async function loadImageUrl() {
      try {
        const result = await getPresignedReadUrlAction({
          proprietaireEntrepriseId,
          key: attachment.storageKey,
        });

        if (result?.data?.url) {
          setImageUrl(result.data.url);
        }
      } catch {
        // thumbnail load failure is non-critical
      } finally {
        setIsLoading(false);
      }
    }

    loadImageUrl();
  }, [attachment.storageKey, proprietaireEntrepriseId, isImage]);

  // Pour les images
  if (isImage) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded border-2 transition-opacity hover:opacity-80",
          isCurrentUser ? "border-primary-foreground/20" : "border-border",
        )}
      >
        {isLoading ? (
          <div className="bg-muted flex h-32 w-32 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={attachment.filename}
            width={128}
            height={128}
            className="h-32 w-32 object-cover"
            sizes="128px"
          />
        ) : (
          <div className="bg-muted flex h-32 w-32 items-center justify-center">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
        )}
      </button>
    );
  }

  // Pour les autres fichiers (PDF, etc.)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm hover:underline",
        isCurrentUser ? "text-primary-foreground/90" : "text-foreground",
      )}
    >
      <FileText className="h-4 w-4" />
      <span className="truncate">{attachment.filename}</span>
    </button>
  );
}

export function TicketMessagesSection({
  ticketId,
  entrepriseId,
  proprietaireEntrepriseId,
  currentUserId,
  initialMessages,
  posture,
}: TicketMessagesSectionProps) {
  const router = useRouter();

  // Les messages sont déjà filtrés côté serveur selon la posture (getTicketMessagesWithAttachments)
  const messages = initialMessages;
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    filename: string;
    mimeType: string;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const form = useForm<InsertTicketMessageFormType>({
    resolver: zodResolver(insertTicketMessageFormSchema),
    mode: "onTouched",
    defaultValues: {
      message: "",
      visibilite: "public",
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Vérifier si un attachement est en cours d'upload
  const attachments = form.watch("attachments");
  const hasPendingAttachment = attachments?.some(
    (att) => !att || !att.storageKey,
  );

  const handleAddAttachment = () => {
    append({
      storageKey: "",
      filename: "",
      mimeType: "",
      sizeBytes: 0,
    });
  };

  const handlePreviewAttachment = async (attachment: MessageAttachment) => {
    setLoadingPreview(true);

    try {
      const result = await getPresignedReadUrlAction({
        proprietaireEntrepriseId,
        key: attachment.storageKey,
      });

      if (result?.data?.url) {
        setPreviewAttachment({
          url: result.data.url,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
        });
      } else {
        toast.error("Impossible de charger la pièce jointe");
      }
    } catch {
      toast.error("Erreur lors du chargement de la pièce jointe");
    } finally {
      setLoadingPreview(false);
    }
  };

  const onSubmit = async (data: InsertTicketMessageFormType) => {
    const result = await insertTicketMessageAction({
      ticketId,
      entrepriseId,
      message: data.message,
      visibilite: data.visibilite,
      attachments: data.attachments,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.message) {
      toast.success("Message envoyé");

      // Reset form
      form.reset({
        message: "",
        visibilite: "public",
        attachments: [],
      });

      // Recharger les données serveur pour afficher le message avec les infos auteur
      router.refresh();
    }
  };

  const renderMessage = (msg: Message) => {
    const isCurrentUser = msg.auteurUserId === currentUserId;
    const auteurNom =
      msg.auteurPrenom && msg.auteurNom
        ? `${msg.auteurPrenom} ${msg.auteurNom}`
        : "Utilisateur";

    return (
      <div
        key={msg.id}
        className={cn(
          "mb-4 flex flex-col",
          isCurrentUser ? "items-end" : "items-start",
        )}
      >
        {/* Nom auteur + date */}
        <div className="text-muted-foreground mb-1 px-2 text-xs">
          <span className="font-medium">{auteurNom}</span>
          {" · "}
          <span>
            {format(new Date(msg.createdAt), "d MMM yyyy 'à' HH:mm", {
              locale: fr,
            })}
          </span>
          {msg.visibilite !== "public" && (
            <span className="ml-2 font-medium text-orange-500">
              {msg.visibilite === "fm4all_only" && "(fm4all uniquement)"}
              {msg.visibilite === "client_only" && "(Client)"}
              {msg.visibilite === "prestataire_only" && "(Prestataire)"}
            </span>
          )}
        </div>

        {/* Bulle message */}
        <div
          className={cn(
            "max-w-[70%] rounded-lg px-4 py-2",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted border border-border",
          )}
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {msg.message}
          </p>

          {/* Pièces jointes */}
          {msg.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {msg.attachments.map((att) => (
                <AttachmentThumbnail
                  key={att.id}
                  attachment={att}
                  proprietaireEntrepriseId={proprietaireEntrepriseId}
                  isCurrentUser={isCurrentUser}
                  onClick={() => handlePreviewAttachment(att)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Messages */}
      <div className="max-h-[500px] space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm italic">
            Aucun message pour le moment
          </p>
        ) : (
          messages.map((msg) => renderMessage(msg))
        )}
      </div>

      {/* Formulaire nouveau message */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Message */}
          <RhfTextArea<InsertTicketMessageFormType>
            name="message"
            label="Votre message"
            placeholder="Écrire un message..."
            rows={3}
            requiredMark
          />

          {/* Visibilité */}
          <RhfControlledSelect<InsertTicketMessageFormType>
            name="visibilite"
            label="Visibilité"
            requiredMark
          >
            <SelectItem value="public">Public (tous)</SelectItem>
            {posture === "plateforme" && (
              <>
                <SelectItem value="fm4all_only">fm4all uniquement</SelectItem>
                <SelectItem value="client_only">Client + fm4all</SelectItem>
                <SelectItem value="prestataire_only">
                  Prestataire + fm4all
                </SelectItem>
              </>
            )}
            {posture === "client" && (
              <SelectItem value="client_only">Client + fm4all</SelectItem>
            )}
            {posture === "prestataire" && (
              <SelectItem value="prestataire_only">
                Prestataire + fm4all
              </SelectItem>
            )}
          </RhfControlledSelect>

          {/* Pièces jointes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Pièces jointes (optionnel)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                disabled={hasPendingAttachment}
              >
                <Paperclip className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <RhfFileInput<InsertTicketMessageFormType>
                    key={field.id}
                    name={`attachments.${index}` as const}
                    proprietaireEntrepriseId={proprietaireEntrepriseId}
                    categorie="ticket_message_piece_jointe"
                    onClear={() => remove(index)}
                    deleteOnClear
                    maxSizeBytes={2 * 1024 * 1024} // 2MB
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty || hasPendingAttachment}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewAttachment}
        onOpenChange={(open) => {
          if (!open) setPreviewAttachment(null);
        }}
      >
        <DialogContent className="flex !h-[95vh] !w-[90vw] !max-w-none flex-col p-0">
          {previewAttachment && (
            <>
              <DialogHeader className="flex-shrink-0 p-6 pb-3">
                <DialogTitle className="truncate pr-12">
                  {previewAttachment.filename}
                </DialogTitle>
              </DialogHeader>

              <div className="min-h-0 flex-1 px-6 pb-6">
                {loadingPreview ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2" />
                  </div>
                ) : (
                  <>
                    {previewAttachment.mimeType.startsWith("image/") ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={previewAttachment.url}
                          alt={previewAttachment.filename}
                          fill
                          className="object-contain"
                          sizes="1280px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Aperçu non disponible pour ce type de fichier
                          </p>
                          <a
                            href={previewAttachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Télécharger le fichier
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
