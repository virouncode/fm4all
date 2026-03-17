"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { OccurrenceListItem } from "@/server/queries/clientServiceExecutions.query";
import type { QuotaInfoType } from "@/server/queries/clientServices.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { ArrowLeft, MapPin } from "lucide-react";
import { InterventionsTab } from "../InterventionsTab";

type InterventionsPageClientProps = {
  prestation: PrestationListItem;
  initialOccurrences: OccurrenceListItem[];
  totalOccurrences: number;
  availableSites: Array<{ id: string; nom: string }>;
  canManage: boolean;
  quotaInfo: QuotaInfoType | null;
};

export function InterventionsPageClient({
  prestation,
  initialOccurrences,
  totalOccurrences,
  availableSites,
  canManage,
  quotaInfo,
}: InterventionsPageClientProps) {
  const hasActiveExecution = true; // The page is only accessible when prestation.statut === "actif"

  return (
    <div className="container mx-auto flex h-full max-w-5xl flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-wrap items-start gap-4">
          {/* Titre + metadata */}
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight break-words">
              {prestation.serviceNom}
              <span className="text-muted-foreground font-normal">
                {" "}— Interventions
              </span>
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              {prestation.siteNom && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {prestation.siteNom}
                </span>
              )}
              <span className="text-muted-foreground/50 font-mono text-xs">
                #{prestation.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Bouton retour */}
          <Button variant="ghost" size="sm" asChild className="flex-shrink-0 gap-2">
            <Link
              href={{
                pathname: "/app/prestations/[prestationId]",
                params: { prestationId: prestation.id },
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la prestation
            </Link>
          </Button>
        </div>
      </div>

      {/* InterventionsTab prend tout l'espace restant */}
      <InterventionsTab
        initialOccurrences={initialOccurrences}
        totalOccurrences={totalOccurrences}
        prestation={prestation}
        availableSites={availableSites}
        canManage={canManage}
        quotaInfo={quotaInfo}
        hasActiveExecution={hasActiveExecution}
      />
    </div>
  );
}
