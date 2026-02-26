"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { type PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { Building, Calendar, Clock, MapPin } from "lucide-react";
import {
  formatDate,
  formatDuree,
  getFrequenceLabel,
  getModePlanningBadge,
  getPrestationStatutBadge,
} from "./helpers";

interface PrestationCardProps {
  prestation: PrestationListItem;
  showEntreprise: boolean;
}

export function PrestationCard({
  prestation,
  showEntreprise,
}: PrestationCardProps) {
  const statutBadge = getPrestationStatutBadge(prestation.statut);
  const modeBadge = getModePlanningBadge(prestation.modePlanning);
  const frequenceLabel = getFrequenceLabel(
    prestation.frequence,
    prestation.frequenceParPeriode,
    prestation.intervalleJours,
  );

  return (
    <Link
      href={{
        pathname: "/app/prestations/[prestationId]",
        params: { prestationId: prestation.id },
      }}
      className="block h-full"
    >
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="flex-shrink-0 space-y-2 pb-3">
          {/* Titre + statut */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-base font-semibold">
              {prestation.serviceNom}
            </h3>
            <Badge className={`flex-shrink-0 text-xs ${statutBadge.className}`}>
              {statutBadge.label}
            </Badge>
          </div>

          {/* Client (posture plateforme) */}
          {showEntreprise && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{prestation.entrepriseNom}</span>
            </div>
          )}

          {/* Site */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{prestation.siteNom}</span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          {/* Fréquence + Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">{frequenceLabel}</span>
            <Badge className={`text-xs ${modeBadge.className}`}>
              {modeBadge.label}
            </Badge>
          </div>

          {/* Dates */}
          {(prestation.dateDebut || prestation.dateFin) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {prestation.dateDebut ? formatDate(prestation.dateDebut) : "—"}
                {" → "}
                {prestation.dateFin ? formatDate(prestation.dateFin) : "∞"}
              </span>
            </div>
          )}

          {/* Durée */}
          {prestation.dureeEstimeeMinutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDuree(prestation.dureeEstimeeMinutes)}</span>
            </div>
          )}

          {/* Notes */}
          {prestation.notes && (
            <p className="mt-auto line-clamp-2 text-sm text-muted-foreground">
              {prestation.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
