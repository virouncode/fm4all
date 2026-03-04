"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import { Building2, Mail, Phone } from "lucide-react";
import { formatEntrepriseDate, getRoleBadgeStyles } from "./helpers";
import { LogoAvatar } from "./LogoAvatar";

type EntrepriseCardProps = {
  entreprise: EntrepriseWithDetails;
  onClick?: () => void;
};

export function EntrepriseCard({ entreprise, onClick }: EntrepriseCardProps) {
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
  } = entreprise;

  const contactName =
    prenomContact || nomContact
      ? `${prenomContact ?? ""} ${nomContact ?? ""}`.trim()
      : null;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent h-full flex flex-col"
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
      <CardHeader className="pb-2 space-y-2 flex-shrink-0">
        {/* Avatar + Nom */}
        <div className="flex items-start gap-3">
          <LogoAvatar
            storageKey={logoStorageKey}
            proprietaireEntrepriseId={id}
            nom={nom}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 leading-tight">
              {nom}
            </h3>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              {siret}
            </p>
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

      <CardContent className="flex flex-col text-sm flex-1 gap-1.5">
        {/* Contact */}
        {contactName && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-foreground shrink-0">
              {contactName}
            </span>
          </div>
        )}

        {emailContact && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate text-xs">
              {emailContact}
            </span>
          </div>
        )}

        {phoneContact && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-xs">{phoneContact}</span>
          </div>
        )}

        {/* Nb sites */}
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            {nbSites === 0
              ? "Aucun site"
              : `${nbSites} site${nbSites > 1 ? "s" : ""}`}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            Créé le {formatEntrepriseDate(createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
