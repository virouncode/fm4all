import CarouselGammesDots from "@/components/carousel-gammes-dots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { useContext, useEffect, useState } from "react";
import ServicesFm4AllMobilePropositionCard from "./ServicesFm4AllMobilePropositionCard";

type ServicesFm4allMobilePropositionsProps = {
  formattedPropositions: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }[];
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
  }) => void;
  total: number;
};

const ServicesFm4allMobilePropositions = ({
  formattedPropositions,
  handleClickProposition,
  total,
}: ServicesFm4allMobilePropositionsProps) => {
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
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
    if (!servicesFm4All.infos.gammeSelected || !api) {
      return;
    }
    if (servicesFm4All.infos.gammeSelected) {
      api?.scrollTo(
        servicesFm4All.infos.gammeSelected === "essentiel"
          ? 0
          : servicesFm4All.infos.gammeSelected === "confort"
            ? 1
            : servicesFm4All.infos.gammeSelected === "excellence"
              ? 2
              : 0
      );
    }
  }, [api, servicesFm4All.infos.gammeSelected]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl -mb-4">Services fm4all</p>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
        setApi={setApi}
      >
        <CarouselContent>
          {formattedPropositions.map((proposition) => (
            <ServicesFm4AllMobilePropositionCard
              key={proposition.id}
              proposition={proposition}
              handleClickProposition={handleClickProposition}
              total={total}
            />
          ))}
        </CarouselContent>
        <CarouselGammesDots currentIndex={currentIndex} />
      </Carousel>
      <p className="text-xs text-end italic">
        {
          "\u00B9remise de 0,5% à partir d'un chiffre d'affaires de 26 000€ HT/an, \u00B2remise de 0,5% pour le choix d'un Office Manager"
        }
      </p>
    </div>
  );
};

export default ServicesFm4allMobilePropositions;
