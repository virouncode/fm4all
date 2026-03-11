"use client";

import { Suspense } from "react";
import { FacturesTable } from "./FacturesTable";

// Client : factures reçues uniquement (emise), tri sans émetteur (c'est eux le destinataire)
const SORT_OPTIONS = [
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

type FacturesClientViewProps = {
  searchParams: SearchParamsType;
};

export function FacturesClientView({ searchParams }: FacturesClientViewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Suspense fallback={<div>Chargement…</div>}>
        <FacturesTable
          tabType="recues"
          searchParams={searchParams}
          hideEmetteur={false}
          hideDestinataire={true}
          canCreate={false}
          posture="client"
          sortOptions={SORT_OPTIONS}
        />
      </Suspense>
    </div>
  );
}
