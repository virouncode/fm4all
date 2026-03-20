import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { useEffect, useState } from "react";
import FontaineMobileEspacePropositionCard from "./FontaineMobileEspacePropositionCard";
import { FontaineMobilePropositionItem } from "./FontaineMobileEspacePropositionCard";

type FontaineMobileEspacePropositionsCarouselProps = {
  propositions: FontaineMobilePropositionItem[];
  handleClickProposition: (proposition: FontaineMobilePropositionItem) => void;
  espace: FontaineEspaceType;
  handleClickFirstEspaceProposition: (proposition: FontaineMobilePropositionItem) => void;
  fontainesEspacesIds: number[];
};

const FontaineMobileEspacePropositionsCarousel = ({
  propositions,
  handleClickProposition,
  espace,
  handleClickFirstEspaceProposition,
  fontainesEspacesIds,
}: FontaineMobileEspacePropositionsCarouselProps) => {
  const fontaines = useFontainesStore((s) => s.fontaines);
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
    if (!fontaines.infos.entrepriseId && !api) {
      return;
    }
    if (
      propositions[0].entrepriseId === fontaines.infos.entrepriseId &&
      espace.infos.poseSelected
    ) {
      api?.scrollTo(
        espace.infos.poseSelected === "aposer"
          ? 0
          : espace.infos.poseSelected === "colonne"
            ? 1
            : 2,
      );
    }
  }, [
    api,
    espace.infos.poseSelected,
    fontaines.infos.entrepriseId,
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
          <FontaineMobileEspacePropositionCard
            key={proposition.id}
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            handleClickFirstEspaceProposition={
              handleClickFirstEspaceProposition
            }
            espace={espace}
            fontainesEspacesIds={fontainesEspacesIds}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default FontaineMobileEspacePropositionsCarousel;
