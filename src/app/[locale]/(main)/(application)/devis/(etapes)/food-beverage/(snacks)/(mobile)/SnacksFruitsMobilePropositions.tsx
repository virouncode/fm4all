import { useTranslations } from "next-intl";
import SnacksFruitsMobilePropositionsCarousel from "./SnacksFruitsMobilePropositionsCarousel";
import { useSnacksFruitsStore } from "@/stores/snacksFruitsStore";

type SnacksFruitsMobilePropositionsProps = {
  formattedPropositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalSansRemise: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  }[][];
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalSansRemise: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  }) => void;
};

const SnacksFruitsMobilePropositions = ({
  formattedPropositions,
  handleClickProposition,
}: SnacksFruitsMobilePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  if (snacksFruits.infos.choix.length === 0) {
    return (
      <div className="text-fm4alldestructive flex w-full flex-col gap-2">
        <p>{t("nous-navons-pas-doffres-correspondant-a-ces-criteres")}</p>
        <p>
          {tSnacks(
            "veuillez-choisir-au-moins-un-produit-parmi-fruits-snacks-et-boissons",
          )}
        </p>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col gap-6">
      {formattedPropositions.map((propositions) => (
        <SnacksFruitsMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].fournisseurId}
          handleClickProposition={handleClickProposition}
        />
      ))}
      <p className="px-1 text-end text-xs italic">
        {tSnacks(
          "ce-fournisseur-vous-propose-une-reduction-de-8-car-vous-lavez-choisi-pour-le-cafe",
        )}
      </p>
    </div>
  );
};

export default SnacksFruitsMobilePropositions;
