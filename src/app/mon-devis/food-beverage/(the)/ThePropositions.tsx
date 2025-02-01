import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { ChangeEvent, useContext } from "react";
import { MAX_EFFECTIF } from "../../mes-locaux/MesLocaux";
import ThePropositionCard from "./ThePropositionCard";
import ThePropositionFournisseurLogo from "./ThePropositionFournisseurLogo";
import ThePropositionsInput from "./ThePropositionsInput";

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
  const nbPersonnes = the.quantites.nbPersonnes || Math.round(effectif * 0.15);
  const nbThesParAn = nbPersonnes * 400;
  const nbTassesParJour = nbPersonnes * 2;

  const propositions =
    theConsoTarifs
      ?.filter(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId
      )
      .map((tarif) => ({
        ...tarif,
        prixAnnuel:
          tarif.prixUnitaire !== null
            ? Math.round(nbThesParAn * tarif.prixUnitaire)
            : null,
        infos: tarif.infos ?? null,
      })) ?? [];

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : Math.round(effectif * 0.15);
    if (newNbPersonnes > MAX_EFFECTIF) newNbPersonnes = MAX_EFFECTIF;
    const nbThesParAn = newNbPersonnes * 400;
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundEffectif(newNbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId &&
          tarif.gamme === the.infos.gammeSelected
      )?.prixUnitaire ?? null;
    const prixAnnuel =
      prixUnitaire !== null ? Math.round(nbThesParAn * prixUnitaire) : null;

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
        totalService: prixAnnuel,
      });
    }
  };

  const handleClickProposition = (proposition: {
    prixAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  }) => {
    const { gamme, prixAnnuel, prixUnitaire } = proposition;
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
      totalService: prixAnnuel,
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col p-4">
          <ThePropositionFournisseurLogo {...propositions[0]} />
          <ThePropositionsInput
            nbPersonnes={nbPersonnes}
            handleChange={handleChangeNbPersonnes}
            effectif={effectif}
          />
        </div>
        {propositions.map((proposition) => (
          <ThePropositionCard
            key={proposition.id}
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            nbTassesParJour={nbTassesParJour}
          />
        ))}
      </div>
    </div>
  );
};

export default ThePropositions;
