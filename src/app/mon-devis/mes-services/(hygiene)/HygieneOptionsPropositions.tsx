import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { ChangeEvent, useContext } from "react";

type HygieneOptionsPropositionsProps = {
  distribQuantites: SelectHygieneDistribQuantitesType;
  distribTarifs: SelectHygieneDistribTarifsType[];
  consosTarifs: SelectHygieneConsoTarifsType[];
};

const HygieneOptionsPropositions = ({
  distribQuantites,
  distribTarifs,
  consosTarifs,
}: HygieneOptionsPropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const effectif = client.effectif as number;
  const nbDistribDesinfectant =
    hygiene.nbDistribDesinfectant || distribQuantites.nbDistribDesinfectant;
  const nbDistribParfum =
    hygiene.nbDistribParfum || distribQuantites.nbDistribParfum;
  const nbDistribBalai =
    hygiene.nbDistribBalai || distribQuantites.nbDistribBalai;
  const nbDistribPoubelle =
    hygiene.nbDistribPoubelle || distribQuantites.nbDistribPoubelle;
  const dureeLocation = hygiene.dureeLocation;
  const distribTarifsDuFournisseur = distribTarifs.filter(
    (tarif) => tarif.fournisseurId === hygiene.fournisseurId
  );
  const consosTarifsDuFournisseur = consosTarifs.find(
    (tarif) => tarif.fournisseurId === hygiene.fournisseurId
  );

  const propositions = gammes.map((gamme) => ({
    gamme, //la gamme suffit pour identifier la proposition car il n'y a qu'un fournisseur
    tarifDistribDesinfectant: distribTarifsDuFournisseur.find(
      (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
    ),
    tarifDistribParfum: distribTarifsDuFournisseur.find(
      (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
    ),
    tarifDistribBalai: distribTarifsDuFournisseur.find(
      (tarif) => tarif.type === "balai" && tarif.gamme === gamme
    ),
    tarifDistribPoubelle: distribTarifsDuFournisseur.find(
      (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
    ),
    prixAnnuelConsoDesinfectant:
      (consosTarifsDuFournisseur?.paParPersonneDesinfectant ?? 0) * effectif, //il n'y qu'un fournisseur
    prixAnnuelDistribDesinfectant:
      nbDistribDesinfectant *
      (distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0),
    prixAnnuelDistribParfum:
      nbDistribParfum *
      (distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0),
    prixAnnuelDistribBalai:
      nbDistribBalai *
      (distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0),
    prixAnnuelDistribPoubelle:
      nbDistribPoubelle *
      (distribTarifsDuFournisseur.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0),
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
            prixAnnuelConsoDesinfectant: null,
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
              dureeLocation === "oneShot"
                ? null
                : Math.round(
                    proposition.prixAnnuelConsoDesinfectant +
                      proposition.prixAnnuelDistribDesinfectant
                  ),
            prixDesinfectantAchat:
              dureeLocation === "oneShot"
                ? {
                    prixAchat: Math.round(
                      proposition.prixAnnuelDistribDesinfectant
                    ),
                    prixConsommables: Math.round(
                      proposition.prixAnnuelConsoDesinfectant
                    ),
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
            prixParfum: Math.round(proposition.prixAnnuelDistribParfum),
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
            prixBalai: Math.round(proposition.prixAnnuelDistribBalai),
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
            prixPoubelle: Math.round(proposition.prixAnnuelDistribPoubelle),
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
        const newNbDistribDesinfectant = value
          ? parseInt(value)
          : distribQuantites.nbDistribDesinfectant ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribDesinfectant: newNbDistribDesinfectant,
        }));
        if (hygiene.desinfectantGammeSelected) {
          const proposition = propositions.find(
            (proposition) =>
              proposition.gamme === hygiene.desinfectantGammeSelected
          );
          if (proposition) {
            setTotalHygiene((prev) => ({
              ...prev,
              prixDesinfectantAbonnement:
                dureeLocation === "oneShot"
                  ? null
                  : proposition.prixAnnuelConsoDesinfectant +
                    newNbDistribDesinfectant *
                      (proposition.tarifDistribDesinfectant?.[dureeLocation] ??
                        0),
              prixDesinfectantAchat:
                dureeLocation === "oneShot"
                  ? {
                      prixAchat:
                        newNbDistribDesinfectant *
                        (proposition.tarifDistribDesinfectant?.[
                          dureeLocation
                        ] ?? 0),
                      prixConsommables: proposition.prixAnnuelConsoDesinfectant,
                    }
                  : null,
            }));
          }
        }
        return;
      case "parfum":
        const newNbDistribParfum = value
          ? parseInt(value)
          : distribQuantites.nbDistribParfum ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribParfum: newNbDistribParfum,
        }));
        if (hygiene.parfumGammeSelected) {
          const proposition = propositions.find(
            (proposition) => proposition.gamme === hygiene.parfumGammeSelected
          );
          if (proposition) {
            setTotalHygiene((prev) => ({
              ...prev,
              prixParfum:
                newNbDistribParfum *
                (proposition.tarifDistribParfum?.[dureeLocation] ?? 0),
            }));
          }
        }
        return;
      case "balai":
        const newNbDistribBalai = value
          ? parseInt(value)
          : distribQuantites.nbDistribBalai ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribBalai: newNbDistribBalai,
        }));
        if (hygiene.balaiGammeSelected) {
          const proposition = propositions.find(
            (proposition) => proposition.gamme === hygiene.balaiGammeSelected
          );
          if (proposition) {
            setTotalHygiene((prev) => ({
              ...prev,
              prixBalai:
                newNbDistribBalai *
                (proposition.tarifDistribBalai?.[dureeLocation] ?? 0),
            }));
          }
        }
        return;
      case "poubelle":
        const newNbDistribPoubelle = value
          ? parseInt(value)
          : distribQuantites.nbDistribPoubelle ?? 0;
        setHygiene((prev) => ({
          ...prev,
          nbDistribPoubelle: newNbDistribPoubelle,
        }));
        if (hygiene.poubelleGammeSelected) {
          const proposition = propositions.find(
            (proposition) => proposition.gamme === hygiene.poubelleGammeSelected
          );
          if (proposition) {
            setTotalHygiene((prev) => ({
              ...prev,
              prixPoubelle:
                newNbDistribPoubelle *
                (proposition.tarifDistribPoubelle?.[dureeLocation] ?? 0),
            }));
          }
        }
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {/*1ère ligne */}
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-4">
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
                  hygiene.nbDistribDesinfectant ===
                  distribQuantites.nbDistribDesinfectant
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
          const tarifsDistribAchatDesinfectant =
            proposition.prixAnnuelDistribDesinfectant
              ? `${formatNumber(
                  Math.round(proposition.prixAnnuelDistribDesinfectant)
                )} €`
              : "Non proposé";
          const tarifsConsosDesinfectant =
            proposition.prixAnnuelConsoDesinfectant
              ? `${formatNumber(
                  Math.round(proposition.prixAnnuelConsoDesinfectant)
                )} € / an`
              : "";
          const tarifsDistribLocDesinfectant =
            proposition.prixAnnuelDistribDesinfectant
              ? `${formatNumber(
                  Math.round(
                    proposition.prixAnnuelDistribDesinfectant +
                      proposition.prixAnnuelConsoDesinfectant
                  )
                )} € / an`
              : "Non proposé";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.desinfectantGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-4">
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
                  hygiene.nbDistribParfum === distribQuantites.nbDistribParfum
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
          const tarifsDistribAchatParfum = proposition.prixAnnuelDistribParfum
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelDistribParfum)
              )} €`
            : "Non proposé";
          // const tarifsConsosParfum = proposition.tarifsParfum ? `${formatNumber(
          // Math.round(proposition.tarifsParfum))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosParfum = "0 € / an";
          // const tarifsdDistribLocParfum = proposition.prixAnnuelDistribParfum
          // ? `${formatNumber(
          // Math.round(proposition.prixAnnuelDistribParfum + proposition.tarifsParfum))} € / an`
          // : "Non proposé"; Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocParfum = proposition.prixAnnuelDistribParfum
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelDistribParfum)
              )} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.parfumGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-4">
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
                  hygiene.nbDistribBalai === distribQuantites.nbDistribBalai
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
          const tarifsDistribAchatBalai = proposition.prixAnnuelDistribBalai
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelDistribBalai)
              )} €`
            : "Non proposé";
          // const tarifsConsosBalai = proposition.tarifsBalai ? `${formatNumber(
          // Math.round(proposition.tarifsBalai))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosBalai = "0 € / an";
          // const tarifsDistribLocBalai = proposition.prixAnnuelDistribBalai ? `${formatNumber(
          // Math.round(proposition.prixAnnuelDistribBalai + proposition.tarifsBalai))} € / an` : "Non proposé"; //Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocBalai = proposition.prixAnnuelDistribBalai
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelDistribBalai)
              )} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.balaiGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
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
        <div className="flex w-1/4 items-center justify-center flex-col gap-2 p-4">
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
                  hygiene.nbDistribPoubelle ===
                  distribQuantites.nbDistribPoubelle
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
          const tarifsDistribAchatPoubelle =
            proposition.prixAnnuelDistribPoubelle
              ? `${formatNumber(
                  Math.round(proposition.prixAnnuelDistribPoubelle)
                )} €`
              : "Non proposé";
          // const tarifsConsosPoubelle = proposition.tarifsPoubelle ? `${formatNumber(
          // Math.round(proposition.tarifsPoubelle))} € / an` : ""; //Quand les fournisseurs l'auront renseigné
          const tarifsConsosPoubelle = "0 € / an";
          // const tarifsDistribLocPoubelle = proposition.prixAnnuelDistribPoubelle ? `${formatNumber(
          //        Math.round(proposition.prixAnnuelDistribPoubelle + proposition.tarifsPoubelle})) € / an` : "Non proposé"; //Quand les fournisseurs l'auront renseigné
          const tarifsDistribLocPoubelle = proposition.prixAnnuelDistribPoubelle
            ? `${formatNumber(
                Math.round(proposition.prixAnnuelDistribPoubelle)
              )} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-xl gap-4 cursor-pointer ${
                hygiene.poubelleGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
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
