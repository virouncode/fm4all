"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteDevisDemandeAction } from "@/server/actions/devisDemandesActions";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import type {
  DevisDemandeAttachmentItemType,
  DevisDemandeAvecDetails,
} from "@/server/queries/devisDemandes.query";
import type { DevisDemandePermissionsType } from "@/server/utils/devisDemandesPermissions.utils";
import type { DevisDemandeStatutType } from "@/zod-schemas/enums";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  File,
  FileText,
  Info,
  Paperclip,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDevisDate, getDevisDemandeStatutBadge } from "../../helpers";
import { EditAttachmentsDemandeDialog } from "./EditAttachmentsDemandeDialog";
import { EditDescriptionDemandeDialog } from "./EditDescriptionDemandeDialog";
import { EditableStatutDemandeSelect } from "./EditableStatutDemandeSelect";
import { EditableTitreDemande } from "./EditableTitreDemande";

const STATUT_TRANSITIONS: Record<DevisDemandeStatutType, DevisDemandeStatutType[]> = {
  ouverte: ["en_cours", "annulee", "archivee"],
  en_cours: ["cloturee", "annulee", "archivee"],
  annulee: ["archivee"],
  cloturee: [],
  archivee: [],
};

type DevisDemandeDetailClientProps = {
  demande: DevisDemandeAvecDetails;
  entrepriseId: string;
  permissions: DevisDemandePermissionsType;
  attachments: DevisDemandeAttachmentItemType[];
  posture: "client" | "prestataire" | "plateforme";
  backTab?: "demandes" | "propositions";
};

export function DevisDemandeDetailClient({
  demande,
  entrepriseId,
  permissions,
  attachments,
  posture,
  backTab,
}: DevisDemandeDetailClientProps) {
  const router = useRouter();

  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(attachments.length > 0);
  const [selectedAttachment, setSelectedAttachment] =
    useState<DevisDemandeAttachmentItemType | null>(null);
  const [loadingDialogUrl, setLoadingDialogUrl] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentStatut = demande.statut;
  const availableStatuts: DevisDemandeStatutType[] = [
    currentStatut,
    ...(STATUT_TRANSITIONS[currentStatut] ?? []),
  ];

  const backHref = backTab
    ? { pathname: "/app/devis" as const, query: { tab: backTab } }
    : { pathname: "/app/devis" as const };

  const handleUpdate = () => {
    router.refresh();
  };

  // Load presigned URLs at mount
  useEffect(() => {
    async function loadUrls() {
      if (attachments.length === 0) {
        setLoadingUrls(false);
        return;
      }

      const urls: Record<string, string> = {};
      await Promise.all(
        attachments.map(async (att) => {
          try {
            const result = await getPresignedReadUrlAction({
              key: att.storageKey,
              proprietaireEntrepriseId: demande.demandeurEntrepriseId,
            });
            if (result?.data?.url) {
              urls[att.documentId] = result.data.url;
            }
          } catch {
            // ignore
          }
        }),
      );
      setAttachmentUrls(urls);
      setLoadingUrls(false);
    }

    loadUrls();
  }, [attachments, demande.demandeurEntrepriseId]);

  // Refresh URL when preview dialog opens
  useEffect(() => {
    async function refreshUrl() {
      if (!selectedAttachment) return;
      setLoadingDialogUrl(true);
      try {
        const result = await getPresignedReadUrlAction({
          key: selectedAttachment.storageKey,
          proprietaireEntrepriseId: demande.demandeurEntrepriseId,
        });
        if (result?.data?.url) {
          setAttachmentUrls((prev) => ({
            ...prev,
            [selectedAttachment.documentId]: result.data!.url,
          }));
        }
      } catch {
        // ignore
      } finally {
        setLoadingDialogUrl(false);
      }
    }

    refreshUrl();
  }, [selectedAttachment, demande.demandeurEntrepriseId]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDevisDemandeAction({
        id: demande.id,
        entrepriseId,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      toast.success("Demande supprimée");
      router.push({ pathname: "/app/devis", query: { tab: "demandes" } });
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const staticBadge = getDevisDemandeStatutBadge(currentStatut);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header : titre (gauche) + retour (droite) */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {permissions.canEdit ? (
            <EditableTitreDemande
              demandeId={demande.id}
              entrepriseId={entrepriseId}
              currentTitre={demande.titre}
              onUpdate={handleUpdate}
            />
          ) : (
            <h1 className="break-words text-3xl font-bold tracking-tight">
              {demande.titre}
            </h1>
          )}

          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Créé le {formatDevisDate(demande.createdAt)}</span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Modifié le {formatDevisDate(demande.updatedAt)}</span>
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild className="flex-shrink-0 gap-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Retour aux demandes
          </Link>
        </Button>
      </div>

      {/* Badges + Supprimer */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canChangeStatut && availableStatuts.length > 1 ? (
            <EditableStatutDemandeSelect
              demandeId={demande.id}
              entrepriseId={entrepriseId}
              currentStatut={currentStatut}
              availableStatuts={availableStatuts}
              onUpdate={handleUpdate}
            />
          ) : (
            <Badge className={staticBadge.className}>{staticBadge.label}</Badge>
          )}
        </div>

        {permissions.canDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      <Separator />

      {/* Grid principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 md:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <FileText className="text-primary h-4 w-4" />
                Description
              </CardTitle>
              {permissions.canEdit && (
                <EditDescriptionDemandeDialog
                  demandeId={demande.id}
                  entrepriseId={entrepriseId}
                  currentDescription={demande.description ?? null}
                  onUpdate={handleUpdate}
                />
              )}
            </CardHeader>
            <CardContent>
              {demande.description ? (
                <p className="text-sm whitespace-pre-line">{demande.description}</p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  Aucune description
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pièces jointes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Paperclip className="text-primary h-4 w-4" />
                Pièces jointes
                {attachments.length > 0 && (
                  <span className="bg-secondary text-secondary-foreground ml-1 rounded-full px-1.5 text-xs">
                    {attachments.length}
                  </span>
                )}
              </CardTitle>
              {permissions.canEdit && (
                <EditAttachmentsDemandeDialog
                  demandeId={demande.id}
                  entrepriseId={entrepriseId}
                  proprietaireEntrepriseId={demande.demandeurEntrepriseId}
                  currentAttachments={attachments}
                  onUpdate={handleUpdate}
                />
              )}
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  Aucune pièce jointe
                </p>
              ) : loadingUrls ? (
                <p className="text-muted-foreground text-sm">
                  Chargement des pièces jointes...
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {attachments.map((attachment) => {
                    const url = attachmentUrls[attachment.documentId];
                    const isImage = attachment.mimeType.startsWith("image/");
                    const isPdf = attachment.mimeType === "application/pdf";

                    return (
                      <div
                        key={attachment.documentId}
                        className="group hover:border-primary/30 relative overflow-hidden rounded-lg border transition-all hover:shadow-sm"
                      >
                        {isImage && url ? (
                          <button
                            onClick={() => setSelectedAttachment(attachment)}
                            className="bg-muted relative block aspect-video w-full text-left"
                          >
                            <Image
                              src={url}
                              alt={attachment.filename}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </button>
                        ) : isPdf && url ? (
                          <button
                            onClick={() => setSelectedAttachment(attachment)}
                            className="bg-muted relative block aspect-video w-full text-left"
                          >
                            <iframe
                              src={url}
                              className="pointer-events-none absolute inset-0 h-full w-full"
                              title={attachment.filename}
                            />
                          </button>
                        ) : (
                          <div className="bg-muted flex aspect-video items-center justify-center">
                            <File className="text-muted-foreground h-12 w-12" />
                          </div>
                        )}

                        <div className="space-y-2 p-3">
                          <p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
                            {attachment.filename}
                          </p>
                          <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {(attachment.sizeBytes / 1024).toFixed(1)} Ko
                              </span>
                              <span className="text-muted-foreground/50">•</span>
                              <span>
                                {new Date(attachment.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  { day: "2-digit", month: "short" },
                                )}
                              </span>
                            </div>
                            {url && (
                              <button
                                onClick={() =>
                                  void handleDownload(url, attachment.filename)
                                }
                                aria-label={`Télécharger ${attachment.filename}`}
                                className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Info className="text-primary h-4 w-4" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Site</span>
                <span className="font-medium text-right">{demande.siteNom}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right">{demande.serviceNom}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Devis reçus</span>
                <span className="font-medium">
                  {demande.devisCount > 0 ? demande.devisCount : "—"}
                </span>
              </div>
              {demande.proprietaireEntrepriseNom && posture !== "client" && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-right">
                    {demande.proprietaireEntrepriseNom}
                  </span>
                </div>
              )}
              {(demande.createdByPrenom || demande.createdByNom) && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Créé par</span>
                  <span className="font-medium text-right">
                    {[demande.createdByPrenom, demande.createdByNom]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 max-w-md">
          <div className="bg-primary/8 border-b px-5 pb-4 pt-5 pr-12">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la demande ?</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="px-5 py-4 text-sm">
            Cette action est irréversible. La demande &quot;{demande.titre}&quot;
            sera définitivement supprimée.
          </div>
          <AlertDialogFooter className="bg-muted/30 border-t px-5 py-3 sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
            <Button
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview dialog */}
      <Dialog
        open={!!selectedAttachment}
        onOpenChange={() => setSelectedAttachment(null)}
      >
        <DialogContent className="flex !h-[95vh] !w-[90vw] !max-w-none flex-col p-0">
          {selectedAttachment && (
            <>
              <DialogHeader className="flex-shrink-0 p-6 pb-3">
                <DialogTitle className="truncate pr-12">
                  {selectedAttachment.filename}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-shrink-0 px-6 pb-3">
                <button
                  onClick={() => {
                    const url = attachmentUrls[selectedAttachment.documentId];
                    if (url) void handleDownload(url, selectedAttachment.filename);
                  }}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
              <div className="min-h-0 flex-1 px-6 pb-6">
                {loadingDialogUrl ? (
                  <p className="text-muted-foreground text-sm">Chargement...</p>
                ) : attachmentUrls[selectedAttachment.documentId] ? (
                  (() => {
                    const url = attachmentUrls[selectedAttachment.documentId];
                    const isImage = selectedAttachment.mimeType.startsWith("image/");
                    const isPdf = selectedAttachment.mimeType === "application/pdf";

                    return isImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={url}
                          alt={selectedAttachment.filename}
                          fill
                          className="object-contain"
                          sizes="90vw"
                        />
                      </div>
                    ) : isPdf ? (
                      <iframe
                        src={url}
                        className="h-full w-full"
                        title={selectedAttachment.filename}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm underline"
                        >
                          <Download className="h-4 w-4" />
                          Ouvrir le fichier
                        </a>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Fichier non disponible
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
