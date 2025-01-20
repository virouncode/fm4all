import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { gammes } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsPropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const HygieneOptionsPropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneConsosTarifs,
}: HygieneOptionsPropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const handleClickProposition = (
    type: string,
    proposition: {
      gamme: "essentiel" | "confort" | "excellence";
      prixDistribDesinfectant: number;
      prixDistribParfum: number;
      prixDistribBalai: number;
      prixDistribPoubelle: number;
      paParPersonneDesinfectant: number;
      totalDesinfectant: number;
      totalParfum: number;
      totalBalai: number;
      totalPoubelle: number;
    }
  ) => {
    const {
      gamme,
      prixDistribDesinfectant,
      prixDistribParfum,
      prixDistribBalai,
      prixDistribPoubelle,
      paParPersonneDesinfectant,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
    } = proposition;
    switch (type) {
      case "desinfectant":
        if (hygiene.infos.desinfectantGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, desinfectantGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribDesinfectant: 0,
              paParPersonneDesinfectant: 0,
            },
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            totalDesinfectant: 0,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            desinfectantGammeSelected: gamme,
          },
          prix: {
            ...prev.prix,
            prixDistribDesinfectant,
            paParPersonneDesinfectant,
          },
        }));
        setTotalHygiene((prev) => ({
          ...prev,
          totalDesinfectant,
        }));
        return;
      case "parfum":
        if (hygiene.infos.parfumGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, parfumGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribParfum: 0,
            },
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            totalParfum: 0,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            parfumGammeSelected: gamme,
          },
          prix: {
            ...prev.prix,
            prixDistribParfum,
          },
        }));
        setTotalHygiene((prev) => ({
          ...prev,
          totalParfum,
        }));
        return;
      case "balai":
        if (hygiene.infos.balaiGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, balaiGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribBalai: 0,
            },
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            totalBalai: 0,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: { ...prev.infos, balaiGammeSelected: gamme },
          prix: {
            ...prev.prix,
            prixDistribBalai,
          },
        }));
        setTotalHygiene((prev) => ({
          ...prev,
          totalBalai,
        }));
        return;
      case "poubelle":
        if (hygiene.infos.poubelleGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, poubelleGammeSelected: null },
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            totalPoubelle: 0,
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: { ...prev.infos, poubelleGammeSelected: gamme },
          prix: {
            ...prev.prix,
            prixDistribPoubelle,
          },
        }));
        setTotalHygiene((prev) => ({
          ...prev,
          totalPoubelle: totalPoubelle,
        }));
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
        const newNbDistribDesinfectant = value
          ? parseInt(value)
          : hygieneDistribQuantite.nbDistribDesinfectant ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribDesinfectant: newNbDistribDesinfectant,
          },
        }));
        if (hygiene.infos.desinfectantGammeSelected) {
          const prixDistribDesinfectant =
            distribTarifsDuFournisseur.find(
              (tarif) =>
                tarif.type === "desinfectant" &&
                tarif.gamme === hygiene.infos.desinfectantGammeSelected
            )?.[dureeLocation] ?? 0;

          const totalDesinfectant = Math.round(
            newNbDistribDesinfectant * prixDistribDesinfectant +
              (consosTarifsDuFournisseur?.paParPersonneDesinfectant ?? 0) *
                (client.effectif ?? 0)
          );
          setTotalHygiene((prev) => ({
            ...prev,
            totalDesinfectant,
          }));
        }
        return;
      case "parfum":
        const newNbDistribParfum = value
          ? parseInt(value)
          : hygieneDistribQuantite.nbDistribParfum ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribParfum: newNbDistribParfum,
          },
        }));
        if (hygiene.infos.parfumGammeSelected) {
          const prixDistribParfum =
            distribTarifsDuFournisseur.find(
              (tarif) =>
                tarif.type === "parfum" &&
                tarif.gamme === hygiene.infos.parfumGammeSelected
            )?.[dureeLocation] ?? 0;

          const totalParfum = Math.round(
            newNbDistribParfum * prixDistribParfum
          );
          setTotalHygiene((prev) => ({
            ...prev,
            totalParfum,
          }));
        }
        return;

      case "balai":
        const newNbDistribBalai = value
          ? parseInt(value)
          : hygieneDistribQuantite.nbDistribBalai ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribBalai: newNbDistribBalai,
          },
        }));
        if (hygiene.infos.balaiGammeSelected) {
          const prixDistribBalai =
            distribTarifsDuFournisseur.find(
              (tarif) =>
                tarif.type === "balai" &&
                tarif.gamme === hygiene.infos.balaiGammeSelected
            )?.[dureeLocation] ?? 0;

          const totalBalai = Math.round(newNbDistribBalai * prixDistribBalai);
          setTotalHygiene((prev) => ({
            ...prev,
            totalBalai,
          }));
        }
        return;

      case "poubelle":
        const newNbDistribPoubelle = value
          ? parseInt(value)
          : hygieneDistribQuantite.nbDistribPoubelle ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPoubelle: newNbDistribPoubelle,
          },
        }));
        if (hygiene.infos.poubelleGammeSelected) {
          const prixDistribPoubelle =
            distribTarifsDuFournisseur.find(
              (tarif) =>
                tarif.type === "poubelle" &&
                tarif.gamme === hygiene.infos.poubelleGammeSelected
            )?.[dureeLocation] ?? 0;

          const totalPoubelle = Math.round(
            newNbDistribPoubelle * prixDistribPoubelle
          );
          setTotalHygiene((prev) => ({
            ...prev,
            totalPoubelle,
          }));
        }
        return;
    }
  };

  //Formatter les propositions d'options en hygiene
  const nbDistribDesinfectant =
    hygiene.quantites.nbDistribDesinfectant ||
    hygieneDistribQuantite.nbDistribDesinfectant;
  const nbDistribParfum =
    hygiene.quantites.nbDistribParfum || hygieneDistribQuantite.nbDistribParfum;
  const nbDistribBalai =
    hygiene.quantites.nbDistribBalai || hygieneDistribQuantite.nbDistribBalai;
  const nbDistribPoubelle =
    hygiene.quantites.nbDistribPoubelle ||
    hygieneDistribQuantite.nbDistribPoubelle;
  const dureeLocation = hygiene.infos.dureeLocation;
  const distribTarifsDuFournisseur = hygieneDistribTarifs.filter(
    (tarif) => tarif.fournisseurId === hygiene.infos.fournisseurId
  );
  const consosTarifsDuFournisseur = hygieneConsosTarifs.find(
    (tarif) => tarif.fournisseurId === hygiene.infos.fournisseurId
  );

  const propositions = gammes.map((gamme) => {
    //la gamme suffit pour identifier la proposition car il n'y a qu'un fournisseur
    const prixDistribDesinfectant =
      distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const prixDistribParfum =
      distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const prixDistribBalai =
      distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const prixDistribPoubelle =
      distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const paParPersonneDesinfectant =
      consosTarifsDuFournisseur?.paParPersonneDesinfectant ?? 0;
    const totalDesinfectant =
      nbDistribDesinfectant * prixDistribDesinfectant +
      paParPersonneDesinfectant * (client.effectif ?? 0);
    const totalParfum = nbDistribParfum * prixDistribParfum;
    const totalBalai = nbDistribBalai * prixDistribBalai;
    const totalPoubelle = nbDistribPoubelle * prixDistribPoubelle;

    return {
      gamme,
      prixDistribDesinfectant,
      prixDistribParfum,
      prixDistribBalai,
      prixDistribPoubelle,
      paParPersonneDesinfectant,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
    };
  });

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {/*1ère ligne */}
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
          <p className="text-base">Desinfectant pour cuvettes</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={nbDistribDesinfectant}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribDesinfectant ===
                  hygieneDistribQuantite.nbDistribDesinfectant
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
          const prixAnnuelDesinfectantText = proposition.totalDesinfectant
            ? `${formatNumber(
                Math.round(proposition.totalDesinfectant)
              )} € / an`
            : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.infos.desinfectantGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"desinfectant" + gamme}
              onClick={() =>
                handleClickProposition("desinfectant", proposition)
              }
            >
              {" "}
              <Checkbox
                checked={hygiene.infos.desinfectantGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("desinfectant", proposition)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p>{prixAnnuelDesinfectantText}</p>
                <p className="text-sm">
                  Distributeurs{" "}
                  {gamme === "essentiel"
                    ? "blancs basic"
                    : gamme === "confort"
                    ? "couleur"
                    : "inox"}
                </p>
                <p className="text-sm">
                  {`Location engagement
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
          <p className="text-base">Parfum</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={nbDistribParfum}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "parfum")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribParfum ===
                  hygieneDistribQuantite.nbDistribParfum
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
          const prixAnnuelParfumText = proposition.totalParfum
            ? `${formatNumber(Math.round(proposition.totalParfum))} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.infos.parfumGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"parfum" + gamme}
              onClick={() => handleClickProposition("parfum", proposition)}
            >
              {" "}
              <Checkbox
                checked={hygiene.infos.parfumGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("parfum", proposition)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p>{prixAnnuelParfumText}</p>
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
          <p className="text-base">Balais WC</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={nbDistribBalai}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "balai")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribBalai ===
                  hygieneDistribQuantite.nbDistribBalai
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
          const prixAnnuelBalaiText = proposition.totalBalai
            ? `${formatNumber(Math.round(proposition.totalBalai))} € / an`
            : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.infos.balaiGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"balai" + gamme}
              onClick={() => handleClickProposition("balai", proposition)}
            >
              {" "}
              <Checkbox
                checked={hygiene.infos.balaiGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("balai", proposition)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p>{prixAnnuelBalaiText}</p>

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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-2">
          <p className="text-base">Poubelles hygiène féminine</p>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex gap-4 items-center justify-center w-full">
              <Input
                type="number"
                value={nbDistribPoubelle}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribPoubelle ===
                  hygieneDistribQuantite.nbDistribPoubelle
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
          const prixAnnuelPoubelleText = proposition.totalPoubelle
            ? `${formatNumber(Math.round(proposition.totalPoubelle))} € / an`
            : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.infos.poubelleGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={"poubelle" + gamme}
              onClick={() => handleClickProposition("poubelle", proposition)}
            >
              {" "}
              <Checkbox
                checked={hygiene.infos.poubelleGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition("poubelle", proposition)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p>{prixAnnuelPoubelleText}</p>
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
