import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import { getNettoyageOffres } from "@/lib/queries/nettoyage/getNettoyage";
import { SelectNettoyageProduitType } from "@/zod-schemas/nettoyageProduit";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import NettoyageFournisseurLogo from "./(desktop)/NettoyageFournisseurLogo";
import NettoyagePropositionCard from "./(desktop)/NettoyagePropositionCard";

type NettoyageLineProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageProduits: SelectNettoyageProduitType[];
};

const NettoyageLine = async ({
  nettoyageQuantites,
  nettoyageProduits,
}: NettoyageLineProps) => {
  const fournisseurId = nettoyageProduits[0]?.fournisseurId;
  const fournisseur = await getFournisseur(fournisseurId);
  const nettoyageOffres = await Promise.all(
    nettoyageProduits.map((nettoyageProduit) =>
      getNettoyageOffres(nettoyageProduit.id),
    ),
  );

  if (!fournisseur || nettoyageOffres.length === 0) {
    return null;
  }

  console.log("nettoyageQuantites", nettoyageQuantites);

  const propositions = nettoyageOffres.map((offre) => {
    const produit = nettoyageProduits.find(({ id }) => id === offre?.produitId);
    const gamme = produit?.gamme;
    const freqAnnuelle =
      nettoyageQuantites.find((quantite) => quantite.gamme === gamme)
        ?.freqAnnuelle ?? null;
    const totalAnnuel =
      freqAnnuelle && produit?.hParPassage && offre?.tauxHoraire
        ? freqAnnuelle * produit?.hParPassage * offre?.tauxHoraire
        : null;
    return {
      id: offre?.id,
      logoUrl: fournisseur.logoUrl,
      freqAnnuelle,
      hParPassage: produit?.hParPassage,
      gamme,
      totalAnnuel,
    };
  });

  const handleClickProposition = (proposition: {
    id: number | undefined;
    logoUrl: string | null;
    freqAnnuelle: number | null;
    hParPassage: number | undefined;
    gamme: "essentiel" | "confort" | "excellence" | undefined;
    totalAnnuel: number | null;
  }) => {};

  return (
    <div className="flex flex-1 border-b">
      <NettoyageFournisseurLogo {...fournisseur} />
      {propositions.map((proposition) => (
        <NettoyagePropositionCard
          key={proposition.id}
          proposition={proposition}
        />
      ))}
    </div>
  );
};

export default NettoyageLine;
