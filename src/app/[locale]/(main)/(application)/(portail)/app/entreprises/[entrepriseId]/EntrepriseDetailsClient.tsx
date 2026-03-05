"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";
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
  User,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEntrepriseDate, getRoleBadgeStyles } from "../helpers";
import { InviterEntrepriseAdminDialog } from "../InviterEntrepriseAdminDialog";
import { EditEntrepriseContactDialog } from "./EditEntrepriseContactDialog";
import { EditEntrepriseInfosDialog } from "./EditEntrepriseInfosDialog";
import { EditEntrepriseLogoDialog } from "./EditEntrepriseLogoDialog";
import { EditEntrepriseRolesDialog } from "./EditEntrepriseRolesDialog";

type ServiceItem = { serviceId: string; nom: string };

type EntrepriseDetailsClientProps = {
  entreprise: EntrepriseWithDetails;
  services: ServiceItem[];
  logoUrl: string | null;
  logoStorageKey: string | null;
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
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [editRolesOpen, setEditRolesOpen] = useState(false);
  const [editLogoOpen, setEditLogoOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

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
      {/* Header — même structure que TicketDetailsClient */}
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

            {canEdit && !entreprise.hasActiveAdmin && (
              <Button
                size="sm"
                className="min-w-30 gap-2"
                onClick={() => setInviteOpen(true)}
              >
                <Send className="h-4 w-4" />
                {entreprise.pendingInvitation ? "Réinviter" : "Inviter"}
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

      {/* Section Informations — Grid 2 colonnes */}
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
                  className="text-muted-foreground hover:text-foreground h-8 gap-1.5"
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
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <User className="text-primary h-4 w-4" />
                Contact
              </CardTitle>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 gap-1.5"
                  onClick={() => setEditContactOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(entreprise.prenomContact || entreprise.nomContact) && (
              <div className="flex items-center gap-2">
                <User className="text-primary h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  {entreprise.prenomContact} {entreprise.nomContact}
                </span>
              </div>
            )}
            {entreprise.phoneContact ? (
              <a
                href={`tel:${entreprise.phoneContact}`}
                className="hover:text-primary group flex items-center gap-2 text-sm transition-colors"
              >
                <Phone className="text-primary h-4 w-4 flex-shrink-0" />
                <span>{entreprise.phoneContact}</span>
              </a>
            ) : null}
            {entreprise.emailContact ? (
              <a
                href={`mailto:${entreprise.emailContact}`}
                className="hover:text-primary group flex items-center gap-2 text-sm transition-colors"
              >
                <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                <span className="truncate">{entreprise.emailContact}</span>
              </a>
            ) : null}
            {!entreprise.prenomContact &&
              !entreprise.nomContact &&
              !entreprise.phoneContact &&
              !entreprise.emailContact && (
                <p className="text-muted-foreground text-sm italic">
                  Aucun contact renseigné
                </p>
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
                  className="text-muted-foreground hover:text-foreground h-8 gap-1.5"
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
                    className="bg-primary/10 text-primary border-primary/40 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
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

      {/* Dialog invitation administrateur */}
      <InviterEntrepriseAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        entrepriseId={entreprise.id}
        entrepriseNom={entreprise.nom}
        defaultEmail={entreprise.emailContact}
        onSuccess={handleUpdate}
      />

      {/* Dialogs — uniquement si l'utilisateur peut éditer */}
      {canEdit && (
        <>
          <EditEntrepriseInfosDialog
            open={editInfosOpen}
            onOpenChange={setEditInfosOpen}
            entrepriseId={entreprise.id}
            currentNom={entreprise.nom}
            currentSiret={entreprise.siret}
            onSuccess={handleUpdate}
          />

          <EditEntrepriseContactDialog
            open={editContactOpen}
            onOpenChange={setEditContactOpen}
            entrepriseId={entreprise.id}
            currentPrenomContact={entreprise.prenomContact}
            currentNomContact={entreprise.nomContact}
            currentEmailContact={entreprise.emailContact}
            currentPhoneContact={entreprise.phoneContact}
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
