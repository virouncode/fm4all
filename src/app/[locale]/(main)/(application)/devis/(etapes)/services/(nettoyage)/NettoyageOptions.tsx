"use client";

import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { MAJORATION_DIMANCHE } from "@/constants/constants";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useServicesStore } from "@/stores/devis/servicesStore";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse.schema";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs.schema";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie.schema";
import { SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { capitalize } from "../../../../../../../../lib/utils/capitalize";
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
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const setServices = useServicesStore((s) => s.setServices);
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
                tarif.entrepriseId === nettoyage.infos.entrepriseId &&
                tarif.gamme === nettoyage.infos.gammeSelected,
            )
            .map((tarif) => {
              const {
                id,
                hParPassage,
                tauxHoraire,
                nomPrestataire,
                gamme,
                slogan,
                logoStorageKey,
                anneeCreation,
                ca,
                effectifPrestataire,
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
                nomPrestataire,
                gamme,
                slogan,
                logoStorageKey,
                anneeCreation,
                ca,
                effectifPrestataire,
                nbClients,
                noteGoogle,
                nbAvis,
              };
            })[0];
  const samediProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.entrepriseId === nettoyage.infos.entrepriseId &&
        tarif.gamme === nettoyage.infos.gammeSelected,
    )
    .map((tarif) => {
      const {
        id,
        gamme,
        hParPassage,
        tauxHoraire,
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
        nbClients,
        noteGoogle,
        nbAvis,
      } = tarif;
      const prixAnnuel = 52 * hParPassage * tauxHoraire;
      return {
        id,
        gamme,
        prixAnnuel,
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
        nbClients,
        noteGoogle,
        nbAvis,
      };
    })[0];
  const dimancheProposition = nettoyageTarifs
    .filter(
      (tarif) =>
        tarif.entrepriseId === nettoyage.infos.entrepriseId &&
        tarif.gamme === nettoyage.infos.gammeSelected,
    )
    .map((tarif) => {
      const {
        id,
        hParPassage,
        tauxHoraire,
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
        nbClients,
        noteGoogle,
        nbAvis,
      } = tarif;
      const prixAnnuel = 52 * hParPassage * tauxHoraire * MAJORATION_DIMANCHE;
      return {
        id,
        prixAnnuel,
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
        nbClients,
        noteGoogle,
        nbAvis,
      };
    })[0];
  const vitrerieProposition = vitrerieTarifs
    .filter((tarif) => tarif.entrepriseId === nettoyage.infos.entrepriseId)
    .map((tarif) => {
      const {
        id,
        tauxHoraire,
        cadenceCloisons,
        cadenceVitres,
        minFacturation,
        fraisDeplacement,
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
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
              minFacturation,
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
        nomPrestataire,
        slogan,
        logoStorageKey,
        anneeCreation,
        ca,
        effectifPrestataire,
        nbClients,
        noteGoogle,
        nbAvis,
      };
    })[0];

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tNettoyage("nettoyage-et-proprete-options")}
          description={
            nettoyage.infos.entrepriseId && nettoyage.infos.gammeSelected
              ? t(
                  "choisissez-vos-options-en-gamme-capitalize-nettoyage-infos-gammeselected-chez-nettoyage-infos-nomprestataire",
                  {
                    gamme: capitalize(nettoyage.infos.gammeSelected),
                    nomPrestataire: nettoyage.infos.nomPrestataire ?? "",
                  },
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
            nettoyage.infos.entrepriseId && nettoyage.infos.gammeSelected
              ? t(
                  "choisissez-vos-options-en-gamme-capitalize-nettoyage-infos-gammeselected-chez-nettoyage-infos-nomprestataire",
                  {
                    gamme: capitalize(nettoyage.infos.gammeSelected),
                    nomPrestataire: nettoyage.infos.nomPrestataire ?? "",
                  },
                )
              : ""
          }
          icon={SprayCan}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
        {!nettoyage.infos.entrepriseId || !nettoyage.infos.gammeSelected ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-destructive text-center">
              {tNettoyage(
                "veuillez-d-abord-selectionner-une-offre-de-nettoyage",
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
