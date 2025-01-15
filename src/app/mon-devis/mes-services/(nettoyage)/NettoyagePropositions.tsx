import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";
import { reinitialisationNettoyage } from "./reinitialisationNettoyage";

type NettoyagePropositionsProps = {
  formattedNettoyagePropositions: (SelectNettoyageTarifsType & {
    freqAnnuelle: number;
    prixAnnuel: number;
  })[][];
};

const NettoyagePropositions = ({
  formattedNettoyagePropositions,
}: NettoyagePropositionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { setServices } = useContext(ServicesContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClickProposition = (
    propositionId: number,
    fournisseurId: number,
    nomEntreprise: string,
    gamme: GammeType,
    prixAnnuel: number
  ) => {
    //Je décoche la proposition
    if (nettoyage.propositionId === propositionId) {
      reinitialisationNettoyage(
        setNettoyage,
        setHygiene,
        setServices,
        setTotalNettoyage,
        setTotalHygiene
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete("fournisseurId");
      params.delete("nettoyageGamme");
      router.push(`/mon-devis/mes-services?${params.toString()}`);
      return;
    }
    //Je coche la proposition
    setNettoyage((prev) => ({
      ...prev,
      fournisseurId: fournisseurId,
      propositionId,
      gammeSelected: gamme,
      repassePropositionId: null,
      samediPropositionId: null,
      dimanchePropositionId: null,
      vitreriePropositionId: null,
      nbPassageVitrerie: 2,
    }));

    setTotalNettoyage((prev) => ({
      ...prev,
      nomFournisseur: nomEntreprise,
      prixService: prixAnnuel,
      prixRepasse: null,
      prixSamedi: null,
      prixDimanche: null,
      prixVitrerie: null,
    }));

    //Car on ne travaille pas forcément avec le même fournisseur pour l'hygiène
    const hygieneFournisseurId = fournisseurId === 9 ? 12 : fournisseurId;
    const hygieneFournisseurName = fournisseurId === 9 ? "EPCH" : nomEntreprise;

    setHygiene((prev) => ({
      ...prev,
      fournisseurId: hygieneFournisseurId,
      dureeLocation: "pa12M",
      trilogieGammeSelected: null,
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    }));
    setTotalHygiene({
      nomFournisseur: hygieneFournisseurName,
      prixTrilogieAbonnement: null,
      prixTrilogieAchat: null,
      prixDesinfectantAbonnement: null,
      prixDesinfectantAchat: null,
      prixParfum: null,
      prixBalai: null,
      prixPoubelle: null,
    });
    const params = new URLSearchParams(searchParams.toString());
    params.set("fournisseurId", fournisseurId.toString());
    params.set("nettoyageGamme", gamme);
    router.push(`/mon-devis/mes-services?${params.toString()}`);
  };
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {formattedNettoyagePropositions.length > 0
        ? formattedNettoyagePropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex w-1/4 items-center justify-center">
                      {getLogoFournisseurUrl(propositions[0].fournisseurId) ? (
                        <div className="w-full h-full relative">
                          <Image
                            src={
                              getLogoFournisseurUrl(
                                propositions[0].fournisseurId
                              ) as string
                            }
                            alt={`logo-de-${propositions[0].nomEntreprise}`}
                            fill={true}
                            className="w-full h-full object-contain"
                            quality={100}
                          />
                        </div>
                      ) : (
                        propositions[0].nomEntreprise
                      )}
                    </div>
                  </TooltipTrigger>
                  {propositions[0].slogan && (
                    <TooltipContent>
                      <p className="text-sm italic">{propositions[0].slogan}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {propositions.map((proposition) => {
                const gamme = proposition.gamme;
                const color =
                  gamme === "essentiel"
                    ? "fm4allessential"
                    : gamme === "confort"
                    ? "fm4allcomfort"
                    : "fm4allexcellence";
                const prixAnnuel = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";
                const hParSemaine =
                  proposition.hParPassage && proposition.freqAnnuelle
                    ? `${formatNumber(
                        (proposition.hParPassage * proposition.freqAnnuelle) /
                          S_OUVREES_PAR_AN
                      )} h / semaine*`
                    : "";
                const nbPassagesParSemaine =
                  proposition.freqAnnuelle && proposition.hParPassage
                    ? `${formatNumber(
                        proposition.freqAnnuelle / S_OUVREES_PAR_AN
                      )} passage(s) de ${proposition.hParPassage}h / semaine`
                    : "";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      nettoyage.propositionId === proposition.id
                        ? "ring-2 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() =>
                      handleClickProposition(
                        proposition.id,
                        proposition.fournisseurId,
                        proposition.nomEntreprise,
                        proposition.gamme,
                        proposition.prixAnnuel
                      )
                    }
                  >
                    <Checkbox
                      checked={nettoyage.propositionId === proposition.id}
                      onCheckedChange={() =>
                        handleClickProposition(
                          proposition.id,
                          proposition.fournisseurId,
                          proposition.nomEntreprise,
                          proposition.gamme,
                          proposition.prixAnnuel
                        )
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuel}</p>
                      <p className="text-base">{hParSemaine}</p>
                      <p className="text-xs">{nbPassagesParSemaine}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        : null}
    </div>
  );
};

export default NettoyagePropositions;
