"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  deleteDevisDemandeAction,
  deleteDevisDemandeAttachmentAction,
  getDevisDemandeAttachmentsAction,
  updateDevisDemandeStatutAction,
} from "@/server/actions/devisDemandesActions";
import type {
  DevisDemandeAttachmentItemType,
  DevisDemandeAvecDetails,
} from "@/server/queries/devisDemandes.query";
import type { DevisDemandePermissionsType } from "@/server/utils/devisDemandesPermissions.utils";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { useAppStore } from "@/stores/application/appStore";
import type { DevisDemandeStatutType } from "@/zod-schemas/enums";
import { Download, FileText, Paperclip, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDevisDate, getDevisDemandeStatutBadge } from "./helpers";

type DevisDemandeDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demande: DevisDemandeAvecDetails;
  permissions: DevisDemandePermissionsType;
  onEdit: () => void;
  onDeleted: (id: string) => void;
  onStatutChanged: (updated: DevisDemandeAvecDetails) => void;
};

const STATUT_TRANSITIONS: Record<DevisDemandeStatutType, DevisDemandeStatutType[]> = {
  ouverte: ["en_cours", "annulee", "archivee"],
  en_cours: ["cloturee", "annulee", "archivee"],
  annulee: ["archivee"],
  cloturee: [],
  archivee: [],
};

const STATUT_TRANSITION_LABELS: Record<DevisDemandeStatutType, string> = {
  ouverte: "Ré-ouvrir",
  en_cours: "Marquer en cours",
  cloturee: "Clôturer",
  annulee: "Annuler",
  archivee: "Archiver",
};

export function DevisDemandeDetailDialog({
  open,
  onOpenChange,
  demande,
  permissions,
  onEdit,
  onDeleted,
  onStatutChanged,
}: DevisDemandeDetailDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatut, setIsUpdatingStatut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState<DevisDemandeAttachmentItemType[]>([]);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAttachments([]);
      return;
    }
    void (async () => {
      try {
        const result = await getDevisDemandeAttachmentsAction({
          devisDemandeId: demande.id,
        });
        if (result?.data) setAttachments(result.data);
      } catch {
        // Silently ignore
      }
    })();
  }, [open, demande.id]);

  const badge = getDevisDemandeStatutBadge(demande.statut);
  const availableTransitions = STATUT_TRANSITIONS[demande.statut] ?? [];

  const handleStatutChange = async (newStatut: DevisDemandeStatutType) => {
    if (!entreprise?.id) return;
    setIsUpdatingStatut(true);
    try {
      const result = await updateDevisDemandeStatutAction({
        id: demande.id,
        entrepriseId: entreprise.id,
        statut: newStatut,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande) {
        toast.success("Statut mis à jour");
        onStatutChanged({ ...demande, statut: result.data.demande.statut });
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdatingStatut(false);
    }
  };

  const handleDelete = async () => {
    if (!entreprise?.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteDevisDemandeAction({
        id: demande.id,
        entrepriseId: entreprise.id,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      toast.success("Demande supprimée");
      onDeleted(demande.id);
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteAttachment = async (documentId: string) => {
    if (!entreprise?.id) return;
    setDeletingAttachmentId(documentId);
    try {
      const result = await deleteDevisDemandeAttachmentAction({
        documentId,
        devisDemandeId: demande.id,
        entrepriseId: entreprise.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      setAttachments((prev) => prev.filter((a) => a.documentId !== documentId));
      toast.success("Pièce jointe supprimée");
    } catch {
      toast.error("Erreur lors de la suppression de la pièce jointe");
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleOpenAttachment = async (attachment: DevisDemandeAttachmentItemType) => {
    if (!entreprise?.id) return;
    try {
      const result = await getPresignedReadUrlAction({
        key: attachment.storageKey,
        proprietaireEntrepriseId: entreprise.id,
      });
      if (result?.data?.url) {
        window.open(result.data.url, "_blank");
      }
    } catch {
      toast.error("Erreur lors de l'ouverture du fichier");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogStyledContent className="flex max-h-[90vh] max-w-2xl flex-col">
          <DialogStyledHeader>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2">
                  <FileText className="text-primary" />
                  Demande de devis
                </div>
              </DialogTitle>
            </DialogHeader>
          </DialogStyledHeader>

          <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-5">
            {/* Statut + infos principales */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{demande.titre}</h3>
                <div className="text-muted-foreground flex gap-3 text-sm">
                  <span>{demande.siteNom}</span>
                  <span>•</span>
                  <span>{demande.serviceNom}</span>
                </div>
              </div>
              <Badge className={`shrink-0 text-xs ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>

            {/* Description */}
            {demande.description && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Description</p>
                <p className="text-muted-foreground text-sm whitespace-pre-line">
                  {demande.description}
                </p>
              </div>
            )}

            {/* Devis reçus */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Devis reçus</p>
              <p className="text-muted-foreground text-sm">
                {demande.devisCount > 0
                  ? `${demande.devisCount} devis lié(s)`
                  : "Aucun devis reçu pour l'instant"}
              </p>
            </div>

            {/* Pièces jointes */}
            {attachments.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  Pièces jointes
                </p>
                <div className="space-y-1">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.documentId}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground truncate flex-1">
                        {attachment.filename}
                      </span>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => void handleOpenAttachment(attachment)}
                          title="Ouvrir"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {permissions.canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-7 w-7"
                            disabled={deletingAttachmentId === attachment.documentId}
                            onClick={() => void handleDeleteAttachment(attachment.documentId)}
                            title="Supprimer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Créé le</p>
                <p className="text-muted-foreground">
                  {formatDevisDate(demande.createdAt)}
                </p>
              </div>
              <div>
                <p className="font-medium">Modifié le</p>
                <p className="text-muted-foreground">
                  {formatDevisDate(demande.updatedAt)}
                </p>
              </div>
              {(demande.createdByPrenom || demande.createdByNom) && (
                <div>
                  <p className="font-medium">Créé par</p>
                  <p className="text-muted-foreground">
                    {[demande.createdByPrenom, demande.createdByNom]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
              )}
            </div>

            {/* Transitions de statut */}
            {permissions.canChangeStatut && availableTransitions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map((statut) => (
                    <Button
                      key={statut}
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatut}
                      onClick={() => handleStatutChange(statut)}
                    >
                      {STATUT_TRANSITION_LABELS[statut]}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </DialogStyledBody>

          {/* Footer actions */}
          {(permissions.canEdit || permissions.canDelete) && (
            <DialogStyledFooter>
              {permissions.canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Supprimer
                </Button>
              )}
              {permissions.canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit();
                  }}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </DialogStyledFooter>
          )}
        </DialogStyledContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 max-w-md">
          <div className="bg-primary/8 border-b px-5 pb-4 pt-5 pr-12">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la demande ?</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="px-5 py-4 text-sm">
            Cette action est irréversible. La demande &quot;{demande.titre}&quot; sera
            définitivement supprimée.
          </div>
          <AlertDialogFooter className="bg-muted/30 border-t px-5 py-3 sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
