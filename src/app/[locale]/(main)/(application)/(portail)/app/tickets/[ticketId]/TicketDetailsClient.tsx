"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getPresignedReadUrlAction } from "@/server/actions/s3Actions";
import { type SiteResponsable } from "@/server/queries/sites.query";
import { EntrepriseSelectType } from "@/zod-schemas/entreprise.schema";
import { type TicketMessageVisibiliteType } from "@/zod-schemas/enums";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Download,
  File,
  FileText,
  LandPlot,
  Mail,
  MapPin,
  MessageCircle,
  Paperclip,
  Phone,
  TriangleAlert,
  User,
  UserCog,
  Users as UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  formatTicketDate,
  formatTicketDateRelative,
  getTicketPrioriteBadge,
  getTicketStatutBadge,
  getTicketTypeLabel,
} from "../helpers";
import { EditableAssigneEntreprise } from "./EditableAssigneEntreprise";
import { EditableAssigneUser } from "./EditableAssigneUser";
import { EditablePrioriteBadge } from "./EditablePrioriteBadge";
import { EditableStatutBadge } from "./EditableStatutBadge";
import { EditableTitre } from "./EditableTitre";
import { EditableTypeBadge } from "./EditableTypeBadge";
import { EditAttachmentsDialog } from "./EditAttachmentsDialog";
import { EditDescriptionDialog } from "./EditDescriptionDialog";
import { TicketMessagesSection } from "./TicketMessagesSection";

type DocumentMinimal = {
  id: string;
  storageProvider: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

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

type TicketDetailsClientProps = {
  ticket: SelectTicketType;
  entrepriseId: string;
  currentUserId: string;
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
  siteResponsables: SiteResponsable[];
  proprietaireEntreprise: EntrepriseSelectType | null;
  demandeurEntreprise: EntrepriseSelectType | null;
  assigneEntreprise: EntrepriseSelectType | null;
  attachments: DocumentMinimal[];
  messages: Message[];
};

export function TicketDetailsClient({
  ticket,
  entrepriseId,
  currentUserId,
  posture,
  permissions,
  availableStatuts,
  availablePrestataires,
  availableUsers,
  site,
  siteResponsables,
  proprietaireEntreprise,
  assigneEntreprise,
  attachments,
  messages,
}: TicketDetailsClientProps) {
  const router = useRouter();
  const rawSearchParams = useSearchParams();

  // Reconstruire la query de retour depuis les searchParams de l'URL courante
  const backQuery: Record<string, string> = {};
  rawSearchParams.forEach((value, key) => {
    if (value) backQuery[key] = value;
  });

  const statutBadge = getTicketStatutBadge(ticket.statut);
  const prioriteBadge = getTicketPrioriteBadge(ticket.priorite);
  const typeLabel = getTicketTypeLabel(ticket.type);

  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [selectedAttachment, setSelectedAttachment] =
    useState<DocumentMinimal | null>(null);
  const [loadingDialogUrl, setLoadingDialogUrl] = useState(false);

  // Callback pour rafraîchir la page après update
  const handleUpdate = () => {
    router.refresh();
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement du fichier");
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
          } catch {
            // URL load failure handled by missing key in attachmentUrls
          }
        }),
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
      } catch {
        // URL refresh failure is non-critical
      } finally {
        setLoadingDialogUrl(false);
      }
    }

    refreshUrl();
  }, [selectedAttachment, ticket.proprietaireEntrepriseId]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header avec bouton retour, titre et badges */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Titre - Éditable si permissions */}
            {permissions.canEditBasicFields ? (
              <EditableTitre
                ticketId={ticket.id}
                entrepriseId={entrepriseId}
                currentTitre={ticket.titre}
                onUpdate={handleUpdate}
              />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight break-words">
                {ticket.titre}
              </h1>
            )}
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Créé {formatTicketDate(ticket.createdAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Dernière activité{" "}
                {formatTicketDateRelative(ticket.lastActivityAt)}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-xs">#{ticket.id}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex-shrink-0 gap-2"
          >
            <Link
              href={{
                pathname: "/app/tickets",
                query: backQuery,
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux tickets
            </Link>
          </Button>
        </div>

        {/* Badges Type, Priorité, Statut */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Badge Type - Éditable si permissions */}
          {permissions.canEditBasicFields ? (
            <EditableTypeBadge
              ticketId={ticket.id}
              entrepriseId={entrepriseId}
              currentType={ticket.type}
              onUpdate={handleUpdate}
            />
          ) : (
            <Badge variant="outline" className="gap-1.5">
              <FileText className="h-3 w-3" />
              {typeLabel}
            </Badge>
          )}

          {/* Badge Priorité - Éditable si permissions */}
          {permissions.canEditBasicFields ? (
            <EditablePrioriteBadge
              ticketId={ticket.id}
              entrepriseId={entrepriseId}
              currentPriorite={ticket.priorite}
              onUpdate={handleUpdate}
            />
          ) : (
            <Badge className={cn("gap-1.5", prioriteBadge.className)}>
              {prioriteBadge.label}
            </Badge>
          )}

          {/* Badge Statut - Éditable si permissions */}
          {permissions.canEditStatut ? (
            <EditableStatutBadge
              ticketId={ticket.id}
              entrepriseId={entrepriseId}
              currentStatut={ticket.statut}
              availableStatuts={availableStatuts}
              onUpdate={handleUpdate}
            />
          ) : (
            <Badge className={cn("gap-1.5", statutBadge.className)}>
              {statutBadge.label}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Section Description */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <FileText className="text-primary h-4 w-4" />
              Description
            </CardTitle>
            {permissions.canEditBasicFields && (
              <EditDescriptionDialog
                ticketId={ticket.id}
                entrepriseId={entrepriseId}
                currentDescription={ticket.description}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.description ? (
            <p className="text-foreground text-sm leading-relaxed break-words whitespace-pre-wrap">
              {ticket.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Aucune description fournie
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section Informations - Grid 2 colonnes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <MapPin className="text-primary h-4 w-4" />
              Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {site ? (
              <>
                <p className="text-foreground text-sm font-semibold">
                  {site.nom}
                </p>
                <div className="flex items-start gap-4">
                  {/* Gauche : infos du site */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${site.adresseLigne1}${site.adresseLigne2 ? ` ${site.adresseLigne2}` : ""}, ${site.codePostal} ${site.ville}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary leading-relaxed transition-colors"
                      >
                        <p>{site.adresseLigne1}</p>
                        {site.adresseLigne2 && <p>{site.adresseLigne2}</p>}
                        <p>
                          {site.codePostal} {site.ville}
                        </p>
                      </a>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <LandPlot className="text-primary h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{site.surface} m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="text-primary h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">
                          {site.effectif} pers.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Droite : responsable */}
                  <div className="flex-1 space-y-2 border-l pl-4">
                    <div className="flex items-center gap-2">
                      <UserCog className="text-primary h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm font-medium">
                        Responsable
                      </span>
                    </div>
                    {siteResponsables.length === 0 ? (
                      <div className="text-destructive flex items-center gap-2 pl-6">
                        <TriangleAlert className="size-4 shrink-0" />
                        <p className="text-xs">Aucun responsable assigné.</p>
                      </div>
                    ) : (
                      siteResponsables.map((resp) => (
                        <div key={resp.id} className="space-y-2 pl-6">
                          <div className="flex items-center gap-2">
                            <User className="text-primary h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium">
                              {resp.prenom} {resp.nom}
                            </span>
                          </div>
                          {resp.phone && (
                            <a
                              href={`tel:${resp.phone}`}
                              className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                            >
                              <Phone className="text-primary h-4 w-4 shrink-0" />
                              <span>{resp.phone}</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${resp.email}`}
                            className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                          >
                            <Mail className="text-primary h-4 w-4 shrink-0" />
                            <span>{resp.email}</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {site.commentaires && (
                  <div className="border-t pt-3">
                    <p className="text-muted-foreground text-xs italic">
                      {site.commentaires}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Site inconnu
              </p>
            )}
          </CardContent>
        </Card>

        {/* Client propriétaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building2 className="text-primary h-4 w-4" />
              Client propriétaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proprietaireEntreprise ? (
              <>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {proprietaireEntreprise.nom}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    SIRET: {proprietaireEntreprise.siret}
                  </p>
                </div>
                {(proprietaireEntreprise.prenomContact ||
                  proprietaireEntreprise.nomContact ||
                  proprietaireEntreprise.phoneContact ||
                  proprietaireEntreprise.emailContact) && (
                  <div className="space-y-2">
                    {(proprietaireEntreprise.prenomContact ||
                      proprietaireEntreprise.nomContact) && (
                      <div className="flex items-center gap-2">
                        <User className="text-primary h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">
                          {proprietaireEntreprise.prenomContact}{" "}
                          {proprietaireEntreprise.nomContact}
                        </span>
                      </div>
                    )}
                    {proprietaireEntreprise.phoneContact && (
                      <a
                        href={`tel:${proprietaireEntreprise.phoneContact}`}
                        className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                      >
                        <Phone className="text-primary h-4 w-4 shrink-0" />
                        <span>{proprietaireEntreprise.phoneContact}</span>
                      </a>
                    )}
                    {proprietaireEntreprise.emailContact && (
                      <a
                        href={`mailto:${proprietaireEntreprise.emailContact}`}
                        className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                      >
                        <Mail className="text-primary h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {proprietaireEntreprise.emailContact}
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Entreprise inconnue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Prestataire assigné */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Building2 className="text-primary h-4 w-4" />
              Prestataire assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select éditable si permissions */}
            {permissions.canEditAssigneEntreprise && (
              <EditableAssigneEntreprise
                ticketId={ticket.id}
                entrepriseId={entrepriseId}
                currentAssigneEntrepriseId={ticket.assigneEntrepriseId}
                availablePrestataires={availablePrestataires}
                onUpdate={handleUpdate}
              />
            )}

            {/* Détails du prestataire si assigné */}
            {assigneEntreprise ? (
              <>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {assigneEntreprise.nom}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    SIRET: {assigneEntreprise.siret}
                  </p>
                </div>
                {(assigneEntreprise.phoneContact ||
                  assigneEntreprise.emailContact) && (
                  <div className="space-y-2">
                    {assigneEntreprise.phoneContact && (
                      <a
                        href={`tel:${assigneEntreprise.phoneContact}`}
                        className="hover:text-primary group flex items-center gap-2 text-sm transition-colors"
                      >
                        <Phone className="text-primary h-4 w-4 shrink-0" />
                        <span className="group-hover:underline">
                          {assigneEntreprise.phoneContact}
                        </span>
                      </a>
                    )}
                    {assigneEntreprise.emailContact && (
                      <a
                        href={`mailto:${assigneEntreprise.emailContact}`}
                        className="hover:text-primary group flex items-center gap-2 text-sm transition-colors"
                      >
                        <Mail className="text-primary h-4 w-4 shrink-0" />
                        <span className="truncate group-hover:underline">
                          {assigneEntreprise.emailContact}
                        </span>
                      </a>
                    )}
                  </div>
                )}
                {(assigneEntreprise.prenomContact ||
                  assigneEntreprise.nomContact) && (
                  <div className="border-t pt-3">
                    <p className="text-xs">
                      <span className="text-muted-foreground">Contact :</span>{" "}
                      <span className="font-medium">
                        {assigneEntreprise.prenomContact}{" "}
                        {assigneEntreprise.nomContact}
                      </span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Non assigné
              </p>
            )}
          </CardContent>
        </Card>

        {/* Utilisateur assigné */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <User className="text-primary h-4 w-4" />
              Utilisateur assigné
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select éditable si permissions */}
            {permissions.canEditAssigneUser ? (
              <EditableAssigneUser
                ticketId={ticket.id}
                entrepriseId={entrepriseId}
                currentAssigneUserId={ticket.assigneUserId}
                availableUsers={availableUsers}
                onUpdate={handleUpdate}
              />
            ) : (
              <p className="text-sm font-medium">
                {ticket.assigneUserId ? (
                  (() => {
                    const user = availableUsers.find(
                      (u) => u.id === ticket.assigneUserId,
                    );
                    return user ? (
                      `${user.prenom} ${user.nom}`
                    ) : (
                      <span className="text-muted-foreground italic">
                        Utilisateur inconnu
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-muted-foreground italic">
                    Non assigné
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Pièces Jointes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Paperclip className="text-primary h-4 w-4" />
              Pièces jointes
              {attachments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {attachments.length}
                </Badge>
              )}
            </CardTitle>
            {permissions.canEditBasicFields && (
              <EditAttachmentsDialog
                ticketId={ticket.id}
                entrepriseId={entrepriseId}
                proprietaireEntrepriseId={ticket.proprietaireEntrepriseId}
                currentAttachments={attachments.map((att) => ({
                  storageKey: att.storageKey,
                  filename: att.filename,
                  mimeType: att.mimeType,
                  sizeBytes: att.sizeBytes,
                }))}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {attachments.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Aucune pièce jointe
            </p>
          ) : loadingUrls ? (
            <p className="text-muted-foreground text-sm">
              Chargement des pièces jointes...
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {attachments.map((attachment) => {
                const url = attachmentUrls[attachment.id];
                const isImage = attachment.mimeType.startsWith("image/");
                const isPdf = attachment.mimeType === "application/pdf";
                const isVideo = attachment.mimeType.startsWith("video/");

                return (
                  <div
                    key={attachment.id}
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    ) : isVideo && url ? (
                      <button
                        onClick={() => setSelectedAttachment(attachment)}
                        className="bg-muted relative block aspect-video w-full text-left"
                      >
                        <video
                          src={url}
                          className="pointer-events-none h-full w-full object-cover"
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(url, attachment.filename);
                            }}
                            aria-label={`Télécharger ${attachment.filename}`}
                            className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
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

      {/* Section Messages/Discussion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <MessageCircle className="text-primary h-4 w-4" />
            Discussion
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {messages.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TicketMessagesSection
            ticketId={ticket.id}
            entrepriseId={entrepriseId}
            proprietaireEntrepriseId={ticket.proprietaireEntrepriseId}
            currentUserId={currentUserId}
            initialMessages={messages}
            posture={posture}
          />
        </CardContent>
      </Card>

      {/* Dialog d'affichage en grand */}
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
                  onClick={() =>
                    handleDownload(
                      attachmentUrls[selectedAttachment.id],
                      selectedAttachment.filename,
                    )
                  }
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </button>
              </div>
              <div className="min-h-0 flex-1 px-6 pb-6">
                {loadingDialogUrl ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      Chargement...
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedAttachment.mimeType.startsWith("image/") &&
                      attachmentUrls[selectedAttachment.id] && (
                        <div className="relative h-full w-full">
                          <Image
                            src={attachmentUrls[selectedAttachment.id]}
                            alt={selectedAttachment.filename}
                            fill
                            className="object-contain"
                            sizes="1280px"
                          />
                        </div>
                      )}
                    {selectedAttachment.mimeType === "application/pdf" &&
                      attachmentUrls[selectedAttachment.id] && (
                        <iframe
                          src={attachmentUrls[selectedAttachment.id]}
                          className="h-full w-full border-0"
                          title={selectedAttachment.filename}
                        />
                      )}
                    {selectedAttachment.mimeType.startsWith("video/") &&
                      attachmentUrls[selectedAttachment.id] && (
                        <video
                          src={attachmentUrls[selectedAttachment.id]}
                          controls
                          className="h-full w-full object-contain"
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
