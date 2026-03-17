import { OccurrenceTerrain } from "./OccurrenceTerrain";

// ---------------------------------------------------------------------------
// MOCK DATA — sera remplacé par la vraie requête DB une fois le token vérifié
// ---------------------------------------------------------------------------

const MOCK_OCCURRENCE = {
  id: "mock-occurrence-id",
  serviceNom: "Nettoyage & Propreté",
  siteNom: "Tour Montparnasse",
  siteAdresse: "33 Avenue du Maine, 75015 Paris",
  dateDebutPrevue: new Date(Date.now() + 1000 * 60 * 30), // dans 30 min
  dateFinPrevue: new Date(Date.now() + 1000 * 60 * 60 * 4), // dans 4h
  statut: "planifiee" as const,
  notes: "Accès par l'entrée de service, badge remis par le gardien.",
};

const MOCK_TACHES = [
  {
    id: "t1",
    ordre: 1,
    titre: "Aspirer zone open space A",
    description: "Passer l'aspirateur sur toute la surface, y compris sous les bureaux.",
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
  {
    id: "t2",
    ordre: 2,
    titre: "Aspirer zone open space B",
    description: "Passer l'aspirateur sur toute la surface, y compris sous les bureaux.",
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
  {
    id: "t3",
    ordre: 3,
    titre: "Vider les poubelles — couloir principal",
    description: null,
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
  {
    id: "t4",
    ordre: 4,
    titre: "Nettoyer les sanitaires hommes (3e étage)",
    description: "Cuvettes, lavabos, miroirs, sol. Recharger le savon si nécessaire.",
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
  {
    id: "t5",
    ordre: 5,
    titre: "Nettoyer les sanitaires femmes (3e étage)",
    description: "Cuvettes, lavabos, miroirs, sol. Recharger le savon si nécessaire.",
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
  {
    id: "t6",
    ordre: 6,
    titre: "Recharger distributeurs savon — kitchenette",
    description: null,
    statut: "a_faire" as const,
    piecesJointes: [] as string[],
  },
];

export default async function TerrainPage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token } = await params;

  return (
    <OccurrenceTerrain
      token={token}
      occurrence={MOCK_OCCURRENCE}
      taches={MOCK_TACHES}
    />
  );
}
