import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { locationDistribProprete } from "@/constants/locationsDistribProprete";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { formatNumber } from "@/lib/formatNumber";
import { SelectPropreteConsoTarifsType } from "@/zod-schemas/propreteConsoTarifs";
import { SelectPropreteDistribQuantiteType } from "@/zod-schemas/propreteDistribQuantite";
import { SelectPropreteDistribTarifsType } from "@/zod-schemas/propreteDistribTarifs";
import { SelectPropreteInstalDistribTarifsType } from "@/zod-schemas/propreteInstalDistribTarifs";
import { Dispatch, SetStateAction, useContext, useState } from "react";

type TabsContentTrilogieProps = {
  distribQuantites:
    | (SelectPropreteDistribQuantiteType & {
        nb_distrib_desinfectant: number;
        nb_distrib_parfum: number;
        nb_distrib_balai: number;
        nb_distrib_poubelle: number;
      })
    | null;
  distribTarifs: SelectPropreteDistribTarifsType[];
  distribInstalTarifs: SelectPropreteInstalDistribTarifsType[];
  consoTarifs: SelectPropreteConsoTarifsType[];
  trilogieGammeSelected: string | null;
  setTrilogieGammeSelected: Dispatch<SetStateAction<string | null>>;
};

const TabsContentTrilogie = ({
  distribQuantites,
  distribTarifs,
  distribInstalTarifs,
  consoTarifs,
  trilogieGammeSelected,
  setTrilogieGammeSelected,
}: TabsContentTrilogieProps) => {
  const { devisData } = useContext(DevisDataContext);
  const [nbDistribEmp, setNbDistribEmp] = useState(
    distribQuantites?.nbDistribEmp ?? 0
  );
  const [nbDistribSavon, setNbDistribSavon] = useState(
    distribQuantites?.nbDistribSavon ?? 0
  );
  const [nbDistribPh, setNbDistribPh] = useState(
    distribQuantites?.nbDistribPh ?? 0
  );
  const [dureeLocation, setDureeLocation] = useState("pa36M");

  //Pour chaque gamme :
  // - calculer le prix annuel consommables trilogie
  // - calculer le prix annuel distributeurs trilogie
  // - calculer le prix annuel installation distributeurs trilogie
  const gammes = ["essentiel", "confort", "excellence"];
  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsConsommables:
      (consoTarifs[0].paParPersonneEmp +
        consoTarifs[0].paParPersonneSavon +
        consoTarifs[0].paParPersonnePh) *
      (parseInt(devisData.firstCompanyInfo.effectif) as number),
    tarifsDistributeurs:
      nbDistribEmp *
        (distribTarifs.find(
          (tarif) => tarif.type === "emp" && tarif.gamme === gamme
        )?.[
          dureeLocation as "pa12M" | "pa24M" | "pa36M" | "oneShot"
        ] as number) +
      nbDistribSavon *
        (distribTarifs.find(
          (tarif) => tarif.type === "savon" && tarif.gamme === gamme
        )?.[
          dureeLocation as "pa12M" | "pa24M" | "pa36M" | "oneShot"
        ] as number) +
      nbDistribPh *
        (distribTarifs.find(
          (tarif) => tarif.type === "ph" && tarif.gamme === gamme
        )?.[
          dureeLocation as "pa12M" | "pa24M" | "pa36M" | "oneShot"
        ] as number),
    tarifsInstalDistributeurs: distribInstalTarifs[0].prixInstallation,
  }));

  const handleClickProposition = (gamme: string) => {
    if (trilogieGammeSelected === gamme) {
      setTrilogieGammeSelected(null);
      return;
    }
    setTrilogieGammeSelected(gamme);
  };

  return (
    <TabsContent value="trilogie" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        <div
          className="flex border-b flex-1"
          key={distribTarifs[0].fournisseurId}
        >
          <div className="flex w-1/4 items-center justify-center flex-col gap-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-lg">
                    {distribTarifs[0].nomEntreprise}
                  </div>
                </TooltipTrigger>
                {distribTarifs[0].slogan && (
                  <TooltipContent>
                    <p className="text-sm italic">{distribTarifs[0].slogan}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <div className="flex flex-col gap-8">
              <div>
                <Slider
                  value={[nbDistribEmp]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(number) => setNbDistribEmp(number[0])}
                  className="flex-1"
                />
                <label htmlFor="nbDeDistribEmp">
                  {nbDistribEmp} distributeurs essuie-main papier
                </label>
              </div>
              <div>
                <Slider
                  value={[nbDistribSavon]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(number) => setNbDistribSavon(number[0])}
                  className="flex-1"
                />
                <label htmlFor="nbDistribSavon">
                  {nbDistribSavon} distributeurs savon
                </label>
              </div>
              <div>
                <Slider
                  value={[nbDistribPh]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(number) => setNbDistribPh(number[0])}
                  className="flex-1"
                />
                <label htmlFor="nbDistribSavon">
                  {nbDistribPh} distributeurs papier hygiénique
                </label>
              </div>
              <div>
                <Select
                  onValueChange={(value) => {
                    setDureeLocation(value);
                  }}
                  value={dureeLocation}
                >
                  <SelectTrigger className={`w-full max-w-xs`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationDistribProprete?.map((item) => {
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
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                  trilogieGammeSelected === gamme
                    ? "border-2 border-destructive"
                    : ""
                } px-8`}
                key={proposition.gamme}
                onClick={() => handleClickProposition(gamme)}
              >
                <Checkbox
                  checked={trilogieGammeSelected === gamme}
                  onCheckedChange={() => handleClickProposition(gamme)}
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {dureeLocation === "oneShot" ? (
                    <>
                      <p className="font-bold">
                        {formatNumber(
                          (proposition.tarifsDistributeurs +
                            proposition.tarifsInstalDistributeurs) /
                            10000
                        )}{" "}
                        € (distributeurs)
                      </p>
                      <p>&</p>
                      <p className="font-bold">
                        {formatNumber(proposition.tarifsConsommables / 10000)} €
                        / an (consommables)
                      </p>
                    </>
                  ) : (
                    <p className="font-bold">
                      {formatNumber(
                        (proposition.tarifsConsommables +
                          proposition.tarifsDistributeurs +
                          proposition.tarifsInstalDistributeurs) /
                          10000
                      )}{" "}
                      € / an
                    </p>
                  )}
                  <p className="text-sm">
                    Distributeurs{" "}
                    {gamme === "essentiel"
                      ? "simples blancs"
                      : gamme === "confort"
                      ? "couleur (noir ou gris)"
                      : "inox"}
                  </p>
                  <p className="text-sm">
                    {dureeLocation === "oneShot"
                      ? "Achat des distributeurs"
                      : `Location avec engagement de
                    ${
                      dureeLocation === "pa12M"
                        ? "12"
                        : dureeLocation === "pa24M"
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
    </TabsContent>
  );
};

export default TabsContentTrilogie;

//A l'achat il y a le tarif distributeurs
//et le tarif des consommables / an
