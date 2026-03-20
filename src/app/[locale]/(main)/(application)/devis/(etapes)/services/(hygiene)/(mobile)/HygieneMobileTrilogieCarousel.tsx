import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useEffect, useState } from "react";
import HygieneMobilePropositionCard from "./HygieneMobilePropositionCard";

type HygieneMobilePropositionsProps = {
  prixInstalDistrib: number | null;
  propositions: {
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }[];
  handleClickProposition: (proposition: {
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }) => void;
};

const HygieneMobileTrilogieCarousel = ({
  propositions,
  handleClickProposition,
  prixInstalDistrib,
}: HygieneMobilePropositionsProps) => {
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
    if (!hygiene.infos.entrepriseId || !api) {
      return;
    }
    if (hygiene.infos.trilogieGammeSelected) {
      api?.scrollTo(
        hygiene.infos.trilogieGammeSelected === "essentiel"
          ? 0
          : hygiene.infos.trilogieGammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [api, hygiene.infos.entrepriseId, hygiene.infos.trilogieGammeSelected]);
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
          <HygieneMobilePropositionCard
            proposition={proposition}
            key={proposition.gamme}
            handleClickProposition={handleClickProposition}
            prixInstalDistrib={prixInstalDistrib}
          />
        ))}
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default HygieneMobileTrilogieCarousel;
