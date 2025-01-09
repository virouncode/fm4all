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
import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { DureeLocationType } from "@/zod-schemas/dureeLocation";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantiteType } from "@/zod-schemas/hygieneDistribQuantite";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { ChangeEvent, useContext } from "react";

type HygienePropositionsProps = {
  distribQuantites:
    | (SelectHygieneDistribQuantiteType & {
        nbDistribDesinfectant: number;
        nbDistribParfum: number;
        nbDistribBalai: number;
        nbDistribPoubelle: number;
      })
    | null;
  distribTarifs: SelectHygieneDistribTarifsType[];
  distribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  consoTarifs: SelectHygieneConsoTarifsType[];
};

const HygienePropositions = ({
  distribQuantites,
  distribTarifs,
  distribInstalTarifs,
  consoTarifs,
}: HygienePropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { companyInfo } = useContext(CompanyInfoContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

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
    tarifsInstalDistributeurs: distribInstalTarifs[0].prixInstallation,
  }));

  const handleClickProposition = (gamme: GammeType) => {
    if (hygiene.trilogieGammeSelected === gamme) {
      setHygiene((prev) => ({
        ...prev,
        trilogieGammeSelected: null,
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
            : (proposition.tarifsConsommables +
                proposition.tarifsDistributeurs +
                proposition.tarifsInstalDistributeurs) /
              10000,
        prixTrilogieAchat:
          hygiene.dureeLocation === "oneShot"
            ? {
                prixAchat:
                  (proposition.tarifsDistributeurs +
                    proposition.tarifsInstalDistributeurs) /
                  10000,
                prixConsommables: proposition.tarifsConsommables / 10000,
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

  const handleChangeDureeLocation = (value: DureeLocationType) => {
    setHygiene((prev) => ({
      ...prev,
      dureeLocation: value,
    }));
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col gap-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-lg">{distribTarifs[0].nomEntreprise}</div>
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
                proposition.tarifsDistributeurs +
                  proposition.tarifsInstalDistributeurs
              )} €`
            : "Non proposé";
          const tarifsConsosAnnuel = proposition.tarifsConsommables
            ? `${formatNumber(proposition.tarifsConsommables)} € / an`
            : "";
          const tarifsDistribLoc = proposition.tarifsDistributeurs
            ? `${formatNumber(
                proposition.tarifsDistributeurs +
                  proposition.tarifsInstalDistributeurs +
                  proposition.tarifsConsommables
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
