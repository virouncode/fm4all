import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { HygieneContext } from "@/context/HygieneProvider";
import { useContext, useEffect, useState } from "react";
import HygieneMobilePropositionCard from "./HygieneMobilePropositionCard";
import CarouselGammesDots from "@/components/CarouselGammesDots";

type HygieneMobilePropositionsProps = {
  prixInstalDistrib: number | null;
  propositions: {
    gamme: "essentiel" | "confort" | "excellence";
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
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }[];
  handleClickProposition: (proposition: {
    gamme: "essentiel" | "confort" | "excellence";
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
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
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

    api?.scrollTo(
      hygiene.infos.trilogieGammeSelected === "essentiel"
        ? 0
        : hygiene.infos.trilogieGammeSelected === "confort"
        ? 1
        : 2
    );
  }, [api, hygiene.infos.fournisseurId, hygiene.infos.trilogieGammeSelected]);
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
