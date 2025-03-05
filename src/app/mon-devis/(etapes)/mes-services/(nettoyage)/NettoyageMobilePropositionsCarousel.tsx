import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
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
  return (
    <>
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
            <NettoyageMobilePropositionCard
              proposition={proposition}
              key={proposition.id}
              handleClickProposition={handleClickProposition}
            />
          ))}
        </CarouselContent>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {[...Array(3)].map((_, index) => {
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-full border-white border ${
                  currentIndex === index ? "bg-fm4allsecondary" : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </Carousel>
    </>
  );
};

export default NettoyageMobilePropositionsCarousel;
