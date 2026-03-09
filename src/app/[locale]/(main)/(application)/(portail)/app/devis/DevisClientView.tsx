"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { Suspense } from "react";
import { DevisDemandesTable } from "./DevisDemandesTable";
import { DevisTable } from "./DevisTable";

// Colonnes devis reçus côté client :
// emetteurNom visible, proprietaireNom masqué (c'est eux)
// Pas de bouton "Nouveau devis"
// Tri : sans "Client" (proprietaireEntrepriseNom)
const DEVIS_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Date de modification" },
  { value: "dateEmission", label: "Date d'émission" },
  { value: "validTo", label: "Date de validité" },
  { value: "numero", label: "Numéro" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "siteNom", label: "Site" },
  { value: "emetteurEntrepriseNom", label: "Émetteur" },
];


// Colonnes demandes côté client :
// Pas de colonne Client (c'est eux), peuvent créer/modifier
// Tri : sans "Client"
const DEMANDES_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Date de modification" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "siteNom", label: "Site" },
  { value: "serviceNom", label: "Service" },
];

type SearchParamsType = {
  tab?: string;
  statut?: string;
  siteId?: string;
  emetteurId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type DevisClientViewProps = {
  activeTab: "demandes" | "propositions";
  searchParams: SearchParamsType;
};

export function DevisClientView({
  activeTab,
  searchParams,
}: DevisClientViewProps) {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    router.replace({ pathname: "/app/devis", query: { tab } });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <TabsList className="mb-4 flex-shrink-0 self-start">
        <TabsTrigger value="demandes">Mes demandes</TabsTrigger>
        <TabsTrigger value="propositions">Devis reçus</TabsTrigger>
      </TabsList>

      <TabsContent value="demandes" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisDemandesTable
            searchParams={searchParams}
            showNewButton={true}
            showClientColumn={false}
            showDevisCount={true}
            posture="client"
            sortOptions={DEMANDES_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="propositions" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisTable
            searchParams={searchParams}
            hideProprietaire={true}
            hideEmetteur={false}
            hideService={false}
            canCreate={false}
            posture="client"
            sortOptions={DEVIS_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
