import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useEffect, useState } from "react";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";
import HygieneMobileOptionsParfumCard from "./HygieneMobileOptionsParfumCard";

type HygieneMobileOptionsParfumCarouselProps = {
  propositions: {
    nomPrestataire: string;
    sloganPrestataire: string | null;
    anneeCreation: number | null;
    logoStorageKey: string | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    gamme: "essentiel" | "confort" | "excellence";
    prixDistribDesinfectant: number | null;
    prixDistribParfum: number | null;
    prixDistribBalai: number | null;
    prixDistribPoubelle: number | null;
    paParPersonneDesinfectant: number | null;
    totalDesinfectant: number | null;
    totalParfum: number | null;
    totalBalai: number | null;
    totalPoubelle: number | null;
    imageUrlDesinfectant: string | null;
    imageUrlParfum: string | null;
    imageUrlBalai: string | null;
    imageUrlPoubelle: string | null;
  }[];
  handleClickProposition: (
    type: HygieneOptionsType,
    proposition: {
      nomPrestataire: string;
      sloganPrestataire: string | null;
      anneeCreation: number | null;
      logoStorageKey: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
      gamme: "essentiel" | "confort" | "excellence";
      prixDistribDesinfectant: number | null;
      prixDistribParfum: number | null;
      prixDistribBalai: number | null;
      prixDistribPoubelle: number | null;
      paParPersonneDesinfectant: number | null;
      totalDesinfectant: number | null;
      totalParfum: number | null;
      totalBalai: number | null;
      totalPoubelle: number | null;
      imageUrlDesinfectant: string | null;
      imageUrlParfum: string | null;
      imageUrlBalai: string | null;
      imageUrlPoubelle: string | null;
    },
  ) => void;
};

const HygieneMobileOptionsParfumCarousel = ({
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsParfumCarouselProps) => {
  const hygiene = useHygieneStore((s) => s.hygiene);
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
    if (!hygiene.infos.entrepriseId && !api) {
      return;
    }
    if (hygiene.infos.parfumGammeSelected) {
      api?.scrollTo(
        hygiene.infos.parfumGammeSelected === "essentiel"
          ? 0
          : hygiene.infos.parfumGammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [api, hygiene.infos.parfumGammeSelected, hygiene.infos.entrepriseId]);

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
          <HygieneMobileOptionsParfumCard
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            key={"parfum" + proposition.gamme}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default HygieneMobileOptionsParfumCarousel;
