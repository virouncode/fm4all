import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DevisAvecDetails } from "@/server/queries/devis.query";
import { Building2, Calendar, MapPin } from "lucide-react";
import { formatDevisDate, formatMontantHt, getDevisStatutBadge } from "./helpers";

type DevisCardProps = {
  devis: DevisAvecDetails;
  hideProprietaire?: boolean;
  onClick?: () => void;
};

export function DevisCard({ devis, hideProprietaire = false, onClick }: DevisCardProps) {
  const badge = getDevisStatutBadge(devis.statut);

  return (
    <Card
      className="flex h-full cursor-pointer flex-col transition-colors hover:bg-accent"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={devis.titre}
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
      <CardHeader className="flex-shrink-0 space-y-1.5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {devis.numero && (
              <span className="text-muted-foreground font-mono text-xs">
                {devis.numero}
              </span>
            )}
            <h3 className="line-clamp-2 text-base font-semibold">
              {devis.titre}
            </h3>
          </div>
          <Badge className={`flex-shrink-0 text-xs ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="size-3 shrink-0" />
          Créé le {formatDevisDate(devis.createdAt)}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col text-sm">
        <div className="flex-grow space-y-1">
          {devis.siteNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Site :</span>
              <span className="truncate font-medium">{devis.siteNom}</span>
            </div>
          )}
          {devis.emetteurEntrepriseNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Émetteur :</span>
              <span className="truncate font-medium">
                {devis.emetteurEntrepriseNom}
              </span>
            </div>
          )}
          {devis.dateEmission && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Émis le :</span>
              <span className="font-medium">
                {formatDevisDate(devis.dateEmission)}
              </span>
            </div>
          )}
          {devis.validTo && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">
                Valide jusqu'au :
              </span>
              <span className="font-medium">
                {formatDevisDate(devis.validTo)}
              </span>
            </div>
          )}
        </div>

        <div className="text-muted-foreground mt-2 flex items-center justify-between border-t pt-2 text-xs">
          {!hideProprietaire && (
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{devis.proprietaireEntrepriseNom}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{devis.siteNom}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
