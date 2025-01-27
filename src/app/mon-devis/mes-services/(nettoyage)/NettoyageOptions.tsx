"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import NettoyageOptionsPropositions from "./NettoyageOptionsPropositions";

type NettoyageOptionsProps = {
  nettoyageTarifs: SelectNettoyageTarifsType[];
  repasseTarifs: SelectRepasseTarifsType[];
  vitrerieTarifs: SelectVitrerieTarifsType[];
};

const NettoyageOptions = ({
  nettoyageTarifs,
  repasseTarifs,
  vitrerieTarifs,
}: NettoyageOptionsProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };

  if (!nettoyage.infos.fournisseurId && !nettoyage.infos.gammeSelected) {
    return null; //pour skiper le service
  }

  // Calcul des propositions
  const freqAnnuelle = nettoyage.quantites.freqAnnuelle;
  const repasseProposition =
    freqAnnuelle === null
      ? null
      : freqAnnuelle < 260.04
      ? null
      : repasseTarifs
          .filter(
            (tarif) =>
              tarif.fournisseurId === nettoyage.infos.fournisseurId &&
              tarif.gamme === nettoyage.infos.gammeSelected
          )
          .map((tarif) => {
            const { id, hParPassage, tauxHoraire } = tarif;
            const prixAnnuel = Math.round(
              freqAnnuelle * hParPassage * tauxHoraire
            );
            return {
              id,
              hParPassage,
              tauxHoraire,
              prixAnnuel,
            };
          })[0];
  const samediProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.fournisseurId === nettoyage.infos.fournisseurId &&
        tarif.gamme === nettoyage.infos.gammeSelected
    )
    .map((tarif) => {
      const { id, gamme, hParPassage, tauxHoraire } = tarif;
      const prixAnnuel = Math.round(52 * hParPassage * tauxHoraire);
      return {
        id,
        gamme,
        prixAnnuel,
      };
    })[0];
  const dimancheProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.fournisseurId === nettoyage.infos.fournisseurId &&
        tarif.gamme === nettoyage.infos.gammeSelected
    )
    .map((tarif) => {
      const { id, hParPassage, tauxHoraire } = tarif;
      const prixAnnuel = Math.round(52 * hParPassage * tauxHoraire * 1.2);
      return {
        id,
        prixAnnuel,
      };
    })[0];
  const vitrerieProposition = vitrerieTarifs
    .filter((tarif) => tarif.fournisseurId === nettoyage.infos.fournisseurId)
    .map((tarif) => {
      const {
        id,
        tauxHoraire,
        cadenceCloisons,
        cadenceVitres,
        minFacturation,
        fraisDeplacement,
      } = tarif;

      const prixAnnuel =
        nettoyage.quantites.surfaceCloisons && nettoyage.quantites.surfaceVitres
          ? Math.round(
              nettoyage.quantites.nbPassagesVitrerie *
                Math.max(
                  (nettoyage.quantites.surfaceCloisons / cadenceCloisons +
                    nettoyage.quantites.surfaceVitres / cadenceVitres) *
                    tauxHoraire +
                    fraisDeplacement,
                  minFacturation
                )
            )
          : null;
      return {
        id,
        tauxHoraire,
        cadenceCloisons,
        cadenceVitres,
        minFacturation,
        fraisDeplacement,
        prixAnnuel,
      };
    })[0];

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Nettoyage et Propreté"
        description={`Choisissez vos options en gamme ${nettoyage.infos.gammeSelected} chez ${nettoyage.infos.nomFournisseur}`}
        icon={SprayCan}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 overflow-auto">
        <NettoyageOptionsPropositions
          samediProposition={samediProposition}
          dimancheProposition={dimancheProposition}
          repasseProposition={repasseProposition}
          vitrerieProposition={vitrerieProposition}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default NettoyageOptions;
