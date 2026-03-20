import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useTheStore } from "@/stores/devis/theStore";
import { useEffect, useState } from "react";
import TheMobilePropositionCard from "./TheMobilePropositionCard";

type TheMobilePropositionsCarouselProps = {
  propositions: {
    totalAnnuel: number | null;
    infos: string | null;
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }[];
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }) => void;
  nbTassesParJour: number;
};

const TheMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
  nbTassesParJour,
}: TheMobilePropositionsCarouselProps) => {
  const the = useTheStore((s) => s.the);
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
    if (!the.infos.gammeSelected || !api) {
      return;
    }
    if (the.infos.gammeSelected) {
      api?.scrollTo(
        the.infos.gammeSelected === "essentiel"
          ? 0
          : the.infos.gammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [api, the.infos.gammeSelected]);

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
          <TheMobilePropositionCard
            proposition={proposition}
            key={proposition.id}
            handleClickProposition={handleClickProposition}
            nbTassesParJour={nbTassesParJour}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default TheMobilePropositionsCarousel;
