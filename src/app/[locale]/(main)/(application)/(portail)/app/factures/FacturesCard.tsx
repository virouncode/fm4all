import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FactureAvecDetails } from "@/server/queries/factures.query";
import { Calendar, Clock } from "lucide-react";
import { formatFactureDate, formatMontantTtc, getFactureStatutBadge } from "./helpers";

type FacturesCardProps = {
  facture: FactureAvecDetails;
  hideEmetteur?: boolean;
  hideDestinataire?: boolean;
  onClick?: () => void;
};

export function FacturesCard({
  facture,
  hideEmetteur = false,
  hideDestinataire = false,
  onClick,
}: FacturesCardProps) {
  const badge = getFactureStatutBadge(facture.statut);

  return (
    <Card
      className="flex h-full cursor-pointer flex-col transition-colors hover:bg-accent"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={facture.titre}
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
            {facture.numero && (
              <span className="text-muted-foreground font-mono text-xs">
                Facture n° {facture.numero}
              </span>
            )}
            <h3 className="line-clamp-2 text-base font-semibold">
              {facture.titre}
            </h3>
          </div>
          <Badge className={`flex-shrink-0 text-xs ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="size-3 shrink-0" />
          Créé le {formatFactureDate(facture.createdAt)}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col text-sm">
        <div className="flex-grow space-y-1">
          {!hideEmetteur && facture.emetteurEntrepriseNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Émetteur :</span>
              <span className="truncate font-medium">
                {facture.emetteurEntrepriseNom}
              </span>
            </div>
          )}

          {!hideDestinataire && facture.destinataireEntrepriseNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Client :</span>
              <span className="truncate font-medium">
                {facture.destinataireEntrepriseNom}
              </span>
            </div>
          )}

          {facture.siteNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Site :</span>
              <span className="truncate font-medium">{facture.siteNom}</span>
            </div>
          )}

          {facture.dateEmission && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Émis le :</span>
              <span className="font-medium">
                {formatFactureDate(facture.dateEmission)}
              </span>
            </div>
          )}

          {facture.dateEcheance && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Échéance :</span>
              <span className="font-medium">
                {formatFactureDate(facture.dateEcheance)}
              </span>
            </div>
          )}

          <div className="flex gap-1.5">
            <span className="text-muted-foreground shrink-0">Montant TTC :</span>
            <span className="font-semibold">
              {formatMontantTtc(facture.montantTtc)}
            </span>
          </div>

          {facture.description && (
            <p className="text-muted-foreground mt-1.5 line-clamp-3 text-xs">
              {facture.description}
            </p>
          )}
        </div>

        <div className="text-muted-foreground mt-2 flex items-center gap-1.5 border-t pt-2 text-xs">
          <Clock className="size-3 shrink-0" />
          Modifié le {formatFactureDate(facture.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );
}
