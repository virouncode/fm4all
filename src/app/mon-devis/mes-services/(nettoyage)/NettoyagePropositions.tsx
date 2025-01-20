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
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import Image from "next/image";
import { useContext } from "react";

type NettoyagePropositionsProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageTarifs: SelectNettoyageTarifsType[];
  repasseTarifs: SelectRepasseTarifsType[];
  vitrerieTarifs: SelectVitrerieTarifsType[];
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const NettoyagePropositions = ({
  nettoyageQuantites,
  nettoyageTarifs,
  repasseTarifs,
  vitrerieTarifs,
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
}: NettoyagePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setHygiene } = useContext(HygieneContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    freqAnnuelle: number;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    prixAnnuel: number;
  }) => {
    //Je décoche la proposition
    if (
      nettoyage.infos.fournisseurId === proposition.fournisseurId &&
      nettoyage.infos.gammeSelected === proposition.gamme
    ) {
      setNettoyage((prev) => ({
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          gammeSelected: null,
        },
        quantites: {
          ...prev.quantites,
          freqAnnuelle: 0,
          hParPassage: 0,
          hParPassageRepasse: 0,
          cadenceCloisons: 0,
          cadenceVitres: 0,
        },
        prix: {
          tauxHoraire: 0,
          tauxHoraireRepasse: 0,
          tauxHoraireVitrerie: 0,
          minFacturationVitrerie: 0,
        },
      }));
      setTotalNettoyage({
        totalService: 0,
        totalRepasse: 0,
        totalSamedi: 0,
        totalDimanche: 0,
        totalVitrerie: 0,
      });
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
        },
        prix: {
          prixDistribEmp: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixDistribDesinfectant: null,
          prixDistribParfum: null,
          prixDistribBalai: null,
          prixDistribPoubelle: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
          paParPersonneDesinfectant: null,
        },
      }));
      setTotalHygiene({
        totalTrilogie: 0,
        totalDesinfectant: 0,
        totalParfum: 0,
        totalBalai: 0,
        totalPoubelle: 0,
      });
      return;
    }
    //Je coche la proposition
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      freqAnnuelle,
      gamme,
      hParPassage,
      tauxHoraire,
      prixAnnuel,
    } = proposition;
    const repasseTarif = repasseTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId && tarif.gamme === gamme
    );
    const hParPassageRepasse = repasseTarif?.hParPassage ?? 0;
    const tauxHoraireRepasse = repasseTarif?.tauxHoraire ?? 0;
    const vitrerieTarif = vitrerieTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    const tauxHoraireVitrerie = vitrerieTarif?.tauxHoraire ?? 0;
    const minFacturationVitrerie = vitrerieTarif?.minFacturation ?? 0;
    const cadenceVitres = vitrerieTarif?.cadenceVitres ?? 0;
    const cadenceCloisons = vitrerieTarif?.cadenceCloisons ?? 0;

    setNettoyage((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        gammeSelected: gamme,
      },
      quantites: {
        ...prev.quantites,
        freqAnnuelle,
        hParPassage,
        hParPassageRepasse,
        cadenceCloisons,
        cadenceVitres,
      },
      prix: {
        tauxHoraire,
        tauxHoraireRepasse,
        tauxHoraireVitrerie,
        minFacturationVitrerie,
      },
    }));

    const totalRepasse = nettoyage.infos.repasseSelected
      ? Math.round(freqAnnuelle * hParPassageRepasse * tauxHoraireRepasse)
      : 0;
    const totalSamedi = nettoyage.infos.samediSelected
      ? Math.round(52 * tauxHoraire * hParPassage)
      : 0;
    const totalDimanche = nettoyage.infos.dimancheSelected
      ? Math.round(52 * tauxHoraire * hParPassage * 1.2)
      : 0;
    const totalVitrerie = nettoyage.infos.vitrerieSelected
      ? Math.round(
          nettoyage.quantites.nbPassagesVitrerie *
            Math.max(
              (((client.surface ?? 0) * 0.15) / cadenceVitres) *
                tauxHoraireVitrerie +
                (((client.surface ?? 0) * 0.15) / cadenceCloisons) *
                  tauxHoraireVitrerie,
              minFacturationVitrerie
            )
        )
      : 0;
    setTotalNettoyage({
      totalService: prixAnnuel,
      totalRepasse,
      totalSamedi,
      totalDimanche,
      totalVitrerie,
    });

    const hygieneFournisseurId = fournisseurId === 9 ? 12 : fournisseurId;
    const hygieneFournisseurNom = fournisseurId === 9 ? "EPCH" : nomFournisseur;
    const distribsTarifsPourFournisseur = hygieneDistribTarifs.filter(
      (tarif) => tarif.fournisseurId === hygieneFournisseurId
    );
    const prixDistribEmp =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribSavon =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribPh =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribDesinfectant =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribParfum =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribBalai =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribPoubelle =
      distribsTarifsPourFournisseur.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;

    const consosTarifPourFournisseur = hygieneConsosTarifs.find(
      (tarif) => tarif.fournisseurId === hygieneFournisseurId
    );
    const paParPersonneEmp = consosTarifPourFournisseur?.paParPersonneEmp ?? 0;
    const paParPersonneSavon =
      consosTarifPourFournisseur?.paParPersonneSavon ?? 0;
    const paParPersonnePh = consosTarifPourFournisseur?.paParPersonnePh ?? 0;
    const paParPersonneDesinfectant =
      consosTarifPourFournisseur?.paParPersonneDesinfectant ?? 0;
    const prixInstalDistrib =
      hygieneDistribInstalTarifs.find(
        (tarif) => tarif.fournisseurId === hygieneFournisseurId
      )?.prixInstallation ?? 0;

    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        fournisseurId: hygieneFournisseurId,
        nomFournisseur: hygieneFournisseurNom,
        sloganFournisseur:
          hygieneFournisseurNom === "EPCH"
            ? "Le spécialiste de l'hygiène"
            : sloganFournisseur,
      },
      prix: {
        prixDistribEmp,
        prixDistribSavon,
        prixDistribPh,
        prixDistribDesinfectant,
        prixDistribParfum,
        prixDistribBalai,
        prixDistribPoubelle,
        prixInstalDistrib,
        paParPersonneEmp,
        paParPersonneSavon,
        paParPersonnePh,
        paParPersonneDesinfectant,
      },
    }));
    const nbDistribEmp =
      hygiene.quantites.nbDistribEmp ?? hygieneDistribQuantite.nbDistribEmp;
    const nbDistribSavon =
      hygiene.quantites.nbDistribSavon ?? hygieneDistribQuantite.nbDistribSavon;
    const nbDistribPh =
      hygiene.quantites.nbDistribPh ?? hygieneDistribQuantite.nbDistribPh;
    const nbDistribDesinfectant =
      hygiene.quantites.nbDistribDesinfectant ??
      hygieneDistribQuantite.nbDistribDesinfectant;
    const nbDistribParfum =
      hygiene.quantites.nbDistribParfum ??
      hygieneDistribQuantite.nbDistribParfum;
    const nbDistribBalai =
      hygiene.quantites.nbDistribBalai ?? hygieneDistribQuantite.nbDistribBalai;
    const nbDistribPoubelle =
      hygiene.quantites.nbDistribPoubelle ??
      hygieneDistribQuantite.nbDistribPoubelle;

    const totalTrilogie = hygiene.infos.trilogieGammeSelected
      ? Math.round(
          nbDistribEmp * prixDistribEmp +
            nbDistribSavon * prixDistribSavon +
            nbDistribPh * prixDistribPh +
            prixInstalDistrib +
            (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
              (client.effectif ?? 0)
        )
      : 0;
    const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
      ? Math.round(
          nbDistribDesinfectant * prixDistribDesinfectant +
            paParPersonneDesinfectant * (client.effectif ?? 0)
        )
      : 0;
    const totalParfum = hygiene.infos.parfumGammeSelected
      ? Math.round(nbDistribParfum * prixDistribParfum)
      : 0;
    const totalBalai = hygiene.infos.balaiGammeSelected
      ? Math.round(nbDistribBalai * prixDistribBalai)
      : 0;
    const totalPoubelle = hygiene.infos.poubelleGammeSelected
      ? Math.round(nbDistribPoubelle * prixDistribPoubelle)
      : 0;
    setTotalHygiene({
      totalTrilogie,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
    });
  };

  //Formatter les propositions de nettoyage
  const nettoyagePropositions = nettoyageTarifs.map((item) => {
    const {
      id,
      fournisseurId,
      nomFournisseur,
      slogan: sloganFournisseur,
      hParPassage,
      tauxHoraire,
      gamme,
    } = item;
    const freqAnnuelle =
      nettoyageQuantites.find((quantite) => quantite.gamme === gamme)
        ?.freqAnnuelle ?? 0;
    const prixAnnuel = Math.round(freqAnnuelle * hParPassage * tauxHoraire);
    return {
      id,
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      freqAnnuelle,
      hParPassage,
      tauxHoraire,
      gamme,
      prixAnnuel,
    };
  });

  const nettoyagePropositionsByFournisseurId = nettoyagePropositions.reduce<
    Record<
      number,
      {
        id: number;
        fournisseurId: number;
        nomFournisseur: string;
        sloganFournisseur: string | null;
        freqAnnuelle: number;
        hParPassage: number;
        tauxHoraire: number;
        gamme: GammeType;
        prixAnnuel: number;
      }[]
    >
  >((acc, item) => {
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme)
    );
    return acc;
  }, {});

  //Un tableau de tableaux de propositions de nettoyage par fournisseur pour itérer
  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

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
                            alt={`logo-de-${propositions[0].nomFournisseur}`}
                            fill={true}
                            className="w-full h-full object-contain"
                            quality={100}
                          />
                        </div>
                      ) : (
                        propositions[0].nomFournisseur
                      )}
                    </div>
                  </TooltipTrigger>
                  {propositions[0].sloganFournisseur && (
                    <TooltipContent>
                      <p className="text-sm italic">
                        {propositions[0].sloganFournisseur}
                      </p>
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
                const prixAnnuelText = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";
                const hParSemaineText =
                  proposition.hParPassage && proposition.freqAnnuelle
                    ? `${formatNumber(
                        (proposition.hParPassage * proposition.freqAnnuelle) /
                          S_OUVREES_PAR_AN
                      )} h / semaine*`
                    : "";
                const nbPassagesParSemaineText =
                  proposition.freqAnnuelle && proposition.hParPassage
                    ? `${formatNumber(
                        proposition.freqAnnuelle / S_OUVREES_PAR_AN
                      )} passage(s) de ${proposition.hParPassage}h / semaine`
                    : "";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      nettoyage.infos.fournisseurId ===
                        proposition.fournisseurId &&
                      nettoyage.infos.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition)}
                  >
                    <Checkbox
                      checked={
                        nettoyage.infos.fournisseurId ===
                          proposition.fournisseurId &&
                        nettoyage.infos.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(proposition)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuelText}</p>
                      <p className="text-base">{hParSemaineText}</p>
                      <p className="text-xs">{nbPassagesParSemaineText}</p>
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
