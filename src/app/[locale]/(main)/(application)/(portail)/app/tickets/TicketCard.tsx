import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import {
  formatTicketDate,
  getTicketStatutBadge,
  getTicketPrioriteBadge,
  getTicketTypeLabel,
} from "./helpers";

type EntrepriseMinimal = { id: string; nom: string };

interface TicketCardProps {
  ticket: SelectTicketType;
  sites: SelectSiteType[];
  entreprises: EntrepriseMinimal[];
  onClick?: () => void;
}

export function TicketCard({
  ticket,
  sites,
  entreprises,
  onClick,
}: TicketCardProps) {
  const site = sites.find((s) => s.id === ticket.siteId);
  const proprietaire = entreprises.find(
    (e) => e.id === ticket.proprietaireEntrepriseId,
  );
  const demandeur = entreprises.find(
    (e) => e.id === ticket.demandeurEntrepriseId,
  );
  const assigne = entreprises.find((e) => e.id === ticket.assigneEntrepriseId);

  const statutBadge = getTicketStatutBadge(ticket.statut);
  const prioriteBadge = getTicketPrioriteBadge(ticket.priorite);
  const typeLabel = getTicketTypeLabel(ticket.type);

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent h-full flex flex-col"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={ticket.titre}
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
      <CardHeader className="pb-2 space-y-1.5 flex-shrink-0">
        {/* Titre et statut */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2 flex-1">
            {ticket.titre}
          </h3>
          <Badge className={`text-xs flex-shrink-0 ${statutBadge.className}`}>
            {statutBadge.label}
          </Badge>
        </div>

        {/* Date de création */}
        <div className="text-xs text-muted-foreground">
          Créé le {formatTicketDate(ticket.createdAt)}
        </div>

        {/* Badges priorité et type */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs ${prioriteBadge.className}`}>
            {prioriteBadge.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {typeLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col text-sm flex-1">
        {/* Description */}
        {ticket.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {ticket.description}
          </p>
        )}

        {/* Informations principales */}
        <div className="space-y-1 flex-grow">
          {proprietaire && (
            <div className="flex gap-1.5">
              <span className="font-medium text-foreground shrink-0">
                Client:
              </span>
              <span className="text-muted-foreground truncate">
                {proprietaire.nom}
              </span>
            </div>
          )}

          {site && (
            <div className="flex gap-1.5">
              <span className="font-medium text-foreground shrink-0">
                Site:
              </span>
              <span className="text-muted-foreground truncate">
                {site.nom}
              </span>
            </div>
          )}

          {demandeur && (
            <div className="flex gap-1.5">
              <span className="font-medium text-foreground shrink-0">
                Demandeur:
              </span>
              <span className="text-muted-foreground truncate">
                {demandeur.nom}
              </span>
            </div>
          )}

          <div className="flex gap-1.5">
            <span className="font-medium text-foreground shrink-0">
              Prestataire:
            </span>
            {assigne ? (
              <span className="text-muted-foreground truncate">
                {assigne.nom}
              </span>
            ) : (
              <span className="text-muted-foreground/60">Non assigné</span>
            )}
          </div>
        </div>

        {/* Dernière activité - hauteur fixe */}
        <div className="pt-2 mt-2 border-t text-xs text-muted-foreground min-h-[1.5rem] flex items-center">
          Dernière activité: {formatTicketDate(ticket.lastActivityAt)}
        </div>
      </CardContent>
    </Card>
  );
}
