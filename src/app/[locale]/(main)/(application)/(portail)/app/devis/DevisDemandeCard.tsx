import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DevisDemandeAvecDetails } from "@/server/queries/devisDemandes.query";
import { Building2, Calendar, FileText } from "lucide-react";
import { formatDevisDate, getDevisDemandeStatutBadge } from "./helpers";

type DevisDemandeCardProps = {
  demande: DevisDemandeAvecDetails;
  onClick?: () => void;
};

export function DevisDemandeCard({ demande, onClick }: DevisDemandeCardProps) {
  const badge = getDevisDemandeStatutBadge(demande.statut);

  return (
    <Card
      className="flex h-full cursor-pointer flex-col transition-colors hover:bg-accent"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={demande.titre}
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
          <h3 className="line-clamp-2 flex-1 text-base font-semibold">
            {demande.titre}
          </h3>
          <Badge className={`flex-shrink-0 text-xs ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>

        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="size-3 shrink-0" />
          Créé le {formatDevisDate(demande.createdAt)}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col text-sm">
        <div className="flex-grow space-y-1">
          {demande.siteNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Site :</span>
              <span className="truncate font-medium">{demande.siteNom}</span>
            </div>
          )}
          {demande.serviceNom && (
            <div className="flex gap-1.5">
              <span className="text-muted-foreground shrink-0">Service :</span>
              <span className="truncate font-medium">{demande.serviceNom}</span>
            </div>
          )}
          {demande.description && (
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
              {demande.description}
            </p>
          )}
        </div>

        <div className="text-muted-foreground mt-2 flex items-center justify-between border-t pt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3 shrink-0" />
            {demande.createdByPrenom
              ? `${demande.createdByPrenom} ${demande.createdByNom ?? ""}`.trim()
              : "—"}
          </div>
          {demande.devisCount > 0 && (
            <div className="flex items-center gap-1.5">
              <FileText className="size-3 shrink-0" />
              <Badge variant="outline" className="text-xs">
                {demande.devisCount} devis
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
