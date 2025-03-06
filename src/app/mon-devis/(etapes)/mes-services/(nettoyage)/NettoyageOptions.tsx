"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import { capitalize } from "../../../../../lib/capitalize";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
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
            const {
              id,
              hParPassage,
              tauxHoraire,
              nomFournisseur,
              gamme,
              slogan,
              logoUrl,
              locationUrl,
              anneeCreation,
              ca,
              effectif,
              nbClients,
              noteGoogle,
              nbAvis,
            } = tarif;

            const prixAnnuel = freqAnnuelle * hParPassage * tauxHoraire;
            return {
              id,
              hParPassage,
              tauxHoraire,
              prixAnnuel,
              nomFournisseur,
              gamme,
              slogan,
              logoUrl,
              locationUrl,
              anneeCreation,
              ca,
              effectif,
              nbClients,
              noteGoogle,
              nbAvis,
            };
          })[0];
  const samediProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.fournisseurId === nettoyage.infos.fournisseurId &&
        tarif.gamme === nettoyage.infos.gammeSelected
    )
    .map((tarif) => {
      const {
        id,
        gamme,
        hParPassage,
        tauxHoraire,
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
      } = tarif;
      const prixAnnuel = 52 * hParPassage * tauxHoraire;
      return {
        id,
        gamme,
        prixAnnuel,
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
      };
    })[0];
  const dimancheProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.fournisseurId === nettoyage.infos.fournisseurId &&
        tarif.gamme === nettoyage.infos.gammeSelected
    )
    .map((tarif) => {
      const {
        id,
        hParPassage,
        tauxHoraire,
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
      } = tarif;
      const prixAnnuel = 52 * hParPassage * tauxHoraire * 1.2;
      return {
        id,
        prixAnnuel,
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
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
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
      } = tarif;

      const prixAnnuel =
        nettoyage.quantites.surfaceCloisons && nettoyage.quantites.surfaceVitres
          ? nettoyage.quantites.nbPassagesVitrerie *
            Math.max(
              (nettoyage.quantites.surfaceCloisons / cadenceCloisons +
                nettoyage.quantites.surfaceVitres / cadenceVitres) *
                tauxHoraire +
                fraisDeplacement,
              minFacturation
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
        nomFournisseur,
        slogan,
        logoUrl,
        locationUrl,
        anneeCreation,
        ca,
        effectif,
        nbClients,
        noteGoogle,
        nbAvis,
      };
    })[0];

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Options de nettoyage"
        description={`Choisissez vos options en gamme ${capitalize(
          nettoyage.infos.gammeSelected
        )} chez ${nettoyage.infos.nomFournisseur}`}
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
