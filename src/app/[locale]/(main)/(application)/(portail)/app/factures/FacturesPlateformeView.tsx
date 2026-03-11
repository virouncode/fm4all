"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { Suspense } from "react";
import { FacturesTable } from "./FacturesTable";

// Plateforme — factures émises : tous les émetteurs, tous les destinataires
const EMISES_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Date de modification" },
  { value: "dateEmission", label: "Date d'émission" },
  { value: "dateEcheance", label: "Date d'échéance" },
  { value: "numero", label: "Numéro" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "montantTtc", label: "Montant TTC" },
  { value: "siteNom", label: "Site" },
  { value: "emetteurEntrepriseNom", label: "Émetteur" },
  { value: "destinataireEntrepriseNom", label: "Client" },
];

// Plateforme — factures reçues : statut emise uniquement
const RECUES_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "dateEmission", label: "Date d'émission" },
  { value: "dateEcheance", label: "Date d'échéance" },
  { value: "numero", label: "Numéro" },
  { value: "titre", label: "Titre" },
  { value: "montantTtc", label: "Montant TTC" },
  { value: "siteNom", label: "Site" },
  { value: "emetteurEntrepriseNom", label: "Émetteur" },
  { value: "destinataireEntrepriseNom", label: "Client" },
];

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

type FacturesPlateformeViewProps = {
  activeTab: "emises" | "recues";
  searchParams: SearchParamsType;
};

export function FacturesPlateformeView({
  activeTab,
  searchParams,
}: FacturesPlateformeViewProps) {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    router.replace({ pathname: "/app/factures", query: { tab } });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <TabsList className="mb-4 flex-shrink-0 self-start">
        <TabsTrigger value="emises">Toutes les factures émises</TabsTrigger>
        <TabsTrigger value="recues">Toutes les factures reçues</TabsTrigger>
      </TabsList>

      <TabsContent value="emises" className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <FacturesTable
            tabType="emises"
            searchParams={searchParams}
            hideEmetteur={false}
            hideDestinataire={false}
            canCreate={true}
            posture="plateforme"
            sortOptions={EMISES_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="recues" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <FacturesTable
            tabType="recues"
            searchParams={searchParams}
            hideEmetteur={false}
            hideDestinataire={false}
            canCreate={false}
            posture="plateforme"
            sortOptions={RECUES_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
