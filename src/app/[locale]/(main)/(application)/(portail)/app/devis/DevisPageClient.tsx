"use client";

import { useAppStore } from "@/stores/application/appStore";
import { DevisClientView } from "./DevisClientView";
import { DevisPlateformeView } from "./DevisPlateformeView";
import { DevisPrestaireView } from "./DevisPrestaireView";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  siteId?: string;
  clientId?: string;
  emetteurId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type DevisPageClientProps = {
  activeTab: "demandes" | "propositions";
  searchParams: SearchParamsType;
};

export function DevisPageClient({
  activeTab,
  searchParams,
}: DevisPageClientProps) {
  const posture = useAppStore((state) => state.postureActive);

  if (posture === "prestataire") {
    return (
      <DevisPrestaireView activeTab={activeTab} searchParams={searchParams} />
    );
  }

  if (posture === "plateforme") {
    return (
      <DevisPlateformeView activeTab={activeTab} searchParams={searchParams} />
    );
  }

  return <DevisClientView activeTab={activeTab} searchParams={searchParams} />;
}
