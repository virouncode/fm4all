import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { GammeType } from "@/zod-schemas/gamme";
import { useEffect, useState } from "react";
import NettoyageMobilePropositionCard from "./NettoyageMobilePropositionCard";

type NettoyageMobilePropositionsCarouselProps = {
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => void;
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }[];
};

const NettoyageMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
}: NettoyageMobilePropositionsCarouselProps) => {
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
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
    if (!nettoyage.infos.fournisseurId || !api) {
      return;
    }
    if (
      propositions[0].fournisseurId === nettoyage.infos.fournisseurId &&
      nettoyage.infos.gammeSelected
    ) {
      api?.scrollTo(
        nettoyage.infos.gammeSelected === "essentiel"
          ? 0
          : nettoyage.infos.gammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [
    api,
    nettoyage.infos.fournisseurId,
    nettoyage.infos.gammeSelected,
    propositions,
  ]);
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative w-full"
      setApi={setApi}
    >
      <CarouselContent>
        {propositions.map((proposition) => (
          <NettoyageMobilePropositionCard
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

export default NettoyageMobilePropositionsCarousel;
