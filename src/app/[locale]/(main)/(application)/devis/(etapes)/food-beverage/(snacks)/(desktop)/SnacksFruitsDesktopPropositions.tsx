import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useTranslations } from "next-intl";
import SnacksFruitsPropositionCard from "./SnacksFruitsPropositionCard";
import SnacksFruitsPropositionLogo from "./SnacksFruitsPropositionLogo";

type SnacksFruitsDesktopPropositionsProps = {
  formattedPropositions: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    isSamePrestataire: boolean;
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
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    isSamePrestataire: boolean;
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
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);

  if (snacksFruits.infos.choix.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border">
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
    <div className="flex flex-1 flex-col overflow-auto rounded-xl border">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex flex-1 border-b"
              key={propositions[0].entrepriseId}
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
