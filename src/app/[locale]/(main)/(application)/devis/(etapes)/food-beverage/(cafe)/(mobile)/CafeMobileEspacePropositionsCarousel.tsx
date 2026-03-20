import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { useEffect, useState } from "react";
import { CafePropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(cafe)/(desktop)/CafeEspacePropositionCard";
import CafeMobileEspacePropositionCard from "./CafeMobileEspacePropositionCard";

type CafeMobileEspacePropositionsCarouselProps = {
  espace: CafeEspaceType;
  propositions: CafePropositionItem[];
  handleClickProposition: (proposition: CafePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: CafePropositionItem) => void;
  cafeEspacesIds: number[];
};

const CafeMobileEspacePropositionsCarousel = ({
  espace,
  propositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  cafeEspacesIds,
}: CafeMobileEspacePropositionsCarouselProps) => {
  const cafe = useCafeStore((s) => s.cafe);
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
    if (!cafe.infos.entrepriseId && !api) {
      return;
    }
    if (
      propositions[0].entrepriseId === cafe.infos.entrepriseId &&
      espace.infos.gammeCafeSelected
    ) {
      api?.scrollTo(
        espace.infos.gammeCafeSelected === "essentiel"
          ? 0
          : espace.infos.gammeCafeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [
    api,
    cafe.infos.entrepriseId,
    espace.infos.gammeCafeSelected,
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
          <CafeMobileEspacePropositionCard
            key={proposition.id}
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            handleClickFirstEspaceProposition={
              handleClickFirstEspaceProposition
            }
            espace={espace}
            cafeEspacesIds={cafeEspacesIds}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default CafeMobileEspacePropositionsCarousel;
