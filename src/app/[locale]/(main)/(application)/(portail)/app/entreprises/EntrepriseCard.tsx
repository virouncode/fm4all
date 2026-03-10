"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import {
  Building2,
  Calendar,
  Clock,
  HandPlatter,
  Mail,
  Phone,
  Send,
  User,
} from "lucide-react";
import { formatEntrepriseDate, getRoleBadgeStyles } from "./helpers";
import { LogoAvatar } from "./LogoAvatar";

type EntrepriseCardProps = {
  entreprise: EntrepriseWithDetails;
  onClick?: () => void;
  onInvite?: () => void;
};

export function EntrepriseCard({
  entreprise,
  onClick,
  onInvite,
}: EntrepriseCardProps) {
  const {
    id,
    nom,
    siret,
    prenomContact,
    nomContact,
    emailContact,
    phoneContact,
    roles,
    nbSites,
    createdAt,
    logoStorageKey,
    hasActiveAdmin,
    services,
    pendingInvitation,
  } = entreprise;

  const contactName =
    prenomContact || nomContact
      ? `${prenomContact ?? ""} ${nomContact ?? ""}`.trim()
      : null;

  const isClient = roles.includes("client");
  const isPrestataire = roles.includes("prestataire");

  return (
    <Card
      className={`flex h-full flex-col transition-colors ${onClick ? "hover:bg-accent cursor-pointer" : "cursor-default"}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={nom}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader className="flex-shrink-0 space-y-2 pb-2">
        {/* Avatar + Nom */}
        <div className="flex items-start gap-3">
          <LogoAvatar
            storageKey={logoStorageKey}
            proprietaireEntrepriseId={id}
            nom={nom}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base leading-tight font-semibold">
              {nom}
            </h3>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
              {siret}
            </p>
            {entreprise.numeroTva && (
              <p className="text-muted-foreground font-mono text-xs">
                TVA : {entreprise.numeroTva}
              </p>
            )}
          </div>
        </div>

        {/* Rôles */}
        {roles && roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => {
              const badge = getRoleBadgeStyles(role);
              return (
                <Badge
                  key={role}
                  variant="outline"
                  className={`text-xs ${badge.className}`}
                >
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1.5 text-sm">
        {/* Contact */}
        {contactName && (
          <div className="flex items-center gap-1.5 text-sm">
            <User className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-medium">{contactName}</span>
          </div>
        )}

        {emailContact && (
          <div className="flex items-center gap-1.5">
            <Mail className="text-primary h-3.5 w-3.5 shrink-0" />
            <a
              href={`mailto:${emailContact}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary truncate text-xs transition-colors"
            >
              {emailContact}
            </a>
          </div>
        )}

        {phoneContact && (
          <div className="flex items-center gap-1.5">
            <Phone className="text-primary h-3.5 w-3.5 shrink-0" />
            <a
              href={`tel:${phoneContact}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary text-xs transition-colors"
            >
              {phoneContact}
            </a>
          </div>
        )}

        {/* Services si prestataire */}
        {isPrestataire && services.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {services.map((s) => (
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

        {/* Bouton + footer groupés en bas */}
        <div className="mt-auto space-y-1.5">
          {!hasActiveAdmin && pendingInvitation && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Invité ({pendingInvitation.email})
              </span>
            </div>
          )}
          {!hasActiveAdmin && onInvite && (
            <Button
              size="sm"
              className="my-1.5 w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onInvite();
              }}
            >
              <Send className="h-3.5 w-3.5" />
              {pendingInvitation ? "Réinviter" : "Inviter"}
            </Button>
          )}

          {/* Footer : nb sites (si client) + date */}
          <div className="flex items-center gap-1.5 border-t pt-2">
            {isClient && (
              <>
                <Building2 className="text-primary h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">
                  {nbSites === 0
                    ? "Aucun site"
                    : `${nbSites} site${nbSites > 1 ? "s" : ""}`}
                </span>
              </>
            )}
            <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Créé le {formatEntrepriseDate(createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
