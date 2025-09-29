import { SelectNettoyageProduitType } from "@/zod-schemas/nettoyageProduit";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import NettoyageLine from "./NettoyageLine";

type NettoyageProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageProduits: SelectNettoyageProduitType[];
};

const Nettoyage = async ({
  nettoyageQuantites,
  nettoyageProduits,
}: NettoyageProps) => {
  const fournisseursIds = [
    ...new Set(nettoyageProduits.map((p) => p.fournisseurId)),
  ];
  const nettoyageProduitsByFournisseur = fournisseursIds.map((id) =>
    nettoyageProduits.filter((p) => p.fournisseurId === id),
  );

  console.log("nettoyageProduitsByFournisseur", nettoyageProduitsByFournisseur);

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      {fournisseursIds.length > 0
        ? nettoyageProduitsByFournisseur.map((nettoyageProduits) => (
            <NettoyageLine
              nettoyageProduits={nettoyageProduits}
              nettoyageQuantites={nettoyageQuantites}
              key={nettoyageProduits[0].fournisseurId}
            />
          ))
        : null}
    </div>
  );
};
export default Nettoyage;
