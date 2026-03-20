import { SnacksFruitsPropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(snacks)/(desktop)/SnacksFruitsPropositionCard";
import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useEffect, useState } from "react";
import SnacksFruitsMobilePropositionCard from "./SnacksFruitsMobilePropositionCard";

type SnacksFruitsMobilePropositionsCarouselProps = {
  propositions: SnacksFruitsPropositionItem[];
  handleClickProposition: (proposition: SnacksFruitsPropositionItem) => void;
};

const SnacksFruitsMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
}: SnacksFruitsMobilePropositionsCarouselProps) => {
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
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
    if (!snacksFruits.infos.entrepriseId || !api) {
      return;
    }
    if (
      propositions[0].entrepriseId === snacksFruits.infos.entrepriseId &&
      snacksFruits.infos.gammeSelected
    ) {
      api?.scrollTo(
        snacksFruits.infos.gammeSelected === "essentiel"
          ? 0
          : snacksFruits.infos.gammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [
    api,
    propositions,
    snacksFruits.infos.entrepriseId,
    snacksFruits.infos.gammeSelected,
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
