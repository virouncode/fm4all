"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  onClick?: () => void;
}

export function PrestationCard({
  prestation,
  showEntreprise,
  onClick,
}: PrestationCardProps) {
  const statutBadge = getPrestationStatutBadge(prestation.statut);
  const modeBadge = getModePlanningBadge(prestation.modePlanning);
  const frequenceLabel = getFrequenceLabel(
    prestation.frequence,
    prestation.frequenceParPeriode,
    prestation.intervalleJours,
  );

  return (
    <Card
      className="hover:bg-accent flex h-full cursor-pointer flex-col transition-colors"
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={`${prestation.serviceNom} — ${prestation.siteNom}`}
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
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{prestation.entrepriseNom}</span>
          </div>
        )}

        {/* Site */}
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 flex-shrink-0" />
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
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {prestation.dateDebut ? formatDate(prestation.dateDebut) : "—"}
              {" → "}
              {prestation.dateFin ? formatDate(prestation.dateFin) : "∞"}
            </span>
          </div>
        )}

        {/* Durée */}
        {prestation.dureeEstimeeMinutes && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDuree(prestation.dureeEstimeeMinutes)}</span>
          </div>
        )}

        {/* Notes */}
        {prestation.notes && (
          <p className="text-muted-foreground mt-auto line-clamp-2 text-sm">
            {prestation.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
