import { MAX_EFFECTIF } from "@/constants/constants";
import { toast } from "@/hooks/use-toast";
import { roundNbPersonnesCafeConso } from "@/lib/utils/roundNbPersonnesCafeConso";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTheStore } from "@/stores/devis/theStore";
import { GammeType } from "@/zod-schemas/gamme.schema";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs.schema";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import TheDesktopPropositions from "./(desktop)/TheDesktopPropositions";
import TheMobilePropositions from "./(mobile)/TheMobilePropositions";

type ThePropositionsProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const ThePropositions = ({ theConsoTarifs }: ThePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  const prospect = useProspectStore((s) => s.prospect);
  const cafe = useCafeStore((s) => s.cafe);
  const { the, setThe } = useTheStore(
    useShallow((s) => ({
      the: s.the,
      setThe: s.setThe,
    })),
  );
  const effectif = prospect.effectif ?? 0;

  //Calcul des propositions
  const nbPersonnes = the.quantites.nbPersonnes ?? Math.round(effectif * 0.15);
  const nbThesParAn = nbPersonnes * 400;
  const nbTassesParJour = nbPersonnes * 2;

  const propositions = theConsoTarifs
    ?.filter(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes / 0.15) &&
        tarif.entrepriseId === cafe.infos.entrepriseId,
    )
    .map((tarif) => ({
      ...tarif,
      totalAnnuel:
        tarif.prixUnitaire !== null ? nbThesParAn * tarif.prixUnitaire : null,
      infos: tarif.infos ?? null,
    }));

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : 0;
    if (newNbPersonnes > MAX_EFFECTIF) newNbPersonnes = MAX_EFFECTIF;
    updateThe(newNbPersonnes);
  };

  const updateThe = (newNbPersonnes: number) => {
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes / 0.15) &&
          tarif.entrepriseId === cafe.infos.entrepriseId &&
          tarif.gamme === the.infos.gammeSelected,
      )?.prixUnitaire ?? null;
    setThe((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPersonnes: newNbPersonnes,
      },
      prix: {
        prixUnitaire: the.infos.gammeSelected
          ? prixUnitaire
          : prev.prix.prixUnitaire,
      },
    }));
  };

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes > MAX_EFFECTIF) {
      newNbPersonnes = MAX_EFFECTIF;
      toast({
        title: t("limite-atteinte"),
        description: tThe(
          "nous-ne-proposons-pas-de-livraisons-de-the-pour-plus-de-300-personnes",
        ),
        duration: 7000,
      });
    }
    updateThe(newNbPersonnes);
  };
  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes < 0) newNbPersonnes = 0;
    updateThe(newNbPersonnes);
  };

  const handleClickProposition = (proposition: {
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
    gamme: GammeType;
    effectif: number;
    prixUnitaire: number | null;
    totalAnnuel: number | null;
    infos: string | null;
  }) => {
    const { gamme, prixUnitaire } = proposition;
    if (the.infos.gammeSelected === gamme) {
      setThe((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          gammeSelected: null,
        },
        prix: {
          prixUnitaire: null,
        },
      }));
      return;
    }
    setThe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        gammeSelected: gamme,
      },
      prix: {
        prixUnitaire: prixUnitaire,
      },
    }));
  };
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <TheMobilePropositions
      nbPersonnes={nbPersonnes}
      nbTassesParJour={nbTassesParJour}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
      handleIncrement={handleIncrement}
      handleDecrement={handleDecrement}
    />
  ) : (
    <TheDesktopPropositions
      nbPersonnes={nbPersonnes}
      nbTassesParJour={nbTassesParJour}
      effectif={effectif}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default ThePropositions;
