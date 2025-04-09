import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import SnacksFruitsMobilePropositionsCarousel from "./SnacksFruitsMobilePropositionsCarousel";

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
  const { snacksFruits } = useContext(SnacksFruitsContext);
  if (snacksFruits.infos.choix.length === 0) {
    return (
      <div className="flex flex-col gap-2 w-full text-fm4alldestructive">
        <p>{t("nous-navons-pas-doffres-correspondant-a-ces-criteres")}</p>
        <p>
          {tSnacks(
            "veuillez-choisir-au-moins-un-produit-parmi-fruits-snacks-et-boissons"
          )}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 w-full">
      {formattedPropositions.map((propositions) => (
        <SnacksFruitsMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].fournisseurId}
          handleClickProposition={handleClickProposition}
        />
      ))}
      <p className="text-xs text-end italic px-1">
        {tSnacks(
          "ce-fournisseur-vous-propose-une-reduction-de-8-car-vous-lavez-choisi-pour-le-cafe"
        )}
      </p>
    </div>
  );
};

export default SnacksFruitsMobilePropositions;
