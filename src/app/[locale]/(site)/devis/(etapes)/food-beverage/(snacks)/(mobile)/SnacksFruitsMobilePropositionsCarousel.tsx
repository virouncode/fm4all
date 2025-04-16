import CarouselGammesDots from "@/components/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { useContext, useEffect, useState } from "react";
import SnacksFruitsMobilePropositionCard from "./SnacksFruitsMobilePropositionCard";

type SnacksFruitsMobilePropositionsCarouselProps = {
  propositions: {
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
  }[];
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

const SnacksFruitsMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
}: SnacksFruitsMobilePropositionsCarouselProps) => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (!api) {
      return;
    }
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!snacksFruits.infos.fournisseurId || !api) {
      return;
    }
    if (
      propositions[0].fournisseurId === snacksFruits.infos.fournisseurId &&
      snacksFruits.infos.gammeSelected
    ) {
      api?.scrollTo(
        snacksFruits.infos.gammeSelected === "essentiel"
          ? 0
          : snacksFruits.infos.gammeSelected === "confort"
            ? 1
            : 2
      );
    }
  }, [
    api,
    propositions,
    snacksFruits.infos.fournisseurId,
    snacksFruits.infos.gammeSelected,
  ]);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full relative"
      setApi={setApi}
    >
      <CarouselContent>
        {propositions.map((proposition) => (
          <SnacksFruitsMobilePropositionCard
            proposition={proposition}
            key={proposition.id}
            handleClickProposition={handleClickProposition}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default SnacksFruitsMobilePropositionsCarousel;
