import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";
import { reinitialisationNettoyageHygiene } from "./reinitialisationNettoyageHygiene";

type NettoyagePropositionsProps = {
  formattedNettoyagePropositions: (SelectNettoyageTarifsType & {
    freqAnnuelle: number;
    prixAnnuel: number;
  })[][];
  distribQuantites?: SelectHygieneDistribQuantitesType | null;
  distribTarifs?: SelectHygieneDistribTarifsType[];
  distribInstalTarifs?: SelectHygieneInstalDistribTarifsType[];
  consosTarifs?: SelectHygieneConsoTarifsType[];
};

const NettoyagePropositions = ({
  formattedNettoyagePropositions,
  distribQuantites,
  distribTarifs,
  distribInstalTarifs,
  consosTarifs,
}: NettoyagePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { setServices } = useContext(ServicesContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClickProposition = (
    fournisseurId: number,
    gamme: GammeType,
    nomEntreprise: string,
    prixAnnuel: number
  ) => {
    //Je décoche la proposition
    if (
      nettoyage.fournisseurId === fournisseurId &&
      nettoyage.gammeSelected === gamme
    ) {
      reinitialisationNettoyageHygiene(
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
      gammeSelected: gamme,
      repasseSelected: false,
      samediSelected: false,
      dimancheSelected: false,
      vitrerieSelected: false,
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

    //Car on ne travaille pas forcément avec le même fournisseur pour l'hygiène, la gamme essentielle et
    const hygieneFournisseurId = fournisseurId === 9 ? 12 : fournisseurId;
    const hygieneFournisseurName = fournisseurId === 9 ? "EPCH" : nomEntreprise;

    const effectif = client.effectif as number;
    const nbDistribEmp =
      (hygiene.nbDistribEmp || distribQuantites?.nbDistribEmp) ?? 0;
    const nbDistribSavon =
      (hygiene.nbDistribSavon || distribQuantites?.nbDistribSavon) ?? 0;
    const nbDistribPh =
      (hygiene.nbDistribPh || distribQuantites?.nbDistribPh) ?? 0;

    const distribTarifsDuFournisseur = distribTarifs?.filter(
      (tarif) => tarif.fournisseurId === hygieneFournisseurId
    );

    const dureeLocation = hygiene.dureeLocation;

    const tarifDistribEmp =
      distribTarifsDuFournisseur?.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === "essentiel"
      )?.[dureeLocation] ?? 0;

    const tarifDistribSavon =
      distribTarifsDuFournisseur?.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === "essentiel"
      )?.[dureeLocation] ?? 0;
    const tarifDistribPh =
      distribTarifsDuFournisseur?.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === "essentiel"
      )?.[dureeLocation] ?? 0;
    const consosTarif = consosTarifs?.find(
      (item) => item.fournisseurId === hygieneFournisseurId
    );

    const distribInstalTarif = distribInstalTarifs?.find(
      (item) => item.fournisseurId === hygieneFournisseurId
    );

    const prixAnnuelConsommables =
      ((consosTarif?.paParPersonneEmp ?? 0) +
        (consosTarif?.paParPersonneSavon ?? 0) +
        (consosTarif?.paParPersonnePh ?? 0)) *
      effectif;
    const prixAnnuelDistributeurs =
      nbDistribEmp * tarifDistribEmp +
      nbDistribSavon * tarifDistribSavon +
      nbDistribPh * tarifDistribPh;
    const prixAnnuelInstalDistributeurs =
      distribInstalTarif?.prixInstallation ?? 0;
    const prixAnnuelTrilogie =
      prixAnnuelConsommables +
      prixAnnuelDistributeurs +
      prixAnnuelInstalDistributeurs;

    setHygiene((prev) => ({
      ...prev,
      fournisseurId: hygieneFournisseurId,
      dureeLocation: "pa12M",
      trilogieGammeSelected: "essentiel",
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    }));
    //J'ai calcule le prix de la trilogie avec le fournisseur d'hygiene et la gamme essentielle
    setTotalHygiene({
      nomFournisseur: hygieneFournisseurName,
      prixTrilogieAbonnement: prixAnnuelTrilogie,
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
                      nettoyage.fournisseurId === proposition.fournisseurId &&
                      nettoyage.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() =>
                      handleClickProposition(
                        proposition.fournisseurId,
                        proposition.gamme,
                        proposition.nomEntreprise,
                        proposition.prixAnnuel
                      )
                    }
                  >
                    <Checkbox
                      checked={
                        nettoyage.fournisseurId === proposition.fournisseurId &&
                        nettoyage.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(
                          proposition.fournisseurId,
                          proposition.gamme,
                          proposition.nomEntreprise,
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
