"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { Suspense } from "react";
import { FacturesTable } from "./FacturesTable";

// Prestataire — factures émises : lui est l'émetteur, affiche le destinataire (client)
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
  { value: "destinataireEntrepriseNom", label: "Client" },
];

// Prestataire — factures reçues : lui est le destinataire, affiche l'émetteur
const RECUES_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "dateEmission", label: "Date d'émission" },
  { value: "dateEcheance", label: "Date d'échéance" },
  { value: "numero", label: "Numéro" },
  { value: "titre", label: "Titre" },
  { value: "montantTtc", label: "Montant TTC" },
  { value: "siteNom", label: "Site" },
  { value: "emetteurEntrepriseNom", label: "Émetteur" },
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

type FacturesPrestaireViewProps = {
  activeTab: "emises" | "recues";
  searchParams: SearchParamsType;
};

export function FacturesPrestaireView({
  activeTab,
  searchParams,
}: FacturesPrestaireViewProps) {
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
        <TabsTrigger value="emises">Factures émises</TabsTrigger>
        <TabsTrigger value="recues">Factures reçues</TabsTrigger>
      </TabsList>

      <TabsContent value="emises" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <FacturesTable
            tabType="emises"
            searchParams={searchParams}
            hideEmetteur={true}
            hideDestinataire={false}
            canCreate={true}
            posture="prestataire"
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
            hideDestinataire={true}
            canCreate={false}
            posture="prestataire"
            sortOptions={RECUES_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
