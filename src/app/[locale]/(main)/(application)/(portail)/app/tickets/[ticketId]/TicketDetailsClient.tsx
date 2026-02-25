"use client";

import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { EntrepriseSelectType } from "@/zod-schemas/entreprise.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Calendar,
  FileText,
  Paperclip,
  User,
  MapPin,
  FileImage,
  File,
  Phone,
  Mail,
  Home,
  LandPlot,
  Users as UsersIcon,
  Download,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTicketStatutBadge,
  getTicketPrioriteBadge,
  getTicketTypeLabel,
  formatTicketDate,
  formatTicketDateRelative,
} from "../helpers";
import { useState, useEffect } from "react";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

type DocumentMinimal = {
  id: string;
  storageProvider: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

type TicketDetailsClientProps = {
  ticket: SelectTicketType;
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
  permissions: {
    canEditBasicFields: boolean;
    canEditAssigneEntreprise: boolean;
    canEditAssigneUser: boolean;
    canEditStatut: boolean;
  };
  availableStatuts: string[];
  availablePrestataires: Array<{ id: string; nom: string }>;
  availableUsers: Array<{ id: string; prenom: string; nom: string }>;
  site: SelectSiteType | null;
  proprietaireEntreprise: EntrepriseSelectType | null;
  demandeurEntreprise: EntrepriseSelectType | null;
  assigneEntreprise: EntrepriseSelectType | null;
  attachments: DocumentMinimal[];
};

export function TicketDetailsClient({
  ticket,
  entrepriseId,
  posture,
  permissions,
  availableStatuts,
  availablePrestataires,
  availableUsers,
  site,
  proprietaireEntreprise,
  demandeurEntreprise,
  assigneEntreprise,
  attachments,
}: TicketDetailsClientProps) {
  const statutBadge = getTicketStatutBadge(ticket.statut);
  const prioriteBadge = getTicketPrioriteBadge(ticket.priorite);
  const typeLabel = getTicketTypeLabel(ticket.type);

  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<DocumentMinimal | null>(null);
  const [loadingDialogUrl, setLoadingDialogUrl] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  // Charger les URLs présignées au montage
  useEffect(() => {
    async function loadAttachmentUrls() {
      if (attachments.length === 0) {
        setLoadingUrls(false);
        return;
      }

      const urls: Record<string, string> = {};

      await Promise.all(
        attachments.map(async (attachment) => {
          try {
            const result = await getPresignedReadUrlAction({
              proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
              key: attachment.storageKey,
            });

            if (result?.data?.url) {
              urls[attachment.id] = result.data.url;
            }
          } catch (error) {
            console.error(`Failed to load URL for ${attachment.filename}:`, error);
          }
        })
      );

      setAttachmentUrls(urls);
      setLoadingUrls(false);
    }

    loadAttachmentUrls();
  }, [attachments, ticket.proprietaireEntrepriseId]);

  // Régénérer l'URL quand on ouvre le dialog (pour éviter expiration)
  useEffect(() => {
    async function refreshUrl() {
      if (!selectedAttachment) return;

      setLoadingDialogUrl(true);

      try {
        const result = await getPresignedReadUrlAction({
          proprietaireEntrepriseId: ticket.proprietaireEntrepriseId,
          key: selectedAttachment.storageKey,
        });

        if (result?.data?.url) {
          setAttachmentUrls((prev) => ({
            ...prev,
            [selectedAttachment.id]: result.data!.url,
          }));
        }
      } catch (error) {
        console.error(`Failed to refresh URL for ${selectedAttachment.filename}:`, error);
      } finally {
        setLoadingDialogUrl(false);
      }
    }

    refreshUrl();
  }, [selectedAttachment, ticket.proprietaireEntrepriseId]);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header avec bouton retour, titre et badges */}
      <div className="space-y-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight break-words">
              {ticket.titre}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Créé {formatTicketDate(ticket.createdAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Dernière activité {formatTicketDateRelative(ticket.lastActivityAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-xs">#{ticket.id}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2 flex-shrink-0">
            <Link href="/app/tickets">
              <ArrowLeft className="h-4 w-4" />
              Retour aux tickets
            </Link>
          </Button>
        </div>

        {/* Badges Type, Priorité, Statut */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <FileText className="h-3 w-3" />
            {typeLabel}
          </Badge>
          <Badge className={cn("gap-1.5", prioriteBadge.className)}>
            {prioriteBadge.label}
          </Badge>
          <Badge className={cn("gap-1.5", statutBadge.className)}>
            {statutBadge.label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Section Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-medium">
            <FileText className="h-4 w-4 text-primary" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
              {ticket.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Aucune description fournie
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section Informations - Grid 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Site */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {site ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-foreground">{site.nom}</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Home className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary/60" />
                  <div className="leading-relaxed">
                    <p>{site.adresseLigne1}</p>
                    {site.adresseLigne2 && <p>{site.adresseLigne2}</p>}
                    <p>
                      {site.codePostal} {site.ville}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LandPlot className="h-4 w-4 flex-shrink-0 text-primary/60" />
                    <span className="font-medium">{site.surface} m²</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="h-4 w-4 flex-shrink-0 text-primary/60" />
                    <span className="font-medium">{site.effectif} pers.</span>
                  </div>
                </div>
                {site.commentaires && (
                  <div className="pt-1 border-t mt-3">
                    <p className="text-xs text-muted-foreground italic pt-2">
                      {site.commentaires}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Site inconnu</p>
            )}
          </CardContent>
        </Card>

        {/* Client propriétaire */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Client propriétaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {proprietaireEntreprise ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-foreground">{proprietaireEntreprise.nom}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    SIRET: {proprietaireEntreprise.siret}
                  </p>
                </div>
                {(proprietaireEntreprise.phoneContact || proprietaireEntreprise.emailContact) && (
                  <div className="space-y-2">
                    {proprietaireEntreprise.phoneContact && (
                      <a
                        href={`tel:${proprietaireEntreprise.phoneContact}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0 text-primary/60 group-hover:text-primary" />
                        <span className="group-hover:underline">{proprietaireEntreprise.phoneContact}</span>
                      </a>
                    )}
                    {proprietaireEntreprise.emailContact && (
                      <a
                        href={`mailto:${proprietaireEntreprise.emailContact}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0 text-primary/60 group-hover:text-primary" />
                        <span className="truncate group-hover:underline">{proprietaireEntreprise.emailContact}</span>
                      </a>
                    )}
                  </div>
                )}
                {(proprietaireEntreprise.prenomContact || proprietaireEntreprise.nomContact) && (
                  <div className="pt-1 border-t mt-3">
                    <p className="text-xs text-muted-foreground pt-2">
                      <span className="font-medium">Contact:</span> {proprietaireEntreprise.prenomContact} {proprietaireEntreprise.nomContact}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Entreprise inconnue</p>
            )}
          </CardContent>
        </Card>

        {/* Prestataire assigné */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Prestataire assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {assigneEntreprise ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-foreground">{assigneEntreprise.nom}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    SIRET: {assigneEntreprise.siret}
                  </p>
                </div>
                {(assigneEntreprise.phoneContact || assigneEntreprise.emailContact) && (
                  <div className="space-y-2">
                    {assigneEntreprise.phoneContact && (
                      <a
                        href={`tel:${assigneEntreprise.phoneContact}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Phone className="h-4 w-4 flex-shrink-0 text-primary/60 group-hover:text-primary" />
                        <span className="group-hover:underline">{assigneEntreprise.phoneContact}</span>
                      </a>
                    )}
                    {assigneEntreprise.emailContact && (
                      <a
                        href={`mailto:${assigneEntreprise.emailContact}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <Mail className="h-4 w-4 flex-shrink-0 text-primary/60 group-hover:text-primary" />
                        <span className="truncate group-hover:underline">{assigneEntreprise.emailContact}</span>
                      </a>
                    )}
                  </div>
                )}
                {(assigneEntreprise.prenomContact || assigneEntreprise.nomContact) && (
                  <div className="pt-1 border-t mt-3">
                    <p className="text-xs text-muted-foreground pt-2">
                      <span className="font-medium">Contact:</span> {assigneEntreprise.prenomContact} {assigneEntreprise.nomContact}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Non assigné</p>
            )}
          </CardContent>
        </Card>

        {/* Utilisateur assigné */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 font-medium">
              <User className="h-4 w-4 text-primary" />
              Utilisateur assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm font-medium">
              {ticket.assigneUserId ? (
                (() => {
                  const user = availableUsers.find(
                    (u) => u.id === ticket.assigneUserId
                  );
                  return user ? (
                    `${user.prenom} ${user.nom}`
                  ) : (
                    <span className="text-muted-foreground italic">Utilisateur inconnu</span>
                  );
                })()
              ) : (
                <span className="text-muted-foreground italic">Non assigné</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Pièces Jointes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-medium">
            <Paperclip className="h-4 w-4 text-primary" />
            Pièces jointes
            {attachments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {attachments.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Aucune pièce jointe
            </p>
          ) : loadingUrls ? (
            <p className="text-sm text-muted-foreground">Chargement des pièces jointes...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachments.map((attachment) => {
                const url = attachmentUrls[attachment.id];
                const isImage = attachment.mimeType.startsWith("image/");
                const isPdf = attachment.mimeType === "application/pdf";
                const isVideo = attachment.mimeType.startsWith("video/");

                return (
                  <div
                    key={attachment.id}
                    className="group relative rounded-lg border overflow-hidden transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    {isImage && url ? (
                      <button
                        onClick={() => setSelectedAttachment(attachment)}
                        className="block relative aspect-video bg-muted w-full text-left"
                      >
                        <Image
                          src={url}
                          alt={attachment.filename}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </button>
                    ) : isPdf && url ? (
                      <button
                        onClick={() => setSelectedAttachment(attachment)}
                        className="block relative aspect-video bg-muted w-full text-left"
                      >
                        <iframe
                          src={url}
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          title={attachment.filename}
                        />
                      </button>
                    ) : isVideo && url ? (
                      <button
                        onClick={() => setSelectedAttachment(attachment)}
                        className="block relative aspect-video bg-muted w-full text-left"
                      >
                        <video
                          src={url}
                          className="w-full h-full object-cover pointer-events-none"
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center aspect-video bg-muted">
                        <File className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {attachment.filename}
                      </p>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {(attachment.sizeBytes / 1024).toFixed(1)} Ko
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>
                            {new Date(attachment.createdAt).toLocaleDateString(
                              "fr-FR",
                              { day: "2-digit", month: "short" }
                            )}
                          </span>
                        </div>
                        {url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(url, attachment.filename);
                            }}
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
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

      {/* Debug info */}
      <Card className="border-dashed bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Debug Info
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1.5 font-mono pt-4">
          <p>
            <span className="font-semibold">Posture:</span> {posture}
          </p>
          <p>
            <span className="font-semibold">Permissions:</span>{" "}
            {JSON.stringify(permissions)}
          </p>
          <p>
            <span className="font-semibold">Statuts disponibles:</span>{" "}
            {availableStatuts.join(", ")}
          </p>
        </CardContent>
      </Card>

      {/* Dialog d'affichage en grand */}
      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="!w-[90vw] !h-[95vh] !max-w-none p-0 flex flex-col">
          {selectedAttachment && (
            <>
              <DialogHeader className="p-6 pb-3 flex-shrink-0">
                <DialogTitle className="truncate pr-12">
                  {selectedAttachment.filename}
                </DialogTitle>
              </DialogHeader>
              <div className="px-6 pb-3 flex-shrink-0">
                <button
                  onClick={() => handleDownload(attachmentUrls[selectedAttachment.id], selectedAttachment.filename)}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
              <div className="px-6 pb-6 flex-1 min-h-0">
                {loadingDialogUrl ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  </div>
                ) : (
                  <>
                    {selectedAttachment.mimeType.startsWith("image/") && attachmentUrls[selectedAttachment.id] && (
                      <div className="relative w-full h-full">
                        <Image
                          src={attachmentUrls[selectedAttachment.id]}
                          alt={selectedAttachment.filename}
                          fill
                          className="object-contain"
                          sizes="1280px"
                        />
                      </div>
                    )}
                    {selectedAttachment.mimeType === "application/pdf" && attachmentUrls[selectedAttachment.id] && (
                      <iframe
                        src={attachmentUrls[selectedAttachment.id]}
                        className="w-full h-full border-0"
                        title={selectedAttachment.filename}
                      />
                    )}
                    {selectedAttachment.mimeType.startsWith("video/") && attachmentUrls[selectedAttachment.id] && (
                      <video
                        src={attachmentUrls[selectedAttachment.id]}
                        controls
                        className="w-full h-full object-contain"
                      >
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
