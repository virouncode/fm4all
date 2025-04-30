import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { HygieneContext } from "@/context/HygieneProvider";
import { useContext, useEffect, useState } from "react";
import HygieneMobileOptionsBalaiCard from "./HygieneMobileOptionsBalaiCard";

type HygieneMobileOptionsBalaiCarouselProps = {
  propositions: {
    nomFournisseur: string;
    sloganFournisseur: string | null;
    anneeCreation: number | null;
    logoUrl: string | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    locationUrl: string | null;
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
    type: string,
    proposition: {
      nomFournisseur: string;
      sloganFournisseur: string | null;
      anneeCreation: number | null;
      logoUrl: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
      locationUrl: string | null;
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
    }
  ) => void;
};

const HygieneMobileOptionsBalaiCarousel = ({
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsBalaiCarouselProps) => {
  const { hygiene } = useContext(HygieneContext);
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
    if (!hygiene.infos.fournisseurId && !api) {
      return;
    }
    if (hygiene.infos.balaiGammeSelected) {
      api?.scrollTo(
        hygiene.infos.balaiGammeSelected === "essentiel"
          ? 0
          : hygiene.infos.balaiGammeSelected === "confort"
            ? 1
            : 2
      );
    }
  }, [api, hygiene.infos.balaiGammeSelected, hygiene.infos.fournisseurId]);

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
          <HygieneMobileOptionsBalaiCard
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            key={"balai" + proposition.gamme}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default HygieneMobileOptionsBalaiCarousel;
