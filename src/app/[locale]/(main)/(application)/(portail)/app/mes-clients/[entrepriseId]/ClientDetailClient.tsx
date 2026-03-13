"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteRelationContactAction } from "@/server/actions/entreprisesActions";
import { EditRelationContactDialog } from "../../EditRelationContactDialog";
import type { ClientAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import type { RelationContactWithDetails } from "@/server/queries/entreprises.query";
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
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddRelationContactDialog } from "../../AddRelationContactDialog";
import { EditEntrepriseInfosDialog } from "../../entreprises/[entrepriseId]/EditEntrepriseInfosDialog";
import { formatEntrepriseDate, getRoleBadgeStyles } from "../../entreprises/helpers";

type ClientDetailClientProps = {
  client: ClientAvecDetails;
  relationId: string;
  initialContacts: RelationContactWithDetails[];
  logoUrl: string | null;
};

export function ClientDetailClient({
  client,
  relationId,
  initialContacts,
  logoUrl,
}: ClientDetailClientProps) {
  const router = useRouter();
  const [contacts, setContacts] =
    useState<RelationContactWithDetails[]>(initialContacts);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editInfosOpen, setEditInfosOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<RelationContactWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmRemoveContact, setConfirmRemoveContact] =
    useState<RelationContactWithDetails | null>(null);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleDeleteContact = async (linkId: string) => {
    setConfirmRemoveContact(null);
    setDeletingId(linkId);
    const result = await deleteRelationContactAction({ linkId });
    setDeletingId(null);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== linkId));
    toast.success("Contact retiré.");
  };

  const initials = client.nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isClient = client.roles.includes("client");

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          {/* Titre + méta */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="ring-border h-12 w-12 flex-shrink-0 ring-1">
                {logoUrl && (
                  <AvatarImage
                    src={logoUrl}
                    alt={`Logo ${client.nom}`}
                    className="object-contain"
                  />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground text-base font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold tracking-tight break-words">
                {client.nom}
              </h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Créé le {formatEntrepriseDate(client.createdAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-xs">
                SIRET{" "}
                {client.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </span>
            </div>
          </div>

          {/* Boutons top right */}
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/app/mes-clients">
                <ArrowLeft className="h-4 w-4" />
                Retour aux clients
              </Link>
            </Button>
          </div>
        </div>

        {/* Badges rôles */}
        <div className="flex flex-wrap items-center gap-2">
          {client.roles.map((role) => {
            const { className, label } = getRoleBadgeStyles(
              role as "client" | "prestataire",
            );
            return (
              <Badge key={role} variant="outline" className={className}>
                {label}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Message si admin actif */}
      {client.hasActiveAdmin && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Ce client a un administrateur actif, vous ne pouvez pas modifier ses
            informations. Pour tout changement,{" "}
            <a
              href={client.adminEmail ? `mailto:${client.adminEmail}` : undefined}
              className="underline underline-offset-2"
            >
              contacter l&apos;administrateur
            </a>
            .
          </span>
        </div>
      )}

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
              {!client.hasActiveAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
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
                {client.nom}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                SIRET:{" "}
                {client.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </p>
              {client.formeJuridique && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {client.formeJuridique}
                </p>
              )}
              {client.numeroTva && (
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                  TVA : {client.numeroTva}
                </p>
              )}
            </div>
            {(client.adresseLigne1 ||
              client.codePostal ||
              client.ville) && (
              <div className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-sm">
                  {client.adresseLigne1 && <p>{client.adresseLigne1}</p>}
                  {client.adresseLigne2 && <p>{client.adresseLigne2}</p>}
                  {(client.codePostal || client.ville) && (
                    <p>
                      {client.codePostal} {client.ville}
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
                <span className="text-2xl font-bold">{client.nbSites}</span>{" "}
                {client.nbSites === 0
                  ? "aucun site enregistré"
                  : client.nbSites === 1
                    ? "site enregistré"
                    : "sites enregistrés"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="text-primary h-4 w-4" />
              Contacts
            </CardTitle>
            {relationId && (
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
              Aucun interlocuteur enregistré.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">
                        {c.prenom} {c.nom}
                      </span>
                      {c.estPrincipal && (
                        <Badge variant="secondary" className="text-xs">
                          Interlocuteur principal
                        </Badge>
                      )}
                      {c.userId ? (
                        <Badge
                          variant="outline"
                          className="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs"
                        >
                          Utilisateur
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground text-xs"
                        >
                          Sans compte
                        </Badge>
                      )}
                      {c.role && (
                        <span className="text-muted-foreground text-xs">
                          {c.role}
                        </span>
                      )}
                    </div>
                    {c.fonction && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {c.fonction}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs flex items-center gap-1 hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="text-xs flex items-center gap-1 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingContact(c)}
                      disabled={deletingId === c.id}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setConfirmRemoveContact(c)}
                      disabled={deletingId === c.id}
                    >
                      {deletingId === c.id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {relationId && (
        <AddRelationContactDialog
          open={addContactOpen}
          onOpenChange={setAddContactOpen}
          relationId={relationId}
          targetEntrepriseId={client.id}
          targetNom={client.nom}
          side="client"
          onSuccess={() => router.refresh()}
        />
      )}

      <EditEntrepriseInfosDialog
        open={editInfosOpen}
        onOpenChange={setEditInfosOpen}
        entrepriseId={client.id}
        currentSiret={client.siret}
        onSuccess={() => router.refresh()}
      />

      <EditRelationContactDialog
        open={!!editingContact}
        onOpenChange={(v) => {
          if (!v) setEditingContact(null);
        }}
        linkId={editingContact?.id ?? ""}
        contactNom={
          editingContact
            ? `${editingContact.prenom} ${editingContact.nom}`
            : ""
        }
        currentRole={editingContact?.role ?? null}
        currentEstPrincipal={editingContact?.estPrincipal ?? false}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog
        open={!!confirmRemoveContact}
        onOpenChange={(v) => {
          if (!v) setConfirmRemoveContact(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce contact ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment retirer{" "}
              <strong>
                {confirmRemoveContact?.prenom} {confirmRemoveContact?.nom}
              </strong>{" "}
              de vos contacts pour ce client ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                confirmRemoveContact &&
                handleDeleteContact(confirmRemoveContact.id)
              }
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
