"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EntrepriseWithDetails } from "@/zod-schemas/entreprise.schema";
import { Building2, Calendar, HandPlatter } from "lucide-react";
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
    adresseLigne1,
    adresseLigne2,
    codePostal,
    ville,
    formeJuridique,
    numeroTva,
    roles,
    nbSites,
    createdAt,
    logoStorageKey,
    services,
  } = entreprise;

  const isClient = roles.includes("client");
  const isPrestataire = roles.includes("prestataire");

  const adresseParts = [
    adresseLigne1,
    adresseLigne2,
    codePostal || ville ? `${codePostal ?? ""} ${ville ?? ""}`.trim() : null,
  ].filter(Boolean);

  return (
    <>
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
                SIRET: {siret}
              </p>
              {formeJuridique && (
                <p className="text-muted-foreground text-xs">
                  {formeJuridique}
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
          {/* Adresse */}
          <div className="text-xs">
            <span className="text-muted-foreground">Adresse : </span>
            <span
              className={
                adresseParts.length === 0 ? "text-muted-foreground" : undefined
              }
            >
              {adresseParts.length > 0 ? adresseParts.join(", ") : "N/A"}
            </span>
          </div>

          {/* N° TVA */}
          <div className="text-xs">
            <span className="text-muted-foreground">N° TVA : </span>
            <span
              className={`font-mono${!numeroTva ? "text-muted-foreground" : ""}`}
            >
              {numeroTva ?? "N/A"}
            </span>
          </div>

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

          {/* Footer */}
          <div className="mt-auto space-y-1.5">
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
    </>
  );
}
