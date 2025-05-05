"use client";

import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { capitalize } from "../../../../../../../lib/utils/capitalize";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import NettoyageOptionsPropositions from "./(desktop)/NettoyageOptionsPropositions";

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
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

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
      const prixAnnuel = 52 * hParPassage * tauxHoraire * MAJORATION_DIMANCHE;
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
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tNettoyage("nettoyage-et-proprete-options")}
          description={
            nettoyage.infos.fournisseurId && nettoyage.infos.gammeSelected
              ? t(
                  "choisissez-vos-options-en-gamme-capitalize-nettoyage-infos-gammeselected-chez-nettoyage-infos-nomfournisseur",
                  {
                    gamme: capitalize(nettoyage.infos.gammeSelected),
                    nomFournisseur: nettoyage.infos.nomFournisseur ?? "",
                  }
                )
              : ""
          }
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={tNettoyage("nettoyage-et-proprete-options")}
          description={
            nettoyage.infos.fournisseurId && nettoyage.infos.gammeSelected
              ? t(
                  "choisissez-vos-options-en-gamme-capitalize-nettoyage-infos-gammeselected-chez-nettoyage-infos-nomfournisseur",
                  {
                    gamme: capitalize(nettoyage.infos.gammeSelected),
                    nomFournisseur: nettoyage.infos.nomFournisseur ?? "",
                  }
                )
              : ""
          }
          icon={SprayCan}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
        {!nettoyage.infos.fournisseurId || !nettoyage.infos.gammeSelected ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-center text-fm4alldestructive">
              {tNettoyage(
                "veuillez-d-abord-selectionner-une-offre-de-nettoyage"
              )}
            </p>
          </div>
        ) : (
          <NettoyageOptionsPropositions
            samediProposition={samediProposition}
            dimancheProposition={dimancheProposition}
            repasseProposition={repasseProposition}
            vitrerieProposition={vitrerieProposition}
          />
        )}
      </div>
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default NettoyageOptions;
