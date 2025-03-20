import CarouselGammesDots from "@/components/carousel-gammes-dots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { useContext, useEffect, useState } from "react";
import MaintenanceMobilePropositionCard from "./MaintenanceMobilePropositionCard";

type MaintenanceMobilePropositionsCarouselProps = {
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }) => void;
  propositions: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }[];
};

const MaintenanceMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
}: MaintenanceMobilePropositionsCarouselProps) => {
  const { maintenance } = useContext(MaintenanceContext);
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
    if (!maintenance.infos.fournisseurId && !api) {
      return;
    }
    if (
      propositions[0].fournisseurId === maintenance.infos.fournisseurId &&
      maintenance.infos.gammeSelected
    ) {
      api?.scrollTo(
        maintenance.infos.gammeSelected === "essentiel"
          ? 0
          : maintenance.infos.gammeSelected === "confort"
            ? 1
            : 2
      );
    }
  }, [
    api,
    maintenance.infos.fournisseurId,
    maintenance.infos.gammeSelected,
    propositions,
  ]);
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
          <MaintenanceMobilePropositionCard
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

export default MaintenanceMobilePropositionsCarousel;
