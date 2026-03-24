import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { useEffect, useState } from "react";
import MaintenanceMobilePropositionCard from "./MaintenanceMobilePropositionCard";

type MaintenanceMobilePropositionsCarouselProps = {
  handleClickProposition: (proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    imageStorageKey: string | null;
    infos: string | null;
  }) => void;
  propositions: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    imageStorageKey: string | null;
    infos: string | null;
  }[];
};

const MaintenanceMobilePropositionsCarousel = ({
  propositions,
  handleClickProposition,
}: MaintenanceMobilePropositionsCarouselProps) => {
  const maintenance = useMaintenanceStore((s) => s.maintenance);
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
    if (!maintenance.infos.entrepriseId && !api) {
      return;
    }
    if (
      propositions[0].entrepriseId === maintenance.infos.entrepriseId &&
      maintenance.infos.gammeSelected
    ) {
      api?.scrollTo(
        maintenance.infos.gammeSelected === "essentiel"
          ? 0
          : maintenance.infos.gammeSelected === "confort"
            ? 1
            : 2,
      );
    }
  }, [
    api,
    maintenance.infos.entrepriseId,
    maintenance.infos.gammeSelected,
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
