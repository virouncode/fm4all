import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { PropreteContext } from "@/context/PropreteProvider";
import { formatNumber } from "@/lib/formatNumber";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectPropreteConsoTarifsType } from "@/zod-schemas/propreteConsoTarifs";
import { SelectPropreteDistribQuantiteType } from "@/zod-schemas/propreteDistribQuantite";
import { SelectPropreteDistribTarifsType } from "@/zod-schemas/propreteDistribTarifs";
import { useContext } from "react";

type TabsContentPropreteOptionsProps = {
  distribQuantites:
    | (SelectPropreteDistribQuantiteType & {
        nbDistribDesinfectant: number;
        nbDistribParfum: number;
        nbDistribBalai: number;
        nbDistribPoubelle: number;
      })
    | null;
  distribTarifs: SelectPropreteDistribTarifsType[];
  consoTarifs: SelectPropreteConsoTarifsType[];
};

const TabsContentPropreteOptions = ({
  distribQuantites,
  distribTarifs,
  consoTarifs,
}: TabsContentPropreteOptionsProps) => {
  const { proprete, setProprete } = useContext(PropreteContext);
  const { companyInfo } = useContext(CompanyInfoContext);
  console.log(
    "proprete nb distrib desinfectant",
    proprete.nbDistribDesinfectant
  );
  console.log(
    "distribQuantites nb distrib desinfectant",
    distribQuantites?.nbDistribDesinfectant
  );
  console.log("distribQuantites", distribQuantites);

  const gammes = ["essentiel", "confort", "excellence"] as const;
  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsDesinfectant:
      consoTarifs[0].paParPersonneDesinfectant *
      (parseInt(companyInfo.effectif) as number),
    tarifsDistribDesinfectant:
      ((proprete.nbDistribDesinfectant ||
        distribQuantites?.nbDistribDesinfectant) ??
        0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[proprete.dureeLocation] ?? 0),
    tarifsDistribParfum:
      ((proprete.nbDistribParfum || distribQuantites?.nbDistribParfum) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[proprete.dureeLocation] ?? 0),
    tarifsDistribBalai:
      ((proprete.nbDistribBalai || distribQuantites?.nbDistribBalai) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[proprete.dureeLocation] ?? 0),
    tarifsDistribPoubelle:
      ((proprete.nbDistribPoubelle || distribQuantites?.nbDistribPoubelle) ??
        0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[proprete.dureeLocation] ?? 0),
  }));

  const handleClickProposition = (type: string, gamme: GammeType) => {
    switch (type) {
      case "desinfectant":
        if (proprete.desinfectantGammeSelected === gamme) {
          setProprete((prev) => ({
            ...prev,
            desinfectantGammeSelected: null,
          }));
          return;
        }
        setProprete((prev) => ({
          ...prev,
          desinfectantGammeSelected: gamme,
        }));

        return;
      case "parfum":
        if (proprete.parfumGammeSelected === gamme) {
          setProprete((prev) => ({
            ...prev,
            parfumGammeSelected: null,
          }));
          return;
        }
        setProprete((prev) => ({
          ...prev,
          parfumGammeSelected: gamme,
        }));
        return;
      case "balai":
        if (proprete.balaiGammeSelected === gamme) {
          setProprete((prev) => ({
            ...prev,
            balaiGammeSelected: null,
          }));
          return;
        }
        setProprete((prev) => ({
          ...prev,
          balaiGammeSelected: gamme,
        }));

        return;
      case "poubelle":
        if (proprete.poubelleGammeSelected === gamme) {
          setProprete((prev) => ({
            ...prev,
            poubelleGammeSelected: null,
          }));
          return;
        }
        setProprete((prev) => ({
          ...prev,
          poubelleGammeSelected: gamme,
        }));
        return;
    }
  };

  const handleChangeDistribNbr = (type: string, value: number[]) => {
    const number = value[0];
    switch (type) {
      case "desinfectant":
        setProprete((prev) => ({
          ...prev,
          nbDistribDesinfectant: number,
        }));
        return;
      case "parfum":
        setProprete((prev) => ({
          ...prev,
          nbDistribParfum: number,
        }));
        return;
      case "balai":
        setProprete((prev) => ({
          ...prev,
          nbDistribBalai: number,
        }));
        return;
      case "poubelle":
        setProprete((prev) => ({
          ...prev,
          nbDistribPoubelle: number,
        }));
    }
  };

  return (
    <TabsContent value="options" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        {/*1ère ligne */}
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center flex-col gap-6">
            <p className="text-lg">Desinfectant pour cuvettes</p>
            <div className="text-sm flex flex-col gap-2">
              <Slider
                value={[
                  (proprete.nbDistribDesinfectant ||
                    distribQuantites?.nbDistribDesinfectant) ??
                    0,
                ]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) =>
                  handleChangeDistribNbr("desinfectant", value)
                }
                className="flex-1"
              />
              <label htmlFor="nbDeDistribDesinfectant">
                {(proprete.nbDistribDesinfectant ||
                  distribQuantites?.nbDistribDesinfectant) ??
                  0}{" "}
                distributeurs
              </label>
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
            const dureeLocation = proprete.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  proprete.desinfectantGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"desinfectant" + gamme}
                onClick={() => handleClickProposition("desinfectant", gamme)}
              >
                {" "}
                <Checkbox
                  checked={proprete.desinfectantGammeSelected === gamme}
                  onCheckedChange={() =>
                    handleClickProposition("desinfectant", gamme)
                  }
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {dureeLocation === "oneShot" ? (
                    <>
                      <p className="font-bold">
                        {formatNumber(
                          proposition.tarifsDistribDesinfectant / 10000
                        )}{" "}
                        € (distributeurs)
                      </p>
                      <p>&</p>
                      <p className="font-bold">
                        {formatNumber(proposition.tarifsDesinfectant / 10000)} €
                        / an (consommables)
                      </p>
                    </>
                  ) : (
                    <p>
                      {formatNumber(
                        (proposition.tarifsDesinfectant +
                          proposition.tarifsDistribDesinfectant) /
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
                  <p className="text-sm">
                    {dureeLocation === "oneShot"
                      ? "Achat des distributeurs"
                      : `Location engagement
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
        {/*2ème ligne */}
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center flex-col gap-6">
            <p className="text-lg">Parfum</p>
            <div className="text-sm flex flex-col gap-2">
              <Slider
                value={[
                  (proprete.nbDistribParfum ||
                    distribQuantites?.nbDistribParfum) ??
                    0,
                ]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) =>
                  handleChangeDistribNbr("parfum", value)
                }
                className="flex-1"
              />
              <label htmlFor="nbDeDistribParfum">
                {(proprete.nbDistribParfum ||
                  distribQuantites?.nbDistribParfum) ??
                  0}{" "}
                distributeurs
              </label>
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
            const dureeLocation = proprete.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  proprete.parfumGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"parfum" + gamme}
                onClick={() => handleClickProposition("parfum", gamme)}
              >
                {" "}
                <Checkbox
                  checked={proprete.parfumGammeSelected === gamme}
                  onCheckedChange={() =>
                    handleClickProposition("parfum", gamme)
                  }
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {dureeLocation === "oneShot" ? (
                    <p className="font-bold">
                      {formatNumber(proposition.tarifsDistribParfum / 10000)} €
                    </p>
                  ) : (
                    <p>
                      {formatNumber(proposition.tarifsDistribParfum / 10000)} €
                      / an
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
                  <p className="text-sm">
                    {dureeLocation === "oneShot"
                      ? "Achat des distributeurs"
                      : `Location engagement
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
        {/*3ème ligne */}
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center flex-col gap-6">
            <p className="text-lg">Balais WC</p>
            <div className="text-sm flex flex-col gap-2">
              <Slider
                value={[
                  (proprete.nbDistribBalai ||
                    distribQuantites?.nbDistribBalai) ??
                    0,
                ]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) =>
                  handleChangeDistribNbr("balai", value)
                }
                className="flex-1"
              />
              <label htmlFor="nbDeDistribBalai">
                {(proprete.nbDistribBalai ||
                  distribQuantites?.nbDistribBalai) ??
                  0}{" "}
                blocs
              </label>
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
            const dureeLocation = proprete.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  proprete.balaiGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"balai" + gamme}
                onClick={() => handleClickProposition("balai", gamme)}
              >
                {" "}
                <Checkbox
                  checked={proprete.balaiGammeSelected === gamme}
                  onCheckedChange={() => handleClickProposition("balai", gamme)}
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {dureeLocation === "oneShot" ? (
                    <p className="font-bold">
                      {formatNumber(proposition.tarifsDistribBalai / 10000)} €
                    </p>
                  ) : (
                    <p>
                      {formatNumber(proposition.tarifsDistribBalai / 10000)} € /
                      an
                    </p>
                  )}
                  <p className="text-sm">
                    Socle et manche{" "}
                    {gamme === "essentiel"
                      ? "blancs basic"
                      : gamme === "confort"
                      ? "couleur (noir, gris, blanc premium...)"
                      : "inox"}
                  </p>
                  <p className="text-sm">
                    {dureeLocation === "oneShot"
                      ? "Achat des distributeurs"
                      : `Location engagement
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
        {/*4ème ligne */}
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center flex-col gap-6">
            <p className="text-lg">Poubelles hygiène féminine</p>
            <div className="text-sm flex flex-col gap-2">
              <Slider
                value={[
                  (proprete.nbDistribPoubelle ||
                    distribQuantites?.nbDistribPoubelle) ??
                    0,
                ]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) =>
                  handleChangeDistribNbr("poubelle", value)
                }
                className="flex-1"
              />
              <label htmlFor="nbDeDistribPoubelle">
                {(proprete.nbDistribPoubelle ||
                  distribQuantites?.nbDistribPoubelle) ??
                  0}{" "}
                réceptacles
              </label>
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
            const dureeLocation = proprete.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  proprete.poubelleGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"poubelle" + gamme}
                onClick={() => handleClickProposition("poubelle", gamme)}
              >
                {" "}
                <Checkbox
                  checked={proprete.poubelleGammeSelected === gamme}
                  onCheckedChange={() =>
                    handleClickProposition("poubelle", gamme)
                  }
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  {dureeLocation === "oneShot" ? (
                    <p className="font-bold">
                      {formatNumber(proposition.tarifsDistribPoubelle / 10000)}{" "}
                      €
                    </p>
                  ) : (
                    <p>
                      {formatNumber(proposition.tarifsDistribPoubelle / 10000)}{" "}
                      € / an
                    </p>
                  )}
                  <p className="text-sm">
                    Réceptacles{" "}
                    {gamme === "essentiel"
                      ? "blancs basic"
                      : gamme === "confort"
                      ? "couleur (noir, gris, blanc premium...)"
                      : "inox"}
                  </p>
                  <p className="text-sm">
                    {dureeLocation === "oneShot"
                      ? "Achat des distributeurs"
                      : `Location engagement
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

export default TabsContentPropreteOptions;
