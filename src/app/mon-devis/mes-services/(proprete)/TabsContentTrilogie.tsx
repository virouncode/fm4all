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
import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { PropreteContext } from "@/context/PropreteProvider";
import { formatNumber } from "@/lib/formatNumber";
import { DureeLocationType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectPropreteConsoTarifsType } from "@/zod-schemas/propreteConsoTarifs";
import { SelectPropreteDistribQuantiteType } from "@/zod-schemas/propreteDistribQuantite";
import { SelectPropreteDistribTarifsType } from "@/zod-schemas/propreteDistribTarifs";
import { SelectPropreteInstalDistribTarifsType } from "@/zod-schemas/propreteInstalDistribTarifs";
import { useContext } from "react";

type TabsContentTrilogieProps = {
  distribQuantites:
    | (SelectPropreteDistribQuantiteType & {
        nbDistribDesinfectant: number;
        nbDistribParfum: number;
        nbDistribBalai: number;
        nbDistribPoubelle: number;
      })
    | null;
  distribTarifs: SelectPropreteDistribTarifsType[];
  distribInstalTarifs: SelectPropreteInstalDistribTarifsType[];
  consoTarifs: SelectPropreteConsoTarifsType[];
};

const TabsContentTrilogie = ({
  distribQuantites,
  distribTarifs,
  distribInstalTarifs,
  consoTarifs,
}: TabsContentTrilogieProps) => {
  const { proprete, setProprete } = useContext(PropreteContext);
  const { companyInfo } = useContext(CompanyInfoContext);

  console.log("distribTarifs", distribTarifs);

  //Pour chaque gamme :
  // - calculer le prix annuel consommables trilogie
  // - calculer le prix annuel distributeurs trilogie
  // - calculer le prix annuel installation distributeurs trilogie
  const gammes = ["essentiel", "confort", "excellence"] as const;
  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsConsommables:
      (consoTarifs[0].paParPersonneEmp +
        consoTarifs[0].paParPersonneSavon +
        consoTarifs[0].paParPersonnePh) *
      parseInt(companyInfo.effectif),
    tarifsDistributeurs:
      ((proprete.nbDistribEmp || distribQuantites?.nbDistribEmp) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "emp" && tarif.gamme === gamme
        )?.[proprete.dureeLocation] ?? 0) +
      ((proprete.nbDistribSavon || distribQuantites?.nbDistribSavon) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "savon" && tarif.gamme === gamme
        )?.[proprete.dureeLocation] ?? 0) +
      ((proprete.nbDistribPh || distribQuantites?.nbDistribPh) ?? 0) *
        (distribTarifs.find(
          (tarif) => tarif.type === "ph" && tarif.gamme === gamme
        )?.[proprete.dureeLocation] ?? 0),
    tarifsInstalDistributeurs: distribInstalTarifs[0].prixInstallation,
  }));

  const handleClickProposition = (gamme: GammeType) => {
    if (proprete.trilogieGammeSelected === gamme) {
      setProprete((prev) => ({
        ...prev,
        trilogieGammeSelected: null,
      }));
      return;
    }
    setProprete((prev) => ({
      ...prev,
      trilogieGammeSelected: gamme,
    }));
  };

  const handleChangeDistribNbr = (type: string, value: number[]) => {
    const number = value[0];
    switch (type) {
      case "emp":
        setProprete((prev) => ({
          ...prev,
          nbDistribEmp: number,
        }));
        break;
      case "savon":
        setProprete((prev) => ({
          ...prev,
          nbDistribSavon: number,
        }));
        break;
      case "ph":
        setProprete((prev) => ({
          ...prev,
          nbDistribPh: number,
        }));
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationType) => {
    setProprete((prev) => ({
      ...prev,
      dureeLocation: value,
    }));
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
                  value={[
                    (proprete.nbDistribEmp || distribQuantites?.nbDistribEmp) ??
                      0,
                  ]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleChangeDistribNbr("emp", value)
                  }
                  className="flex-1"
                />
                <label htmlFor="nbDeDistribEmp" className="text-sm">
                  {(proprete.nbDistribEmp || distribQuantites?.nbDistribEmp) ??
                    0}{" "}
                  distributeurs essuie-main papier
                </label>
              </div>
              <div>
                <Slider
                  value={[
                    (proprete.nbDistribSavon ||
                      distribQuantites?.nbDistribSavon) ??
                      0,
                  ]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    handleChangeDistribNbr("savon", value)
                  }
                  className="flex-1"
                />
                <label htmlFor="nbDistribSavon" className="text-sm">
                  {(proprete.nbDistribSavon ||
                    distribQuantites?.nbDistribSavon) ??
                    0}{" "}
                  distributeurs savon
                </label>
              </div>
              <div>
                <Slider
                  value={[
                    (proprete.nbDistribPh || distribQuantites?.nbDistribPh) ??
                      0,
                  ]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleChangeDistribNbr("ph", value)}
                  className="flex-1"
                />
                <label htmlFor="nbDistribSavon" className="text-sm">
                  {(proprete.nbDistribPh || distribQuantites?.nbDistribPh) ?? 0}{" "}
                  distributeurs papier hygiénique
                </label>
              </div>
              <div>
                <Select
                  onValueChange={handleChangeDureeLocation}
                  value={proprete.dureeLocation}
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
                  proprete.trilogieGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={proposition.gamme}
                onClick={() => handleClickProposition(gamme)}
              >
                <Checkbox
                  checked={proprete.trilogieGammeSelected === gamme}
                  onCheckedChange={() => handleClickProposition(gamme)}
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {proprete.dureeLocation === "oneShot" ? (
                    <>
                      <p className="font-bold">
                        {formatNumber(
                          (proposition.tarifsDistributeurs +
                            proposition.tarifsInstalDistributeurs) /
                            10000
                        )}{" "}
                        € <span className="text-xs">(distributeurs)</span>
                      </p>
                      <p>&</p>
                      <p className="font-bold">
                        {formatNumber(proposition.tarifsConsommables / 10000)} €
                        / an <span className="text-xs">(conso)</span>
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
                      ? "blancs basic"
                      : gamme === "confort"
                      ? "couleur (noir, gris, blanc premium...)"
                      : "inox"}
                  </p>
                  <p className="text-sm">Consommables</p>
                  <p className="text-sm">
                    {proprete.dureeLocation === "oneShot"
                      ? ""
                      : `Location engagement
                    ${
                      proprete.dureeLocation === "pa12M"
                        ? "12"
                        : proprete.dureeLocation === "pa24M"
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
