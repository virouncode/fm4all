import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { ChangeEvent, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import { MAX_EFFECTIF } from "../../mes-locaux/MesLocaux";
import TheDesktopPropositions from "./(desktop)/TheDesktopPropositions";
import TheMobilePropositions from "./(mobile)/TheMobilePropositions";

type ThePropositionsProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const ThePropositions = ({ theConsoTarifs }: ThePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const effectif = client.effectif ?? 0;

  //Calcul des propositions
  const nbPersonnes = the.quantites.nbPersonnes ?? Math.round(effectif * 0.15);
  const nbThesParAn = nbPersonnes * 400;
  const nbTassesParJour = nbPersonnes * 2;

  const propositions = theConsoTarifs
    ?.filter(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes / 0.15) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
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
    const nbThesParAn = newNbPersonnes * 400;
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId &&
          tarif.gamme === the.infos.gammeSelected
      )?.prixUnitaire ?? null;
    const totalAnnuel =
      newNbPersonnes && prixUnitaire !== null
        ? nbThesParAn * prixUnitaire
        : null;

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
    if (the.infos.gammeSelected) {
      setTotalThe({
        totalService: totalAnnuel,
      });
    }
  };

  const handleClickProposition = (proposition: {
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: GammeType;
    effectif: number;
    prixUnitaire: number | null;
    totalAnnuel: number | null;
    infos: string | null;
  }) => {
    const { gamme, totalAnnuel, prixUnitaire } = proposition;
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
      setTotalThe({
        totalService: null,
      });
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
    setTotalThe({
      totalService: totalAnnuel,
    });
  };
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <TheMobilePropositions
      nbPersonnes={nbPersonnes}
      nbTassesParJour={nbTassesParJour}
      effectif={effectif}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
      theConsoTarifs={theConsoTarifs}
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
