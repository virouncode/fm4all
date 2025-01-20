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
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const HygienePropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
}: HygienePropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const handleClickProposition = (proposition: {
    gamme: GammeType;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixAnnuel: number;
  }) => {
    const { gamme, prixAnnuel } = proposition;

    //Je décoche la proposition
    if (gamme === hygiene.infos.trilogieGammeSelected) {
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          trilogieGammeSelected: null,
        },
        prix: {
          prixDistribEmp: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixDistribDesinfectant: null,
          prixDistribParfum: null,
          prixDistribBalai: null,
          prixDistribPoubelle: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
          paParPersonneDesinfectant: null,
        },
      }));
      setTotalHygiene((prev) => ({
        ...prev,
        totalTrilogie: 0,
        totalDesinfectant: 0,
        totalParfum: 0,
        totalBalai: 0,
        totalPoubelle: 0,
      }));
      return;
    }
    //Je coche la proposition
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribDesinfectant =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribParfum =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribBalai =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixDistribPoubelle =
      hygieneDistribTarifsFournisseur?.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected
      )?.[hygiene.infos.dureeLocation] ?? 0;

    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        trilogieGammeSelected: gamme,
      },
      prix: {
        prixDistribEmp,
        prixDistribSavon,
        prixDistribPh,
        prixDistribDesinfectant,
        prixDistribParfum,
        prixDistribBalai,
        prixDistribPoubelle,
        prixInstalDistrib,
        paParPersonneEmp,
        paParPersonneSavon,
        paParPersonnePh,
        paParPersonneDesinfectant,
      },
    }));

    //Calculer total hygiene
    const totalTrilogie = prixAnnuel;
    const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
      ? nbDistribDesinfectant * prixDistribDesinfectant +
        paParPersonneDesinfectant
      : 0;
    const totalParfum = hygiene.infos.parfumGammeSelected
      ? nbDistribParfum * prixDistribParfum
      : 0;
    const totalBalai = hygiene.infos.balaiGammeSelected
      ? nbDistribBalai * prixDistribBalai
      : 0;
    const totalPoubelle = hygiene.infos.poubelleGammeSelected
      ? nbDistribPoubelle * prixDistribPoubelle
      : 0;

    setTotalHygiene({
      totalTrilogie,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
    });
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;
    const gamme = hygiene.infos.trilogieGammeSelected;

    const prixDistribEmp =
      hygieneDistribTarifs.find(
        (item) => item.type === "emp" && item.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const prixDistribSavon =
      hygieneDistribTarifs.find(
        (item) => item.type === "savon" && item.gamme === gamme
      )?.[dureeLocation] ?? 0;
    const prixDistribPh =
      hygieneDistribTarifs.find(
        (item) => item.type === "ph" && item.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? 0;
    const prixInstalDistrib =
      hygieneDistribInstalTarifs.find(
        (item) => item.fournisseurId === hygiene.infos.fournisseurId
      )?.prixInstallation ?? 0;

    let totalTrilogie = 0;
    switch (type) {
      case "emp":
        const newNbDistribEmp = value
          ? parseInt(value)
          : hygieneDistribQuantite?.nbDistribEmp ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribEmp: newNbDistribEmp,
          },
        }));
        totalTrilogie = gamme
          ? Math.round(
              newNbDistribEmp * prixDistribEmp +
                nbDistribSavon * prixDistribSavon +
                nbDistribPh * prixDistribPh +
                prixInstalDistrib +
                (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
                  (client.effectif ?? 0)
            )
          : 0;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "savon":
        const newNbDistribSavon = value
          ? parseInt(value)
          : hygieneDistribQuantite?.nbDistribSavon ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribSavon: newNbDistribSavon,
          },
        }));
        totalTrilogie = gamme
          ? Math.round(
              nbDistribEmp * prixDistribEmp +
                newNbDistribSavon * prixDistribSavon +
                nbDistribPh * prixDistribPh +
                prixInstalDistrib +
                (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
                  (client.effectif ?? 0)
            )
          : 0;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "ph":
        const newNbDistribPh = value
          ? parseInt(value)
          : hygieneDistribQuantite?.nbDistribPh ?? 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPh: newNbDistribPh,
          },
        }));
        totalTrilogie = gamme
          ? Math.round(
              nbDistribEmp * prixDistribEmp +
                nbDistribSavon * prixDistribSavon +
                newNbDistribPh * prixDistribPh +
                prixInstalDistrib +
                (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
                  (client.effectif ?? 0)
            )
          : 0;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    const prixDistribEmp =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? 0;
    const prixDistribSavon =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? 0;
    const prixDistribPh =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? 0;
    const prixDistribDesinfectant =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected
      )?.[value] ?? 0;
    const prixDistribParfum =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected
      )?.[value] ?? 0;
    const prixDistribBalai =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected
      )?.[value] ?? 0;
    const prixDistribPoubelle =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected
      )?.[value] ?? 0;

    const totalTrilogie = hygiene.infos.trilogieGammeSelected
      ? nbDistribEmp * prixDistribEmp +
        nbDistribSavon * prixDistribSavon +
        nbDistribPh * prixDistribPh +
        prixInstalDistrib +
        (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
          (client.effectif ?? 0)
      : 0;
    const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
      ? nbDistribDesinfectant * prixDistribDesinfectant +
        (client.effectif ?? 0) * paParPersonneDesinfectant
      : 0;
    console.log(
      "desinfectantGammeSelected",
      hygiene.infos.desinfectantGammeSelected
    );
    console.log("totalSDesinfectant", totalDesinfectant);

    const totalParfum = hygiene.infos.parfumGammeSelected
      ? nbDistribParfum * prixDistribParfum
      : 0;
    const totalBalai = hygiene.infos.balaiGammeSelected
      ? nbDistribBalai * prixDistribBalai
      : 0;
    const totalPoubelle = hygiene.infos.poubelleGammeSelected
      ? nbDistribPoubelle * prixDistribPoubelle
      : 0;
    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        dureeLocation: value,
      },
      prix: {
        ...prev.prix,
        prixDistribEmp,
        prixDistribSavon,
        prixDistribPh,
        prixDistribDesinfectant,
        prixDistribParfum,
        prixDistribBalai,
        prixDistribPoubelle,
      },
    }));
    if (hygiene.infos.trilogieGammeSelected) {
      setTotalHygiene({
        totalTrilogie,
        totalDesinfectant,
        totalParfum,
        totalBalai,
        totalPoubelle,
      });
    }
  };

  //Formatter les propositions trilogie : 1 fournisseur 3 gammes.

  //Nombre de distributeurs
  const nbDistribEmp =
    hygiene.quantites.nbDistribEmp || hygieneDistribQuantite.nbDistribEmp;
  const nbDistribSavon =
    hygiene.quantites.nbDistribSavon || hygieneDistribQuantite.nbDistribSavon;
  const nbDistribPh =
    hygiene.quantites.nbDistribPh || hygieneDistribQuantite.nbDistribPh;
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

  //Tarifs distributeurs
  const dureeLocation = hygiene.infos.dureeLocation;
  const hygieneDistribTarifsFournisseur = hygieneDistribTarifs.filter(
    (item) => item.fournisseurId === hygiene.infos.fournisseurId
  );
  const consosTarifFournisseur = hygieneConsosTarifs.find(
    (item) => item.fournisseurId === hygiene.infos.fournisseurId
  );
  const ditribInstalTarifFournisseur = hygieneDistribInstalTarifs.find(
    (item) => item.fournisseurId === hygiene.infos.fournisseurId
  );
  const prixInstalDistrib = ditribInstalTarifFournisseur?.prixInstallation ?? 0;
  const paParPersonneEmp = consosTarifFournisseur?.paParPersonneEmp ?? 0;
  const paParPersonneSavon = consosTarifFournisseur?.paParPersonneSavon ?? 0;
  const paParPersonnePh = consosTarifFournisseur?.paParPersonnePh ?? 0;
  const paParPersonneDesinfectant =
    consosTarifFournisseur?.paParPersonneDesinfectant ?? 0;

  const propositions = gammes.map((gamme) => {
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;

    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;

    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme
      )?.[dureeLocation] ?? 0;

    const prixAnnuel = Math.round(
      nbDistribEmp * prixDistribEmp +
        nbDistribSavon * prixDistribSavon +
        nbDistribPh * prixDistribPh +
        prixInstalDistrib +
        (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
          (client.effectif ?? 0)
    );

    return {
      gamme,
      nbDistribEmp,
      nbDistribSavon,
      nbDistribPh,
      prixAnnuel,
    };
  });

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col p-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-1/4 w-full">
                  {getLogoFournisseurUrl(hygiene.infos.fournisseurId) ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={
                          getLogoFournisseurUrl(
                            hygiene?.infos.fournisseurId
                          ) as string
                        }
                        alt={`logo-de-${hygiene.infos.nomFournisseur}`}
                        fill={true}
                        className="w-full h-full object-contain"
                        quality={100}
                      />
                    </div>
                  ) : (
                    hygiene.infos.nomFournisseur
                  )}
                </div>
              </TooltipTrigger>
              {hygiene.infos.sloganFournisseur && (
                <TooltipContent>
                  <p className="text-sm italic">
                    {hygiene.infos.sloganFournisseur}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribEmp}
                min={1}
                max={100}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "emp")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribEmp ===
                  hygieneDistribQuantite?.nbDistribEmp
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
                  hygiene.quantites.nbDistribSavon ===
                  hygieneDistribQuantite?.nbDistribSavon
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
                  hygiene.quantites.nbDistribPh ===
                  hygieneDistribQuantite?.nbDistribPh
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
                      const isDisabled = !hygieneDistribTarifs.some((tarif) =>
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
          const prixAnnuelText = proposition.prixAnnuel
            ? `${formatNumber(proposition.prixAnnuel)} € / an`
            : "Non proposé";
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-2 ${
                hygiene.infos.trilogieGammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={proposition.gamme}
              onClick={() => handleClickProposition(proposition)}
            >
              <Checkbox
                checked={hygiene.infos.trilogieGammeSelected === gamme}
                onCheckedChange={() => handleClickProposition(proposition)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">{prixAnnuelText}</p>
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
                  {hygiene.infos.dureeLocation === "oneShot"
                    ? ""
                    : `Location engagement
                    ${
                      hygiene.infos.dureeLocation === "pa12M"
                        ? "12"
                        : hygiene.infos.dureeLocation === "pa24M"
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
