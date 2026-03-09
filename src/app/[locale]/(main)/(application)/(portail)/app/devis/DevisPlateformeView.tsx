"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import { Suspense } from "react";
import { DevisDemandesTable } from "./DevisDemandesTable";
import { DevisTable } from "./DevisTable";

// Plateforme : lecture seule, toutes les colonnes, tous les tris
// Colonnes devis : emetteurNom + proprietaireNom (client) visibles
// Tri : complet (émetteur + client)
const DEVIS_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "dateEmission", label: "Date d'émission" },
  { value: "validTo", label: "Date de validité" },
  { value: "numero", label: "Numéro" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "siteNom", label: "Site" },
  { value: "emetteurEntrepriseNom", label: "Émetteur" },
  { value: "proprietaireEntrepriseNom", label: "Client" },
];

// Plateforme : toutes les demandes, colonne Client visible
// Tri : complet avec client
const DEMANDES_SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Date de modification" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "siteNom", label: "Site" },
  { value: "serviceNom", label: "Service" },
  { value: "proprietaireEntrepriseNom", label: "Client" },
];

type SearchParamsType = {
  tab?: string;
  statut?: string;
  clientId?: string;
  siteId?: string;
  emetteurId?: string;
  serviceId?: string;
  search?: string;
  orderBy?: string;
  orderDir?: string;
};

type DevisPlateformeViewProps = {
  activeTab: "demandes" | "propositions";
  searchParams: SearchParamsType;
};

export function DevisPlateformeView({
  activeTab,
  searchParams,
}: DevisPlateformeViewProps) {
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
        <TabsTrigger value="demandes">Toutes les demandes</TabsTrigger>
        <TabsTrigger value="propositions">Tous les devis</TabsTrigger>
      </TabsList>

      <TabsContent value="demandes" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisDemandesTable
            searchParams={searchParams}
            showNewButton={false}
            showClientColumn={true}
            showDevisCount={false}
            posture="plateforme"
            sortOptions={DEMANDES_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>

      <TabsContent value="propositions" className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement…</div>}>
          <DevisTable
            searchParams={searchParams}
            hideProprietaire={false}
            hideEmetteur={false}
            canCreate={false}
            posture="plateforme"
            sortOptions={DEVIS_SORT_OPTIONS}
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
