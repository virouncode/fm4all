import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type HygienePropositionsProps = {
  distribQuantites: SelectHygieneDistribQuantitesType;
  distribTarifs: SelectHygieneDistribTarifsType[];
  distribInstalTarif: SelectHygieneInstalDistribTarifsType;
  consosTarif: SelectHygieneConsoTarifsType;
};

const HygienePropositions = ({
  distribQuantites,
  distribTarifs,
  distribInstalTarif,
  consosTarif,
}: HygienePropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  //Pour chaque gamme :
  // - calculer le prix annuel consommables trilogie
  // - calculer le prix annuel distributeurs trilogie
  // - calculer le prix annuel installation distributeurs trilogie
  // Un seul fournisseur 3 gammes :
  const effectif = client.effectif as number;
  const nbDistribEmp = hygiene.nbDistribEmp || distribQuantites.nbDistribEmp;
  const nbDistribSavon =
    hygiene.nbDistribSavon || distribQuantites.nbDistribSavon;
  const nbDistribPh = hygiene.nbDistribPh || distribQuantites.nbDistribPh;
  const dureeLocation = hygiene.dureeLocation;

  const propositions = gammes.map((gamme) => ({
    gamme, //la gamme suffit a identifier la proposition car il n'y a qu'un fournisseur
    tarifDistribEmp:
      distribTarifs.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0,
    tarifDistribSavon:
      distribTarifs.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0,
    tarifDistribPh:
      distribTarifs.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0,
    prixAnnuelConsommables:
      (consosTarif.paParPersonneEmp +
        consosTarif.paParPersonneSavon +
        consosTarif.paParPersonnePh) *
      effectif,
    prixAnnuelDistributeurs:
      nbDistribEmp *
        (distribTarifs.find(
          (tarif) => tarif.type === "emp" && tarif.gamme === gamme
        )?.[dureeLocation] ?? 0) +
      nbDistribSavon *
        (distribTarifs.find(
          (tarif) => tarif.type === "savon" && tarif.gamme === gamme
        )?.[dureeLocation] ?? 0) +
      nbDistribPh *
        (distribTarifs.find(
          (tarif) => tarif.type === "ph" && tarif.gamme === gamme
        )?.[dureeLocation] ?? 0),
    prixAnnuelInstalDistributeurs: distribInstalTarif.prixInstallation,
  }));

  const handleClickProposition = (gamme: GammeType) => {
    //Je décoche la proposition
    if (gamme === hygiene.trilogieGammeSelected) {
      setHygiene((prev) => ({
        ...prev,
        trilogieGammeSelected: null,
        desinfectantGammeSelected: null,
        parfumGammeSelected: null,
        balaiGammeSelected: null,
        poubelleGammeSelected: null,
      }));
      setTotalHygiene((prev) => ({
        ...prev,
        prixTrilogieAbonnement: null,
        prixTrilogieAchat: null,
        prixDesinfectantAbonnement: null,
        prixDesinfectantAchat: null,
        prixParfum: null,
        prixBalai: null,
        prixPoubelle: null,
      }));
      return;
    }
    //Je coche la proposition
    setHygiene((prev) => ({
      ...prev,
      trilogieGammeSelected: gamme,
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    }));
    const proposition = propositions.find(
      (proposition) => proposition.gamme === gamme
    );
    if (proposition)
      setTotalHygiene((prev) => ({
        ...prev,
        prixTrilogieAbonnement:
          hygiene.dureeLocation === "oneShot"
            ? null
            : Math.round(
                proposition.prixAnnuelConsommables +
                  proposition.prixAnnuelDistributeurs +
                  proposition.prixAnnuelInstalDistributeurs
              ),
        prixTrilogieAchat:
          hygiene.dureeLocation === "oneShot"
            ? {
                prixAchat: Math.round(
                  proposition.prixAnnuelDistributeurs +
                    proposition.prixAnnuelInstalDistributeurs
                ),
                prixConsommables: Math.round(
                  proposition.prixAnnuelConsommables
                ),
              }
            : null,
      }));
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;
    switch (type) {
      case "emp":
        const newNbDistribEmp = value
          ? parseInt(value)
          : distribQuantites?.nbDistribEmp ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribEmp: value ? parseInt(value) : newNbDistribEmp,
        }));
        if (hygiene.trilogieGammeSelected) {
          const proposition = propositions.find(
            ({ gamme }) => gamme === hygiene.trilogieGammeSelected
          ) as {
            gamme: "essentiel" | "confort" | "excellence";
            tarifDistribEmp: number;
            tarifDistribSavon: number;
            tarifDistribPh: number;
            prixAnnuelConsommables: number;
            prixAnnuelDistributeurs: number;
            prixAnnuelInstalDistributeurs: number;
          };
          setTotalHygiene((prev) => ({
            ...prev,
            prixTrilogieAbonnement:
              hygiene.dureeLocation === "oneShot"
                ? null
                : Math.round(
                    newNbDistribEmp * proposition.tarifDistribEmp +
                      nbDistribSavon * proposition.tarifDistribSavon +
                      nbDistribPh * proposition.tarifDistribPh +
                      proposition.prixAnnuelConsommables +
                      proposition.prixAnnuelInstalDistributeurs
                  ),
            prixTrilogieAchat:
              hygiene.dureeLocation === "oneShot"
                ? {
                    prixAchat: Math.round(
                      newNbDistribEmp * proposition.tarifDistribEmp +
                        nbDistribSavon * proposition.tarifDistribSavon +
                        nbDistribPh * proposition.tarifDistribPh +
                        proposition.prixAnnuelInstalDistributeurs
                    ),
                    prixConsommables: Math.round(
                      proposition.prixAnnuelConsommables
                    ),
                  }
                : null,
          }));
        }
        break;
      case "savon":
        const newNbDistribSavon = value
          ? parseInt(value)
          : distribQuantites?.nbDistribSavon ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribSavon: newNbDistribSavon,
        }));
        if (hygiene.trilogieGammeSelected) {
          const proposition = propositions.find(
            ({ gamme }) => gamme === hygiene.trilogieGammeSelected
          ) as {
            gamme: "essentiel" | "confort" | "excellence";
            tarifDistribEmp: number;
            tarifDistribSavon: number;
            tarifDistribPh: number;
            prixAnnuelConsommables: number;
            prixAnnuelDistributeurs: number;
            prixAnnuelInstalDistributeurs: number;
          };
          setTotalHygiene((prev) => ({
            ...prev,
            prixTrilogieAbonnement:
              hygiene.dureeLocation === "oneShot"
                ? null
                : Math.round(
                    nbDistribEmp * proposition.tarifDistribEmp +
                      newNbDistribSavon * proposition.tarifDistribSavon +
                      nbDistribPh * proposition.tarifDistribPh +
                      proposition.prixAnnuelConsommables +
                      proposition.prixAnnuelInstalDistributeurs
                  ),
            prixTrilogieAchat:
              hygiene.dureeLocation === "oneShot"
                ? {
                    prixAchat: Math.round(
                      nbDistribEmp * proposition.tarifDistribEmp +
                        newNbDistribSavon * proposition.tarifDistribSavon +
                        nbDistribPh * proposition.tarifDistribPh +
                        proposition.prixAnnuelInstalDistributeurs
                    ),
                    prixConsommables: Math.round(
                      proposition.prixAnnuelConsommables
                    ),
                  }
                : null,
          }));
        }
        break;
      case "ph":
        const newNbDistribPh = value
          ? parseInt(value)
          : distribQuantites?.nbDistribPh ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribPh: newNbDistribPh,
        }));
        if (hygiene.trilogieGammeSelected) {
          const proposition = propositions.find(
            ({ gamme }) => gamme === hygiene.trilogieGammeSelected
          ) as {
            gamme: "essentiel" | "confort" | "excellence";
            tarifDistribEmp: number;
            tarifDistribSavon: number;
            tarifDistribPh: number;
            prixAnnuelConsommables: number;
            prixAnnuelDistributeurs: number;
            prixAnnuelInstalDistributeurs: number;
          };
          setTotalHygiene((prev) => ({
            ...prev,
            prixTrilogieAbonnement:
              hygiene.dureeLocation === "oneShot"
                ? null
                : Math.round(
                    nbDistribEmp * proposition.tarifDistribEmp +
                      nbDistribSavon * proposition.tarifDistribSavon +
                      newNbDistribPh * proposition.tarifDistribPh +
                      proposition.prixAnnuelConsommables +
                      proposition.prixAnnuelInstalDistributeurs
                  ),
            prixTrilogieAchat:
              hygiene.dureeLocation === "oneShot"
                ? {
                    prixAchat: Math.round(
                      nbDistribEmp * proposition.tarifDistribEmp +
                        nbDistribSavon * proposition.tarifDistribSavon +
                        newNbDistribPh * proposition.tarifDistribPh +
                        proposition.prixAnnuelInstalDistributeurs
                    ),
                    prixConsommables: Math.round(
                      proposition.prixAnnuelConsommables
                    ),
                  }
                : null,
          }));
        }
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    setHygiene((prev) => ({
      ...prev,
      dureeLocation: value,
    }));
    if (hygiene.trilogieGammeSelected) {
      const newTarifDistribEmp =
        distribTarifs.find(
          (tarif) =>
            tarif.type === "emp" &&
            tarif.gamme === hygiene.trilogieGammeSelected
        )?.[value] ?? 0;
      const newTarifDistribSavon =
        distribTarifs.find(
          (tarif) =>
            tarif.type === "savon" &&
            tarif.gamme === hygiene.trilogieGammeSelected
        )?.[value] ?? 0;
      const newTarifDistribPh =
        distribTarifs.find(
          (tarif) =>
            tarif.type === "ph" && tarif.gamme === hygiene.trilogieGammeSelected
        )?.[value] ?? 0;
      const proposition = propositions.find(
        ({ gamme }) => gamme === hygiene.trilogieGammeSelected
      ) as {
        gamme: "essentiel" | "confort" | "excellence";
        tarifDistribEmp: number;
        tarifDistribSavon: number;
        tarifDistribPh: number;
        prixAnnuelConsommables: number;
        prixAnnuelDistributeurs: number;
        prixAnnuelInstalDistributeurs: number;
      };
      setTotalHygiene((prev) => ({
        ...prev,
        prixTrilogieAbonnement:
          value === "oneShot"
            ? null
            : Math.round(
                nbDistribEmp * newTarifDistribEmp +
                  nbDistribSavon * newTarifDistribSavon +
                  nbDistribPh * newTarifDistribPh +
                  proposition.prixAnnuelConsommables +
                  proposition.prixAnnuelInstalDistributeurs
              ),
        prixTrilogieAchat:
          value === "oneShot"
            ? {
                prixAchat: Math.round(
                  nbDistribEmp * newTarifDistribEmp +
                    nbDistribSavon * newTarifDistribSavon +
                    nbDistribPh * newTarifDistribPh +
                    proposition.prixAnnuelInstalDistributeurs
                ),
                prixConsommables: Math.round(
                  proposition.prixAnnuelConsommables
                ),
              }
            : null,
      }));
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-1/4 w-full py-2">
                  {getLogoFournisseurUrl(distribTarifs[0].fournisseurId) ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={
                          getLogoFournisseurUrl(
                            distribTarifs[0].fournisseurId
                          ) as string
                        }
                        alt={`logo-de-${distribTarifs[0].nomEntreprise}`}
                        fill={true}
                        className="w-full h-full object-contain"
                        quality={100}
                      />
                    </div>
                  ) : (
                    distribTarifs[0].nomEntreprise
                  )}
                </div>
              </TooltipTrigger>
              {distribTarifs[0].slogan && (
                <TooltipContent>
                  <p className="text-sm italic">{distribTarifs[0].slogan}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="flex flex-col gap-6 w-full p-4">
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribEmp}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "emp")}
                className={`w-16 ${
                  hygiene.nbDistribEmp === distribQuantites?.nbDistribEmp
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
                distributeurs essuie-main papier
              </Label>
            </div>

            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribSavon}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "savon")}
                className={`w-16 ${
                  hygiene.nbDistribSavon === distribQuantites?.nbDistribSavon
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribSavon" className="text-sm flex-1">
                distributeurs savon
              </Label>
            </div>
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribPh}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "ph")}
                className={`w-16 ${
                  hygiene.nbDistribPh === distribQuantites?.nbDistribPh
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribPh" className="text-sm flex-1">
                distributeurs papier hygiénique
              </Label>
            </div>

            <div>
              <Select
                onValueChange={handleChangeDureeLocation}
                value={dureeLocation}
              >
                <SelectTrigger className={`w-full max-w-xs`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationDistribHygiene
                    .filter(({ id }) => id !== "oneShot")
                    .map((item) => {
                      // Check if there is any tarif for the current item's id
                      const isDisabled = !distribTarifs.some((tarif) =>
                        ["pa12M", "pa24M", "pa36M", "oneShot"].some(
                          (key) =>
                            tarif[key as keyof typeof tarif] &&
                            item.id.toString() === key
                        )
                      );
                      return (
                        <SelectItem
                          key={`dureeLoc_${item.id}`}
                          value={item.id.toString() ?? ""}
                          disabled={isDisabled}
                        >
                          {item.description}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-destructive italic px-2 text-center">
              Les quantités sont estimées pour vous mais vous pouvez les changer
            </p>
          </div>
        </div>
        {propositions.map((proposition) => {
          const gamme = proposition.gamme;
          const color =
            gamme === "essentiel"
              ? "fm4allessential"
              : gamme === "confort"
              ? "fm4allcomfort"
              : "fm4allexcellence";

          const prixAnnuelDistribAchat = proposition.prixAnnuelDistributeurs
            ? `${formatNumber(
                Math.round(
                  proposition.prixAnnuelDistributeurs +
                    proposition.prixAnnuelInstalDistributeurs
                )
              )} €`
            : "Non proposé";
          const prixAnnuelConso = proposition.prixAnnuelConsommables
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelConsommables)
              )} € / an`
            : "";
          const prixAnnuelDistribLoc = proposition.prixAnnuelDistributeurs
            ? `${formatNumber(
                Math.round(
                  proposition.prixAnnuelDistributeurs +
                    proposition.prixAnnuelInstalDistributeurs +
                    proposition.prixAnnuelConsommables
                )
              )} € / an`
            : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                hygiene.trilogieGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={proposition.gamme}
              onClick={() => handleClickProposition(gamme)}
            >
              <Checkbox
                checked={hygiene.trilogieGammeSelected === gamme}
                onCheckedChange={() => handleClickProposition(gamme)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {hygiene.dureeLocation === "oneShot" ? (
                  <>
                    <p className="font-bold">
                      {prixAnnuelDistribAchat}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {prixAnnuelConso}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p className="font-bold">{prixAnnuelDistribLoc}</p>
                )}
                <p className="text-sm">
                  Distributeurs{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">Consommables</p>
                <p className="text-sm">
                  {hygiene.dureeLocation === "oneShot"
                    ? ""
                    : `Location engagement
                    ${
                      hygiene.dureeLocation === "pa12M"
                        ? "12"
                        : hygiene.dureeLocation === "pa24M"
                        ? "24"
                        : "36"
                    } mois`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HygienePropositions;
