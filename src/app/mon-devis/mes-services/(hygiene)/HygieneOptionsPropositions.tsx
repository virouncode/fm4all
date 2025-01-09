import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RATIO } from "@/constants/ratio";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsPropositionsProps = {
  distribQuantites: SelectHygieneDistribQuantitesType;
  distribTarifs: SelectHygieneDistribTarifsType[];
  consosTarif: SelectHygieneConsoTarifsType;
};

const HygieneOptionsPropositions = ({
  distribQuantites,
  distribTarifs,
  consosTarif,
}: HygieneOptionsPropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const gammes = ["essentiel", "confort", "excellence"] as const;
  const propositions = gammes.map((gamme) => ({
    gamme,
    tarifsDesinfectant:
      consosTarif.paParPersonneDesinfectant * (client.effectif as number),
    tarifsDistribDesinfectant:
      ((hygiene.nbDistribDesinfectant ||
        distribQuantites?.nbDistribDesinfectant) ??
        0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[hygiene.dureeLocation] ?? 0),
    tarifsDistribParfum:
      ((hygiene.nbDistribParfum || distribQuantites?.nbDistribParfum) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[hygiene.dureeLocation] ?? 0),
    tarifsDistribBalai:
      ((hygiene.nbDistribBalai || distribQuantites?.nbDistribBalai) ?? 0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[hygiene.dureeLocation] ?? 0),
    tarifsDistribPoubelle:
      ((hygiene.nbDistribPoubelle || distribQuantites?.nbDistribPoubelle) ??
        0) *
      (distribTarifs.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[hygiene.dureeLocation] ?? 0),
  }));

  const handleClickProposition = (type: string, gamme: GammeType) => {
    const proposition = propositions.find(
      (proposition) => proposition.gamme === gamme
    );
    switch (type) {
      case "desinfectant":
        if (hygiene.desinfectantGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            desinfectantGammeSelected: null,
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            tarifsDesinfectant: null,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          desinfectantGammeSelected: gamme,
        }));
        if (proposition) {
          setTotalHygiene((prev) => ({
            ...prev,
            prixDesinfectantAbonnement:
              hygiene.dureeLocation === "oneShot"
                ? null
                : (proposition.tarifsDesinfectant +
                    proposition.tarifsDistribDesinfectant) /
                  RATIO,
            prixDesinfectantAchat:
              hygiene.dureeLocation === "oneShot"
                ? {
                    prixAchat: proposition.tarifsDistribDesinfectant / RATIO,
                    prixConsommables: proposition.tarifsDesinfectant / RATIO,
                  }
                : null,
          }));
        }
        return;
      case "parfum":
        if (hygiene.parfumGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            parfumGammeSelected: null,
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            prixParfum: null,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          parfumGammeSelected: gamme,
        }));
        if (proposition) {
          setTotalHygiene((prev) => ({
            ...prev,
            prixParfum: proposition.tarifsDistribParfum / RATIO,
          }));
        }
        return;
      case "balai":
        if (hygiene.balaiGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            balaiGammeSelected: null,
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            prixBalai: null,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          balaiGammeSelected: gamme,
        }));
        if (proposition) {
          setTotalHygiene((prev) => ({
            ...prev,
            prixBalai: proposition.tarifsDistribBalai / RATIO,
          }));
        }
        return;
      case "poubelle":
        if (hygiene.poubelleGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            poubelleGammeSelected: null,
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            prixPoubelle: null,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          poubelleGammeSelected: gamme,
        }));
        if (proposition) {
          setTotalHygiene((prev) => ({
            ...prev,
            prixPoubelle: proposition.tarifsDistribPoubelle / RATIO,
          }));
        }
        return;
    }
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;
    switch (type) {
      case "desinfectant":
        setHygiene((prev) => ({
          ...prev,
          nbDistribDesinfectant: value
            ? parseInt(value)
            : distribQuantites?.nbDistribDesinfectant ?? 0,
        }));
        return;
      case "parfum":
        setHygiene((prev) => ({
          ...prev,
          nbDistribParfum: value
            ? parseInt(value)
            : distribQuantites?.nbDistribParfum ?? 0,
        }));
        return;
      case "balai":
        setHygiene((prev) => ({
          ...prev,
          nbDistribBalai: value
            ? parseInt(value)
            : distribQuantites?.nbDistribBalai ?? 0,
        }));
        return;
      case "poubelle":
        setHygiene((prev) => ({
          ...prev,
          nbDistribPoubelle: value
            ? parseInt(value)
            : distribQuantites?.nbDistribPoubelle ?? 0,
        }));
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {/*1ère ligne */}
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col gap-4">
          <p className="text-lg">Desinfectant pour cuvettes</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={
                  (hygiene.nbDistribDesinfectant ||
                    distribQuantites?.nbDistribDesinfectant) ??
                  0
                }
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
                className={`w-16 ${
                  hygiene.nbDistribDesinfectant ===
                  distribQuantites?.nbDistribDesinfectant
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribDesinfectant" className="text-sm">
                distributeurs
              </Label>
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
          const dureeLocation = hygiene.dureeLocation;
          const tarifsDistribAchatDesinfectant =
            proposition.tarifsDistribDesinfectant
              ? `${formatNumber(
                  Math.round(proposition.tarifsDistribDesinfectant)
                )} €`
              : "Non proposé";
          const tarifsConsosDesinfectant = proposition.tarifsDesinfectant
            ? `${formatNumber(
                Math.round(proposition.tarifsDesinfectant)
              )} € / an`
            : "";
          const tarifsDistribLocDesinfectant =
            proposition.tarifsDistribDesinfectant
              ? `${formatNumber(
                  Math.round(
                    proposition.tarifsDistribDesinfectant +
                      proposition.tarifsDesinfectant
                  )
                )} € / an`
              : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.desinfectantGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"desinfectant" + gamme}
              onClick={() => handleClickProposition("desinfectant", gamme)}
            >
              {" "}
              <Checkbox
                checked={hygiene.desinfectantGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("desinfectant", gamme)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {dureeLocation === "oneShot" ? (
                  <>
                    <p className="font-bold">
                      {tarifsDistribAchatDesinfectant}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {tarifsConsosDesinfectant}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p>{tarifsDistribLocDesinfectant}</p>
                )}
                <p className="text-sm">
                  Distributeurs{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">
                  {dureeLocation === "oneShot"
                    ? ""
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-4">
          <p className="text-lg">Parfum</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={
                  (hygiene.nbDistribParfum ||
                    distribQuantites?.nbDistribParfum) ??
                  0
                }
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "parfum")}
                className={`w-16 ${
                  hygiene.nbDistribParfum === distribQuantites?.nbDistribParfum
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribParfum" className="text-sm">
                distributeurs
              </Label>
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
          const tarifsDistribAchatParfum = proposition.tarifsDistribParfum
            ? `${formatNumber(Math.round(proposition.tarifsDistribParfum))} €`
            : "Non proposé";
          // const tarifsConsosParfum = proposition.tarifsParfum ? `${formatNumber(
          // Math.round(proposition.tarifsParfum))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosParfum = "0 € / an";
          // const tarifsdDistribLocParfum = proposition.tarifsDistribParfum
          // ? `${formatNumber(
          // Math.round(proposition.tarifsDistribParfum + proposition.tarifsParfum))} € / an`
          // : "Non proposé"; Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocParfum = proposition.tarifsDistribParfum
            ? `${formatNumber(
                Math.round(proposition.tarifsDistribParfum)
              )} € / an`
            : "Non proposé";
          const dureeLocation = hygiene.dureeLocation;
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.parfumGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"parfum" + gamme}
              onClick={() => handleClickProposition("parfum", gamme)}
            >
              {" "}
              <Checkbox
                checked={hygiene.parfumGammeSelected === gamme}
                onCheckedChange={() => handleClickProposition("parfum", gamme)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {dureeLocation === "oneShot" ? (
                  <>
                    <p className="font-bold">
                      {tarifsDistribAchatParfum}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {tarifsConsosParfum}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p>{tarifsDistribLocParfum}</p>
                )}
                <p className="text-sm">
                  Distributeurs{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">
                  {dureeLocation === "oneShot"
                    ? ""
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-4">
          <p className="text-lg">Balais WC</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={
                  (hygiene.nbDistribBalai ||
                    distribQuantites?.nbDistribBalai) ??
                  0
                }
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "balai")}
                className={`w-16 ${
                  hygiene.nbDistribBalai === distribQuantites?.nbDistribBalai
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribBalai" className="text-sm">
                blocs
              </Label>
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
          const dureeLocation = hygiene.dureeLocation;
          const tarifsDistribAchatBalai = proposition.tarifsDistribBalai
            ? `${formatNumber(Math.round(proposition.tarifsDistribBalai))} €`
            : "Non proposé";
          // const tarifsConsosBalai = proposition.tarifsBalai ? `${formatNumber(
          // Math.round(proposition.tarifsBalai))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosBalai = "0 € / an";
          // const tarifsDistribLocBalai = proposition.tarifsDistribBalai ? `${formatNumber(
          // Math.round(proposition.tarifsDistribBalai + proposition.tarifsBalai))} € / an` : "Non proposé"; //Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocBalai = proposition.tarifsDistribBalai
            ? `${formatNumber(
                Math.round(proposition.tarifsDistribBalai)
              )} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.balaiGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"balai" + gamme}
              onClick={() => handleClickProposition("balai", gamme)}
            >
              {" "}
              <Checkbox
                checked={hygiene.balaiGammeSelected === gamme}
                onCheckedChange={() => handleClickProposition("balai", gamme)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {dureeLocation === "oneShot" ? (
                  <>
                    <p className="font-bold">
                      {tarifsDistribAchatBalai}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {tarifsConsosBalai}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p>{tarifsDistribLocBalai}</p>
                )}
                <p className="text-sm">
                  Socle et manche{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">
                  {dureeLocation === "oneShot"
                    ? ""
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-4">
          <p className="text-lg">Poubelles hygiène féminine</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={
                  (hygiene.nbDistribPoubelle ||
                    distribQuantites?.nbDistribPoubelle) ??
                  0
                }
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
                className={`w-16 ${
                  hygiene.nbDistribPoubelle ===
                  distribQuantites?.nbDistribPoubelle
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribPoubelle" className="text-sm">
                blocs
              </Label>
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
          const dureeLocation = hygiene.dureeLocation;
          const tarifsDistribAchatPoubelle = proposition.tarifsDistribPoubelle
            ? `${formatNumber(Math.round(proposition.tarifsDistribPoubelle))} €`
            : "Non proposé";
          // const tarifsConsosPoubelle = proposition.tarifsPoubelle ? `${formatNumber(
          // Math.round(proposition.tarifsPoubelle))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosPoubelle = "0 € / an";
          // const tarifsDistribLocPoubelle = proposition.tarifsDistribPoubelle ? `${formatNumber(
          //        Math.round(proposition.tarifsDistribPoubelle + proposition.tarifsPoubelle})) € / an` : "Non proposé"; //Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocPoubelle = proposition.tarifsDistribPoubelle
            ? `${formatNumber(
                Math.round(proposition.tarifsDistribPoubelle)
              )} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.poubelleGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"poubelle" + gamme}
              onClick={() => handleClickProposition("poubelle", gamme)}
            >
              {" "}
              <Checkbox
                checked={hygiene.poubelleGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("poubelle", gamme)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {dureeLocation === "oneShot" ? (
                  <>
                    <p className="font-bold">
                      {tarifsDistribAchatPoubelle}
                      <span className="text-xs"> (distributeurs)</span>
                    </p>
                    <p>&</p>
                    <p className="font-bold">
                      {tarifsConsosPoubelle}
                      <span className="text-xs"> (conso)</span>
                    </p>
                  </>
                ) : (
                  <p>{tarifsDistribLocPoubelle}</p>
                )}
                <p className="text-sm">
                  Réceptacles{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">
                  {dureeLocation === "oneShot"
                    ? ""
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
  );
};

export default HygieneOptionsPropositions;
