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
import { GammeType } from "@/zod-schemas/gamme";
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
  const gammes = ["essentiel", "confort", "excellence"] as const;

  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsConsommables:
      (consosTarif.paParPersonneEmp +
        consosTarif.paParPersonneSavon +
        consosTarif.paParPersonnePh) *
      (client.effectif as number),
    tarifsDistributeurs:
      ((hygiene.nbDistribEmp || distribQuantites?.nbDistribEmp) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "emp" && tarif.gamme === gamme
        )?.[hygiene.dureeLocation] ?? 0) +
      ((hygiene.nbDistribSavon || distribQuantites?.nbDistribSavon) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "savon" && tarif.gamme === gamme
        )?.[hygiene.dureeLocation] ?? 0) +
      ((hygiene.nbDistribPh || distribQuantites?.nbDistribPh) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "ph" && tarif.gamme === gamme
        )?.[hygiene.dureeLocation] ?? 0),
    tarifsInstalDistributeurs: distribInstalTarif.prixInstallation,
  }));

  const handleClickProposition = (gamme: GammeType) => {
    if (hygiene.trilogieGammeSelected === gamme) {
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
                proposition.tarifsConsommables +
                  proposition.tarifsDistributeurs +
                  proposition.tarifsInstalDistributeurs
              ),
        prixTrilogieAchat:
          hygiene.dureeLocation === "oneShot"
            ? {
                prixAchat: Math.round(
                  proposition.tarifsDistributeurs +
                    proposition.tarifsInstalDistributeurs
                ),
                prixConsommables: Math.round(proposition.tarifsConsommables),
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
        setHygiene((prev) => ({
          ...prev,
          nbDistribEmp: value
            ? parseInt(value)
            : distribQuantites?.nbDistribEmp ?? 0,
        }));
        break;
      case "savon":
        setHygiene((prev) => ({
          ...prev,
          nbDistribSavon: value
            ? parseInt(value)
            : distribQuantites?.nbDistribSavon ?? 0,
        }));
        break;
      case "ph":
        setHygiene((prev) => ({
          ...prev,
          nbDistribPh: value
            ? parseInt(value)
            : distribQuantites?.nbDistribPh ?? 0,
        }));
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    setHygiene((prev) => ({
      ...prev,
      dureeLocation: value,
    }));
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
                value={
                  (hygiene.nbDistribEmp || distribQuantites?.nbDistribEmp) ?? 0
                }
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
                value={
                  (hygiene.nbDistribSavon ||
                    distribQuantites?.nbDistribSavon) ??
                  0
                }
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
                value={
                  (hygiene.nbDistribPh || distribQuantites?.nbDistribPh) ?? 0
                }
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
                value={hygiene.dureeLocation}
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

          const tarifsDistribAchat = proposition.tarifsDistributeurs
            ? `${formatNumber(
                Math.round(
                  proposition.tarifsDistributeurs +
                    proposition.tarifsInstalDistributeurs
                )
              )} €`
            : "Non proposé";
          const tarifsConsosAnnuel = proposition.tarifsConsommables
            ? `${formatNumber(
                Math.round(proposition.tarifsConsommables)
              )} € / an`
            : "";
          const tarifsDistribLoc = proposition.tarifsDistributeurs
            ? `${formatNumber(
                Math.round(
                  proposition.tarifsDistributeurs +
                    proposition.tarifsInstalDistributeurs +
                    proposition.tarifsConsommables
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
                      {tarifsDistribAchat}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {tarifsConsosAnnuel}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p className="font-bold">{tarifsDistribLoc}</p>
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

//A l'achat il y a le tarif distributeurs
//et le tarif des consommables / an
