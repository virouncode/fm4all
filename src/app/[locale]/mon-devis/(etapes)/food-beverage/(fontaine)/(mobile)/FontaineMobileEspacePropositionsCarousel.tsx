import CarouselGammesDots from "@/components/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { FontainesContext } from "@/context/FontainesProvider";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { useContext, useEffect, useState } from "react";
import FontaineMobileEspacePropositionCard from "./FontaineMobileEspacePropositionCard";

type FontaineMobileEspacePropositionsCarouselProps = {
  propositions: {
    id: number;
    fournisseurId: number;
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
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }[];
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
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
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  espace: FontaineEspaceType;
  handleClickFirstEspaceProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  fontainesEspacesIds: number[];
};

const FontaineMobileEspacePropositionsCarousel = ({
  propositions,
  handleClickProposition,
  espace,
  handleClickFirstEspaceProposition,
  fontainesEspacesIds,
}: FontaineMobileEspacePropositionsCarouselProps) => {
  const { fontaines } = useContext(FontainesContext);
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
    if (!fontaines.infos.fournisseurId && !api) {
      return;
    }
    if (
      propositions[0].fournisseurId === fontaines.infos.fournisseurId &&
      espace.infos.poseSelected
    ) {
      api?.scrollTo(
        espace.infos.poseSelected === "aposer"
          ? 0
          : espace.infos.poseSelected === "colonne"
          ? 1
          : 2
      );
    }
  }, [
    api,
    espace.infos.poseSelected,
    fontaines.infos.fournisseurId,
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
