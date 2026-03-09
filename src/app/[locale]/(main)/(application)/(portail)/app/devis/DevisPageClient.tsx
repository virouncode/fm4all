"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { Suspense } from "react";
import { DevisDemandesTable } from "./DevisDemandesTable";
import { DevisTable } from "./DevisTable";

type SearchParamsType = {
  tab?: string;
  statut?: string;
  siteId?: string;
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
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    // Reset filters/sort when switching tabs, only keep tab param
    router.replace({
      pathname: "/app/devis",
      query: { tab },
    });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <TabsList className="mb-4 flex-shrink-0 self-start">
        <TabsTrigger value="demandes">Demandes de devis</TabsTrigger>
        <TabsTrigger value="propositions">Devis reçus</TabsTrigger>
      </TabsList>

      <TabsContent value="demandes" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisDemandesTable searchParams={searchParams} />
        </Suspense>
      </TabsContent>

      <TabsContent value="propositions" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisTable searchParams={searchParams} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
