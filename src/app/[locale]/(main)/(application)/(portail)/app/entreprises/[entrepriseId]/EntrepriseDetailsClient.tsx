"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import {
  deleteEntrepriseContactAction,
  inviterContactAction,
} from "@/server/actions/entreprisesActions";
import type { EntrepriseContactWithInvitationType } from "@/server/queries/entreprises.query";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  HandPlatter,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  Tags,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatEntrepriseDate, getRoleBadgeStyles } from "../helpers";
import { EditEntrepriseContactDialog } from "./EditEntrepriseContactDialog";
import { EditEntrepriseInfosDialog } from "./EditEntrepriseInfosDialog";
import { EditEntrepriseLogoDialog } from "./EditEntrepriseLogoDialog";
import { EditEntrepriseRolesDialog } from "./EditEntrepriseRolesDialog";

type ServiceItemType = { serviceId: string; nom: string };

type EntrepriseDetailsClientProps = {
  entreprise: EntrepriseWithDetails;
  services: ServiceItemType[];
  logoUrl: string | null;
  logoStorageKey: string | null;
  initialContacts?: EntrepriseContactWithInvitationType[];
  /** Si false, les boutons "Modifier" et l'avatar cliquable sont masqués (non-admin) */
  canEdit?: boolean;
  /** Si false, le bouton "Retour aux entreprises" est masqué (ex: page Mon Entreprise) */
  showBackButton?: boolean;
  /** Callback après mutation réussie — par défaut router.refresh() */
  onUpdate?: (...args: unknown[]) => void;
};

export function EntrepriseDetailsClient({
  entreprise,
  services,
  logoUrl,
  logoStorageKey,
  initialContacts = [],
  canEdit = true,
  showBackButton = true,
  onUpdate,
}: EntrepriseDetailsClientProps) {
  const router = useRouter();
  const rawSearchParams = useSearchParams();

  const backQuery: Record<string, string> = {};
  rawSearchParams.forEach((value, key) => {
    if (value) backQuery[key] = value;
  });

  const [editInfosOpen, setEditInfosOpen] = useState(false);
  const [editRolesOpen, setEditRolesOpen] = useState(false);
  const [editLogoOpen, setEditLogoOpen] = useState(false);

  // Contacts state — synchronisé avec initialContacts quand le serveur re-fetch (router.refresh())
  const [contacts, setContacts] =
    useState<EntrepriseContactWithInvitationType[]>(initialContacts);
  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<EntrepriseContactWithInvitationType | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null,
  );
  const [invitingContactId, setInvitingContactId] = useState<string | null>(
    null,
  );
  const [confirmInviteContact, setConfirmInviteContact] =
    useState<EntrepriseContactWithInvitationType | null>(null);
  const [confirmDeleteContact, setConfirmDeleteContact] =
    useState<EntrepriseContactWithInvitationType | null>(null);

  const handleInviterContact = async (contactId: string) => {
    setConfirmInviteContact(null);
    setInvitingContactId(contactId);
    const result = await inviterContactAction({
      contactId,
      entrepriseId: entreprise.id,
    });
    setInvitingContactId(null);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    if (result?.data?.email) {
      toast.success(
        `Un email d'invitation a bien été envoyé à ${result.data.email}`,
      );
      router.refresh();
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    setConfirmDeleteContact(null);
    setDeletingContactId(contactId);
    const result = await deleteEntrepriseContactAction({ contactId });
    setDeletingContactId(null);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    toast.success("Contact supprimé.");
  };

  // Référence stable pour éviter les re-renders infinis dans les dialogs enfants
  const serviceIds = useMemo(
    () => services.map((s) => s.serviceId),
    [services],
  );

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      router.refresh();
    }
  };

  const initials = entreprise.nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPrestataire = entreprise.roles.includes("prestataire");
  const isClient = entreprise.roles.includes("client");

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          {/* Titre + méta */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {/* Avatar — cliquable si canEdit, sinon statique */}
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => setEditLogoOpen(true)}
                  className="group focus-visible:ring-primary relative flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2"
                  title="Modifier le logo"
                >
                  <Avatar className="ring-border h-12 w-12 ring-1">
                    {logoUrl && (
                      <AvatarImage
                        src={logoUrl}
                        alt={`Logo ${entreprise.nom}`}
                        className="object-contain"
                      />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground text-base font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="h-4 w-4 text-white" />
                  </span>
                </button>
              ) : (
                <Avatar className="ring-border h-12 w-12 flex-shrink-0 ring-1">
                  {logoUrl && (
                    <AvatarImage
                      src={logoUrl}
                      alt={`Logo ${entreprise.nom}`}
                      className="object-contain"
                    />
                  )}
                  <AvatarFallback className="bg-muted text-muted-foreground text-base font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}

              <h1 className="text-3xl font-bold tracking-tight break-words">
                {entreprise.nom}
              </h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Créé le {formatEntrepriseDate(entreprise.createdAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-xs">
                SIRET{" "}
                {entreprise.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </span>
            </div>
          </div>

          {/* Boutons top right */}
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link
                  href={{
                    pathname: "/app/entreprises",
                    query: backQuery,
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux entreprises
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Badges rôles */}
        <div className="flex flex-wrap items-center gap-2">
          {entreprise.roles.map((role) => {
            const { className, label } = getRoleBadgeStyles(role);
            return (
              <Badge key={role} variant="outline" className={className}>
                {label}
              </Badge>
            );
          })}
        </div>

        {/* Invitation en attente */}
        {!entreprise.hasActiveAdmin && entreprise.pendingInvitation && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Invitation envoyée à{" "}
              <strong>{entreprise.pendingInvitation.email}</strong> — en attente
              d&apos;inscription
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Section Informations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Informations entreprise */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Building2 className="text-primary h-4 w-4" />
                Informations
              </CardTitle>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-foreground h-8 gap-1.5"
                  onClick={() => setEditInfosOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {entreprise.nom}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                SIRET:{" "}
                {entreprise.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </p>
              {entreprise.formeJuridique && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {entreprise.formeJuridique}
                </p>
              )}
              {entreprise.numeroTva && (
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                  TVA : {entreprise.numeroTva}
                </p>
              )}
            </div>
            {(entreprise.adresseLigne1 ||
              entreprise.codePostal ||
              entreprise.ville) && (
              <div className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-sm">
                  {entreprise.adresseLigne1 && (
                    <p>{entreprise.adresseLigne1}</p>
                  )}
                  {entreprise.adresseLigne2 && (
                    <p>{entreprise.adresseLigne2}</p>
                  )}
                  {(entreprise.codePostal || entreprise.ville) && (
                    <p>
                      {entreprise.codePostal} {entreprise.ville}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sites — uniquement si l'entreprise est cliente */}
        {isClient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <MapPin className="text-primary h-4 w-4" />
                Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-sm">
                <span className="text-2xl font-bold">{entreprise.nbSites}</span>{" "}
                {entreprise.nbSites === 0
                  ? "aucun site enregistré"
                  : entreprise.nbSites === 1
                    ? "site enregistré"
                    : "sites enregistrés"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rôles + Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Tags className="text-primary h-4 w-4" />
                Rôles
              </CardTitle>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-foreground h-8 gap-1.5"
                  onClick={() => setEditRolesOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {entreprise.roles.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                Aucun rôle assigné
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {entreprise.roles.map((role) => {
                  const { className, label } = getRoleBadgeStyles(role);
                  return (
                    <Badge key={role} variant="outline" className={className}>
                      {label}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Services proposés (si prestataire) */}
            {isPrestataire && services.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {services.map((s) => (
                  <span
                    key={s.serviceId}
                    className="bg-primary/10 dark:bg-primary/40 text-primary dark:text-primary-foreground border-primary/30 dark:border-primary/70 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                  >
                    <HandPlatter className="h-3 w-3" />
                    {s.nom}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="text-primary h-4 w-4" />
              Contacts
            </CardTitle>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                onClick={() => setAddContactOpen(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Ajouter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Aucun contact enregistré.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {c.prenom} {c.nom}
                    </p>
                    {c.fonction && (
                      <p className="text-muted-foreground text-xs">
                        {c.fonction}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-3">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1 text-xs hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 text-xs hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </a>
                      )}
                    </div>
                    {!c.userId && c.pendingInvitationSentAt && (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs italic">
                        <Clock className="h-3 w-3 shrink-0" />
                        Invitation envoyée le{" "}
                        {formatEntrepriseDate(c.pendingInvitationSentAt)}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex shrink-0 gap-1">
                      {!c.userId && c.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-blue-500 hover:text-blue-600"
                          title="Inviter à créer un compte"
                          onClick={() => setConfirmInviteContact(c)}
                          disabled={invitingContactId === c.id}
                        >
                          {invitingContactId === c.id ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingContact(c)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-7 w-7"
                        onClick={() => setConfirmDeleteContact(c)}
                        disabled={deletingContactId === c.id}
                      >
                        {deletingContactId === c.id ? (
                          <Spinner className="h-3.5 w-3.5" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog confirmation invitation */}
      <AlertDialog
        open={!!confirmInviteContact}
        onOpenChange={(v) => {
          if (!v) setConfirmInviteContact(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer une invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un email sera envoyé à{" "}
              <strong>{confirmInviteContact?.email}</strong> pour inviter{" "}
              {confirmInviteContact?.prenom} {confirmInviteContact?.nom} à créer
              son compte.
              {confirmInviteContact?.pendingInvitationSentAt && (
                <span className="mt-1 block">
                  Une invitation précédente avait été envoyée le{" "}
                  {formatEntrepriseDate(
                    confirmInviteContact.pendingInvitationSentAt,
                  )}
                  . Elle sera remplacée par la nouvelle.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmInviteContact &&
                handleInviterContact(confirmInviteContact.id)
              }
            >
              Envoyer l&apos;invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog confirmation suppression contact */}
      <AlertDialog
        open={!!confirmDeleteContact}
        onOpenChange={(v) => {
          if (!v) setConfirmDeleteContact(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDeleteContact?.prenom} {confirmDeleteContact?.nom} sera
              définitivement supprimé de la liste des contacts.
              {confirmDeleteContact?.pendingInvitationSentAt && (
                <span className="text-destructive mt-1 block font-medium">
                  Une invitation est en attente pour ce contact. Elle deviendra
                  caduque si vous supprimez le contact.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                confirmDeleteContact &&
                handleDeleteContact(confirmDeleteContact.id)
              }
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog ajout contact */}
      {canEdit && (
        <EditEntrepriseContactDialog
          open={addContactOpen}
          onOpenChange={setAddContactOpen}
          mode="create"
          entrepriseId={entreprise.id}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Dialog édition contact */}
      {canEdit && editingContact && (
        <EditEntrepriseContactDialog
          open={!!editingContact}
          onOpenChange={(v) => {
            if (!v) setEditingContact(null);
          }}
          mode="edit"
          contact={editingContact}
          onSuccess={() => {
            setEditingContact(null);
            router.refresh();
          }}
        />
      )}

      {/* Dialogs — uniquement si l'utilisateur peut éditer */}
      {canEdit && (
        <>
          <EditEntrepriseInfosDialog
            open={editInfosOpen}
            onOpenChange={setEditInfosOpen}
            entrepriseId={entreprise.id}
            currentSiret={entreprise.siret}
            onSuccess={handleUpdate}
          />

          <EditEntrepriseRolesDialog
            open={editRolesOpen}
            onOpenChange={setEditRolesOpen}
            entrepriseId={entreprise.id}
            currentRoles={entreprise.roles}
            currentServiceIds={serviceIds}
            onSuccess={handleUpdate}
          />

          <EditEntrepriseLogoDialog
            open={editLogoOpen}
            onOpenChange={setEditLogoOpen}
            entrepriseId={entreprise.id}
            currentLogoStorageKey={logoStorageKey}
            currentLogoUrl={logoUrl}
            onSuccess={handleUpdate}
          />
        </>
      )}
    </div>
  );
}
