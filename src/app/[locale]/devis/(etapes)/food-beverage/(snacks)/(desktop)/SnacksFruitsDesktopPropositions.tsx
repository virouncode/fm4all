import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import SnacksFruitsPropositionCard from "./SnacksFruitsPropositionCard";
import SnacksFruitsPropositionLogo from "./SnacksFruitsPropositionLogo";

type SnacksFruitsDesktopPropositionsProps = {
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

const SnacksFruitsDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
}: SnacksFruitsDesktopPropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const { snacksFruits } = useContext(SnacksFruitsContext);

  if (snacksFruits.infos.choix.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-xl overflow-hidden">
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
    <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <SnacksFruitsPropositionLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <SnacksFruitsPropositionCard
                  key={proposition.id}
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

export default SnacksFruitsDesktopPropositions;
