import { getFournisseur } from "@/lib/queries/fournisseurs/getFournisseurs";
import { getNettoyageOffres } from "@/lib/queries/nettoyage/getNettoyage";
import { getPanier } from "@/lib/queries/panier/getPanier";
import { SelectNettoyageProduitType } from "@/zod-schemas/nettoyageProduit";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import NettoyageList from "./NettoyageList";

type NettoyageProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageProduits: SelectNettoyageProduitType[];
};

const Nettoyage = async ({
  nettoyageQuantites,
  nettoyageProduits,
}: NettoyageProps) => {
  const panier = await getPanier();

  const fournisseursIds = [
    ...new Set(nettoyageProduits.map((p) => p.fournisseurId)),
  ];

  //Regrouper les offres par fournisseur (par ligne)
  const lines = await Promise.all(
    fournisseursIds.map(async (fid) => {
      const produits = nettoyageProduits.filter((p) => p.fournisseurId === fid);
      const fournisseur = await getFournisseur(fid);
      const offres = await Promise.all(
        produits.map((p) => getNettoyageOffres(p.id)),
      );

      const propositions = offres.map((offre, i) => {
        const produit = produits[i];
        const gamme = produit?.gamme;
        const freqAnnuelle =
          nettoyageQuantites.find((q) => q.gamme === gamme)?.freqAnnuelle ??
          null;
        const totalAnnuel =
          freqAnnuelle && produit?.hParPassage && offre?.tauxHoraire
            ? freqAnnuelle * produit.hParPassage * offre.tauxHoraire
            : null;

        return {
          id: offre?.id ?? undefined,
          logoUrl: fournisseur?.logoUrl ?? null,
          freqAnnuelle,
          hParPassage: produit?.hParPassage,
          gamme,
          totalAnnuel,
        };
      });

      return {
        fournisseur,
        propositions: propositions.filter((p) => p.id != null),
      };
    }),
  );

  //Offre déjà dans le panier
  const initialSelectedId = Object.keys(panier ?? {})
    .find((k) => k.startsWith("Nettoyage:"))
    ?.split(":")[1];

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      <NettoyageList
        lines={lines.filter((l) => l.fournisseur)}
        initialSelectedId={initialSelectedId}
      />
    </div>
  );
};
export default Nettoyage;
