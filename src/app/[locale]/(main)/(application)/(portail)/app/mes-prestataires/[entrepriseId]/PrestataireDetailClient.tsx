"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteRelationContactAction } from "@/server/actions/entreprisesActions";
import type { PrestataireAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import type { RelationContactWithDetails } from "@/server/queries/entreprises.query";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  HandPlatter,
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
import { EditPrestataireServicesDialog } from "./EditPrestataireServicesDialog";

type PrestataireDetailClientProps = {
  prestataire: PrestataireAvecDetails;
  relationId: string;
  initialContacts: RelationContactWithDetails[];
  logoUrl: string | null;
};

export function PrestataireDetailClient({
  prestataire,
  relationId,
  initialContacts,
  logoUrl,
}: PrestataireDetailClientProps) {
  const router = useRouter();
  const [contacts, setContacts] =
    useState<RelationContactWithDetails[]>(initialContacts);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editInfosOpen, setEditInfosOpen] = useState(false);
  const [editServicesOpen, setEditServicesOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleDeleteContact = async (linkId: string) => {
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

  const initials = prestataire.nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canEdit = !prestataire.hasActiveAdmin;

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
                    alt={`Logo ${prestataire.nom}`}
                    className="object-contain"
                  />
                )}
                <AvatarFallback className="bg-muted text-muted-foreground text-base font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold tracking-tight break-words">
                {prestataire.nom}
              </h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Créé le {formatEntrepriseDate(prestataire.createdAt)}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-xs">
                SIRET{" "}
                {prestataire.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </span>
            </div>
          </div>

          {/* Bouton retour */}
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/app/mes-prestataires">
                <ArrowLeft className="h-4 w-4" />
                Retour aux prestataires
              </Link>
            </Button>
          </div>
        </div>

        {/* Badges rôles */}
        <div className="flex flex-wrap items-center gap-2">
          {prestataire.roles.map((role) => {
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
      {prestataire.hasActiveAdmin && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Ce prestataire a un administrateur actif, vous ne pouvez pas
            modifier ses informations. Pour tout changement,{" "}
            <a
              href={prestataire.adminEmail ? `mailto:${prestataire.adminEmail}` : undefined}
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
              {canEdit && (
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
                {prestataire.nom}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                SIRET:{" "}
                {prestataire.siret.replace(
                  /^(\d{3})(\d{3})(\d{3})(\d{5})$/,
                  "$1 $2 $3 $4",
                )}
              </p>
              {prestataire.formeJuridique && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {prestataire.formeJuridique}
                </p>
              )}
              {prestataire.numeroTva && (
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                  TVA : {prestataire.numeroTva}
                </p>
              )}
            </div>
            {(prestataire.adresseLigne1 ||
              prestataire.codePostal ||
              prestataire.ville) && (
              <div className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div className="text-sm">
                  {prestataire.adresseLigne1 && (
                    <p>{prestataire.adresseLigne1}</p>
                  )}
                  {prestataire.adresseLigne2 && (
                    <p>{prestataire.adresseLigne2}</p>
                  )}
                  {(prestataire.codePostal || prestataire.ville) && (
                    <p>
                      {prestataire.codePostal} {prestataire.ville}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services offerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <HandPlatter className="text-primary h-4 w-4" />
                Services
              </CardTitle>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setEditServicesOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {prestataire.services.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                Aucun service renseigné.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {prestataire.services.map((s) => (
                  <span
                    key={s.id}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteContact(c.id)}
                    disabled={deletingId === c.id}
                  >
                    {deletingId === c.id ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
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
          targetEntrepriseId={prestataire.id}
          targetNom={prestataire.nom}
          side="prestataire"
          onSuccess={() => router.refresh()}
        />
      )}

      <EditEntrepriseInfosDialog
        open={editInfosOpen}
        onOpenChange={setEditInfosOpen}
        entrepriseId={prestataire.id}
        currentSiret={prestataire.siret}
        onSuccess={() => router.refresh()}
      />

      <EditPrestataireServicesDialog
        open={editServicesOpen}
        onOpenChange={setEditServicesOpen}
        prestataireEntrepriseId={prestataire.id}
        currentServiceIds={prestataire.services.map((s) => s.id)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
