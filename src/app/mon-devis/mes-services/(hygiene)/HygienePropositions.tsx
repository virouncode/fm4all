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
import { gammes } from "@/zod-schemas/gamme";
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
    gamme: "essentiel" | "confort" | "excellence";
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number;
    prixDistribSavon: number;
    prixDistribPh: number;
    prixInstalDistrib: number;
    prixAnnuelTrilogie: number;
  }) => {
    const {
      gamme,
      prixDistribEmp,
      prixDistribSavon,
      prixDistribPh,
      prixInstalDistrib,
      prixAnnuelTrilogie,
    } = proposition;

    //Je décoche la proposition
    if (gamme === hygiene.infos.trilogieGammeSelected) {
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          trilogieGammeSelected: null,
        },
        prix: {
          ...prev.prix,
          prixDistribEmp: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
        },
      }));
      setTotalHygiene((prev) => ({
        ...prev,
        totalTrilogie: 0,
        totalDesinfectant: 0,
        totalParfum: 0,
        totalBalai: 0,
        totalPoubelle: 0,
        totalInstallation: 0,
      }));
      return;
    }
    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        trilogieGammeSelected: gamme,
      },
      prix: {
        ...prev.prix,
        prixDistribEmp,
        prixDistribSavon,
        prixDistribPh,
        prixInstalDistrib,
        paParPersonneEmp,
        paParPersonneSavon,
        paParPersonnePh,
      },
    }));
    //Calculer total hygiene
    const totalTrilogie = prixAnnuelTrilogie;
    const nbDistribDesinfectant = hygiene.quantites.nbDistribDesinfectant ?? 0;
    const nbDistribParfum = hygiene.quantites.nbDistribParfum ?? 0;
    const nbDistribBalai = hygiene.quantites.nbDistribBalai ?? 0;
    const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle ?? 0;
    const prixDistribDesinfectant = hygiene.prix.prixDistribDesinfectant ?? 0;
    const prixDistribParfum = hygiene.prix.prixDistribParfum ?? 0;
    const prixDistribBalai = hygiene.prix.prixDistribBalai ?? 0;
    const prixDistribPoubelle = hygiene.prix.prixDistribPoubelle ?? 0;
    const paParPersonneDesinfectant =
      hygiene.prix.paParPersonneDesinfectant ?? 0;

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
      totalInstallation: prixInstalDistrib,
    });
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;
    if (!hygiene.infos.trilogieGammeSelected) {
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
          break;
      }
      return;
    }

    const gamme = hygiene.infos.trilogieGammeSelected;
    const fournisseurId = hygiene.infos.fournisseurId;
    const prixDistribEmp =
      hygieneDistribTarifs.find(
        (item) =>
          item.type === "emp" &&
          item.gamme === gamme &&
          item.fournisseurId === fournisseurId
      )?.[dureeLocation] ?? 0;
    const prixDistribSavon =
      hygieneDistribTarifs.find(
        (item) =>
          item.type === "savon" &&
          item.gamme === gamme &&
          item.fournisseurId === fournisseurId
      )?.[dureeLocation] ?? 0;
    const prixDistribPh =
      hygieneDistribTarifs.find(
        (item) =>
          item.type === "ph" &&
          item.gamme === gamme &&
          item.fournisseurId === fournisseurId
      )?.[hygiene.infos.dureeLocation] ?? 0;

    let totalEmp = 0;
    let totalSavon = 0;
    let totalPh = 0;
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
        totalEmp =
          newNbDistribEmp * prixDistribEmp +
          paParPersonneEmp * (client.effectif ?? 0);
        totalSavon =
          nbDistribSavon * prixDistribSavon +
          paParPersonneSavon * (client.effectif ?? 0);
        totalPh =
          nbDistribPh * prixDistribPh +
          paParPersonnePh * (client.effectif ?? 0);
        totalTrilogie = gamme ? Math.round(totalEmp + totalSavon + totalPh) : 0;
        setTotalHygiene((prev) => ({
          ...prev,
          totalTrilogie,
        }));
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
        totalEmp =
          nbDistribEmp * prixDistribEmp +
          paParPersonneEmp * (client.effectif ?? 0);
        totalSavon =
          newNbDistribSavon * prixDistribSavon +
          paParPersonneSavon * (client.effectif ?? 0);
        totalPh =
          nbDistribPh * prixDistribPh +
          paParPersonnePh * (client.effectif ?? 0);
        totalTrilogie = gamme ? Math.round(totalEmp + totalSavon + totalPh) : 0;
        setTotalHygiene((prev) => ({
          ...prev,
          totalTrilogie,
        }));
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
        totalEmp =
          nbDistribEmp * prixDistribEmp +
          paParPersonneEmp * (client.effectif ?? 0);
        totalSavon =
          nbDistribSavon * prixDistribSavon +
          paParPersonneSavon * (client.effectif ?? 0);
        totalPh =
          newNbDistribPh * prixDistribPh +
          paParPersonnePh * (client.effectif ?? 0);
        totalTrilogie = gamme ? Math.round(totalEmp + totalSavon + totalPh) : 0;
        setTotalHygiene((prev) => ({
          ...prev,
          totalTrilogie,
        }));
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    const prixDistribEmp =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribSavon =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribPh =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribDesinfectant =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribParfum =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribBalai =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;
    const prixDistribPoubelle =
      hygieneDistribTarifs.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected &&
          tarif.fournisseurId === hygiene.infos.fournisseurId
      )?.[value] ?? 0;

    const nbDistribDesinfectant = hygiene.quantites.nbDistribDesinfectant ?? 0;
    const nbDistribParfum = hygiene.quantites.nbDistribParfum ?? 0;
    const nbDistribBalai = hygiene.quantites.nbDistribBalai ?? 0;
    const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle ?? 0;
    const paParPersonneDesinfectant =
      hygiene.prix.paParPersonneDesinfectant ?? 0;

    const totalEmp =
      nbDistribEmp * prixDistribEmp + paParPersonneEmp * (client.effectif ?? 0);
    const totalSavon =
      nbDistribSavon * prixDistribSavon +
      paParPersonneSavon * (client.effectif ?? 0);
    const totalPh =
      nbDistribPh * prixDistribPh + paParPersonnePh * (client.effectif ?? 0);

    const totalTrilogie = hygiene.infos.trilogieGammeSelected
      ? Math.round(totalEmp + totalSavon + totalPh)
      : 0;
    const totalDesinfectant = hygiene.infos.desinfectantGammeSelected
      ? nbDistribDesinfectant * prixDistribDesinfectant +
        (client.effectif ?? 0) * paParPersonneDesinfectant
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
      setTotalHygiene((prev) => ({
        ...prev,
        totalTrilogie,
        totalDesinfectant,
        totalParfum,
        totalBalai,
        totalPoubelle,
      }));
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

    const prixAnnuelTrilogie = Math.round(
      nbDistribEmp * prixDistribEmp +
        nbDistribSavon * prixDistribSavon +
        nbDistribPh * prixDistribPh +
        (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) *
          (client.effectif ?? 0)
    );

    return {
      gamme,
      nbDistribEmp,
      nbDistribSavon,
      nbDistribPh,
      prixDistribEmp,
      prixDistribSavon,
      prixDistribPh,
      prixInstalDistrib,
      prixAnnuelTrilogie,
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
          const prixAnnuelText = proposition.prixAnnuelTrilogie
            ? `${formatNumber(proposition.prixAnnuelTrilogie / 12)} € / mois`
            : "Non proposé";
          const prixInstallationText = `+ ${formatNumber(
            proposition.prixInstalDistrib
          )} € d'installation`;
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
                {prixInstallationText && (
                  <p className="text-base">{prixInstallationText}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HygienePropositions;
