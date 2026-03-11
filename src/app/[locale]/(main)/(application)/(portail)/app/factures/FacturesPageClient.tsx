"use client";

import { useAppStore } from "@/stores/application/appStore";
import { FacturesClientView } from "./FacturesClientView";
import { FacturesPlateformeView } from "./FacturesPlateformeView";
import { FacturesPrestaireView } from "./FacturesPrestaireView";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  modeCommercialSnapshot?: string;
  siteId?: string;
  clientId?: string;
  emetteurId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type FacturesPageClientProps = {
  activeTab: "emises" | "recues";
  searchParams: SearchParamsType;
};

export function FacturesPageClient({
  activeTab,
  searchParams,
}: FacturesPageClientProps) {
  const posture = useAppStore((state) => state.postureActive);

  if (posture === "prestataire") {
    return (
      <FacturesPrestaireView activeTab={activeTab} searchParams={searchParams} />
    );
  }

  if (posture === "plateforme") {
    return (
      <FacturesPlateformeView activeTab={activeTab} searchParams={searchParams} />
    );
  }

  return <FacturesClientView searchParams={searchParams} />;
}
