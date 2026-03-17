"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { OccurrenceListItem } from "@/server/queries/clientServiceExecutions.query";
import type { QuotaInfoType } from "@/server/queries/clientServices.query";
import type { PrestationListItem } from "@/zod-schemas/clientServices.schema";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex flex-shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link
              href={{
                pathname: "/app/prestations/[prestationId]",
                params: { prestationId: prestation.id },
                query: { tab: "interventions" },
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">
            {prestation.serviceNom}
            {prestation.siteNom && (
              <span className="text-muted-foreground ml-1 font-normal text-base">
                — {prestation.siteNom}
              </span>
            )}
          </h1>
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
