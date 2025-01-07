import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { formatNumber } from "@/lib/formatNumber";
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
  const { devisData, setDevisData } = useContext(DevisDataContext);
  const {
    nbDistribDesinfectant,
    nbDistribParfum,
    nbDistribBalai,
    nbDistribPoubelle,
    desinfectantGammeSelected,
    parfumGammeSelected,
    balaiGammeSelected,
    poubelleGammeSelected,
  } = devisData.services.nettoyage;

  const gammes = ["essentiel", "confort", "excellence"];
  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsDesinfectant:
      consoTarifs[0].paParPersonneDesinfectant *
      (parseInt(devisData.firstCompanyInfo.effectif) as number),
    tarifsDistribDesinfectant:
      ((nbDistribDesinfectant || distribQuantites?.nbDistribDesinfectant) ??
        0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[
        devisData.services.nettoyage.dureeLocation as
          | "pa12M"
          | "pa24M"
          | "pa36M"
          | "oneShot"
      ] as number),
    tarifsDistribParfum:
      ((nbDistribParfum || distribQuantites?.nbDistribParfum) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[
        devisData.services.nettoyage.dureeLocation as
          | "pa12M"
          | "pa24M"
          | "pa36M"
          | "oneShot"
      ] as number),
    tarifsDistribBalai:
      ((nbDistribBalai || distribQuantites?.nbDistribBalai) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[
        devisData.services.nettoyage.dureeLocation as
          | "pa12M"
          | "pa24M"
          | "pa36M"
          | "oneShot"
      ] as number),
    tarifsDistribPoubelle:
      ((nbDistribPoubelle || distribQuantites?.nbDistribPoubelle) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[
        devisData.services.nettoyage.dureeLocation as
          | "pa12M"
          | "pa24M"
          | "pa36M"
          | "oneShot"
      ] as number),
  }));

  const handleClickProposition = (type: string, gamme: string) => {
    switch (type) {
      case "desinfectant":
        if (desinfectantGammeSelected === gamme) {
          setDevisData((prev) => ({
            ...prev,
            services: {
              ...prev.services,
              nettoyage: {
                ...prev.services.nettoyage,
                desinfectantGammeSelected: null,
              },
            },
          }));
          return;
        }
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              desinfectantGammeSelected: gamme,
            },
          },
        }));
        return;
      case "parfum":
        if (parfumGammeSelected === gamme) {
          setDevisData((prev) => ({
            ...prev,
            services: {
              ...prev.services,
              nettoyage: {
                ...prev.services.nettoyage,
                parfumGammeSelected: null,
              },
            },
          }));
          return;
        }
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              parfumGammeSelected: gamme,
            },
          },
        }));
        return;
      case "balai":
        if (balaiGammeSelected === gamme) {
          setDevisData((prev) => ({
            ...prev,
            services: {
              ...prev.services,
              nettoyage: {
                ...prev.services.nettoyage,
                balaiGammeSelected: null,
              },
            },
          }));
          return;
        }
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              balaiGammeSelected: gamme,
            },
          },
        }));
        return;
      case "poubelle":
        if (poubelleGammeSelected === gamme) {
          setDevisData((prev) => ({
            ...prev,
            services: {
              ...prev.services,
              nettoyage: {
                ...prev.services.nettoyage,
                poubelleGammeSelected: null,
              },
            },
          }));
          return;
        }
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              poubelleGammeSelected: gamme,
            },
          },
        }));
        return;
    }
  };

  const handleChangeDistribNbr = (type: string, value: number[]) => {
    const number = value[0];
    switch (type) {
      case "desinfectant":
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              nbDistribDesinfectant: number,
            },
          },
        }));
        return;
      case "parfum":
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              nbDistribParfum: number,
            },
          },
        }));
        return;
      case "balai":
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              nbDistribBalai: number,
            },
          },
        }));
        return;
      case "poubelle":
        setDevisData((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            nettoyage: {
              ...prev.services.nettoyage,
              nbDistribPoubelle: number,
            },
          },
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
                  (nbDistribDesinfectant ||
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
                {(nbDistribDesinfectant ||
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
            const dureeLocation = devisData.services.nettoyage.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  desinfectantGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"desinfectant" + gamme}
                onClick={() => handleClickProposition("desinfectant", gamme)}
              >
                {" "}
                <Checkbox
                  checked={desinfectantGammeSelected === gamme}
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
                  (nbDistribParfum || distribQuantites?.nbDistribParfum) ?? 0,
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
                {(nbDistribParfum || distribQuantites?.nbDistribParfum) ?? 0}{" "}
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
            const dureeLocation = devisData.services.nettoyage.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  parfumGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"parfum" + gamme}
                onClick={() => handleClickProposition("parfum", gamme)}
              >
                {" "}
                <Checkbox
                  checked={parfumGammeSelected === gamme}
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
                  (nbDistribBalai || distribQuantites?.nbDistribBalai) ?? 0,
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
                {(nbDistribBalai || distribQuantites?.nbDistribBalai) ?? 0}{" "}
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
            const dureeLocation = devisData.services.nettoyage.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  balaiGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"balai" + gamme}
                onClick={() => handleClickProposition("balai", gamme)}
              >
                {" "}
                <Checkbox
                  checked={balaiGammeSelected === gamme}
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
                  (nbDistribPoubelle || distribQuantites?.nbDistribPoubelle) ??
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
                {(nbDistribPoubelle || distribQuantites?.nbDistribPoubelle) ??
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
            const dureeLocation = devisData.services.nettoyage.dureeLocation;
            return (
              <div
                className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                  poubelleGammeSelected === gamme
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } px-8`}
                key={"poubelle" + gamme}
                onClick={() => handleClickProposition("poubelle", gamme)}
              >
                {" "}
                <Checkbox
                  checked={poubelleGammeSelected === gamme}
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
