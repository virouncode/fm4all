import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { GammeType } from "@/zod-schemas/gamme";
import { ServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4All";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import ServicesFm4AllMobilePropositionCard from "./ServicesFm4AllMobilePropositionCard";

type ServicesFm4allMobilePropositionsProps = {
  formattedPropositions: {
    id: number;
    gamme: GammeType;
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
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }[];
  handleClickProposition: (proposition: {
    id: number;
    gamme: GammeType;
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
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }) => void;
  total: number;
};

const ServicesFm4allMobilePropositions = ({
  formattedPropositions,
  handleClickProposition,
  total,
}: ServicesFm4allMobilePropositionsProps) => {
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
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
              : 0,
      );
    }
  }, [api, servicesFm4All.infos.gammeSelected]);

  return (
    <div className="flex w-full flex-col gap-6">
      <p className="-mb-4 text-xl font-bold">{tFm4all("services-fm4all")}</p>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative w-full"
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
      <p className="px-1 text-end text-xs italic">
        {tFm4all(
          "u00b9remise-de-0-5-a-partir-dun-chiffre-daffaires-de-26-000eur-ht-an-u00b2remise-de-0-5-pour-le-choix-dun-office-manager",
        )}
      </p>
    </div>
  );
};

export default ServicesFm4allMobilePropositions;
