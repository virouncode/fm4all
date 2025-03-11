import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Minus, Plus } from "lucide-react";
import React, { useContext } from "react";
import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "../HygienePropositions";

type HygieneMobileDistribQuantitesInputsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  handleChangeDureeLocation: (
    value: "oneShot" | "pa12M" | "pa24M" | "pa36M"
  ) => void;
  nbDistribEmp: number;
  nbDistribSavon: number;
  nbDistribPh: number;
  dureeLocation: "oneShot" | "pa12M" | "pa24M" | "pa36M";
  hygieneDistribTarifsFournisseur: {
    type:
      | "emp"
      | "poubelleEmp"
      | "savon"
      | "ph"
      | "desinfectant"
      | "parfum"
      | "balai"
      | "poubelle";
    fournisseurId: number;
    nomFournisseur: string;
    logoUrl: string | null;
    pa12M: number | null;
    pa24M: number | null;
    pa36M: number | null;
    oneShot: number | null;
    id: number;
    slogan: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    gamme: "essentiel" | "confort" | "excellence";
    imageUrl: string | null;
  }[];
};

const HygieneMobileDistribQuantitesInputs = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  handleChangeDistribNbr,
  handleChangeDureeLocation,
  nbDistribEmp,
  nbDistribSavon,
  nbDistribPh,
  dureeLocation,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileDistribQuantitesInputsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { client } = useContext(ClientContext);
  const effectif = client.effectif ?? 0;

  const handleIncrement = (type: "emp" | "savon" | "ph") => {
    if (!hygiene.infos.trilogieGammeSelected) {
      //On change juste le nb de distributeurs
      switch (type) {
        case "emp":
          let newNbrEmp = nbDistribEmp + 1;
          if (newNbrEmp > MAX_NB_EMP) newNbrEmp = MAX_NB_EMP;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribEmp: newNbrEmp,
              nbDistribEmpPoubelle: newNbrEmp,
            },
          }));
          break;
        case "savon":
          let newNbSavon = nbDistribSavon + 1;
          if (newNbSavon > MAX_NB_SAVON) newNbSavon = MAX_NB_SAVON;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribSavon: newNbSavon,
            },
          }));
          break;
        case "ph":
          let newNbPh = nbDistribPh + 1;
          if (newNbPh > MAX_NB_PH) newNbPh = MAX_NB_PH;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribPh: newNbPh,
            },
          }));
          break;
      }
      return;
    }
    //Sinon on reclcule les totaux pour la trilogie avec la nouvelle gamme
    const gamme = hygiene.infos.trilogieGammeSelected;
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "emp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "poubelleEmp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "savon" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "ph" && item.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? null;

    let totalEmp: number | null = null;
    let totalSavon: number | null = null;
    let totalPh: number | null = null;
    let totalTrilogie: number | null = null;

    switch (type) {
      case "emp":
        let newNbrEmp = nbDistribEmp + 1;
        if (newNbrEmp > MAX_NB_EMP) newNbrEmp = MAX_NB_EMP;

        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribEmp: newNbrEmp,
            nbDistribEmpPoubelle: newNbrEmp,
          },
        }));
        totalEmp =
          newNbrEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? newNbrEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          nbDistribSavon &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          nbDistribPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh +
              hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);

        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "savon":
        let newNbSavon = nbDistribSavon + 1;
        if (newNbSavon > MAX_NB_SAVON) newNbSavon = MAX_NB_SAVON;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribSavon: newNbSavon,
          },
        }));
        totalEmp =
          nbDistribEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          newNbSavon !== null &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? newNbSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          nbDistribPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh +
              hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "ph":
        let newNbPh = nbDistribPh + 1;
        if (newNbPh > MAX_NB_PH) newNbPh = MAX_NB_PH;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPh: newNbPh,
          },
        }));
        totalEmp =
          nbDistribEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          nbDistribSavon &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          newNbPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? newNbPh * prixDistribPh + hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
    }
  };

  const handleDecrement = (type: "emp" | "savon" | "ph") => {
    if (!hygiene.infos.trilogieGammeSelected) {
      //On change juste le nb de distributeurs
      switch (type) {
        case "emp":
          let newNbrEmp = nbDistribEmp - 1;
          if (newNbrEmp < 0) newNbrEmp = 0;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribEmp: newNbrEmp,
              nbDistribEmpPoubelle: newNbrEmp,
            },
          }));
          break;
        case "savon":
          let newNbSavon = nbDistribSavon - 1;
          if (newNbSavon < 0) newNbSavon = 0;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribSavon: newNbSavon,
            },
          }));
          break;
        case "ph":
          let newNbPh = nbDistribPh - 1;
          if (newNbPh < 0) newNbPh = 0;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribPh: newNbPh,
            },
          }));
          break;
      }
      return;
    }
    //Sinon on reclcule les totaux pour la trilogie avec la nouvelle gamme
    const gamme = hygiene.infos.trilogieGammeSelected;
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "emp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "poubelleEmp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "savon" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "ph" && item.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? null;

    let totalEmp: number | null = null;
    let totalSavon: number | null = null;
    let totalPh: number | null = null;
    let totalTrilogie: number | null = null;

    switch (type) {
      case "emp":
        let newNbrEmp = nbDistribEmp - 1;
        if (newNbrEmp < 0) newNbrEmp = 0;

        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribEmp: newNbrEmp,
            nbDistribEmpPoubelle: newNbrEmp,
          },
        }));
        totalEmp =
          newNbrEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? newNbrEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          nbDistribSavon &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          nbDistribPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh +
              hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);

        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "savon":
        let newNbSavon = nbDistribSavon - 1;
        if (newNbSavon < 0) newNbSavon = 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribSavon: newNbSavon,
          },
        }));
        totalEmp =
          nbDistribEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          newNbSavon !== null &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? newNbSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          nbDistribPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh +
              hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "ph":
        let newNbPh = nbDistribPh - 1;
        if (newNbPh < 0) newNbPh = 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPh: newNbPh,
          },
        }));
        totalEmp =
          nbDistribEmp &&
          prixDistribEmp !== null &&
          hygiene.prix.paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              hygiene.prix.paParPersonneEmp * effectif
            : null;
        totalSavon =
          nbDistribSavon &&
          prixDistribSavon !== null &&
          hygiene.prix.paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon +
              hygiene.prix.paParPersonneSavon * effectif
            : null;
        totalPh =
          newNbPh &&
          prixDistribPh !== null &&
          hygiene.prix.paParPersonnePh !== null
            ? newNbPh * prixDistribPh + hygiene.prix.paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp === null && totalSavon === null && totalPh === null
            ? null
            : (totalEmp ?? 0) + (totalSavon ?? 0) + (totalPh ?? 0);
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          Indiquez la <strong>durée d&apos;engagement</strong> souhaitée :{" "}
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Durée de location
          </Label>
          <Select
            onValueChange={handleChangeDureeLocation}
            value={dureeLocation}
            aria-label="Sélectionnez la durée de location"
          >
            <SelectTrigger className="w-full">
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
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le nombre de{" "}
          <strong>distributeurs essuie-mains papier</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribEmp || ""}
              min={1}
              max={MAX_NB_EMP}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "emp")}
              className={`w-16 ${
                hygiene.quantites.nbDistribEmp ===
                hygieneDistribQuantite?.nbDistribEmp
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribEmp"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("emp")}
              disabled={nbDistribEmp === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("emp")}
              disabled={nbDistribEmp === MAX_NB_EMP}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le nombre de <strong>distributeurs de savon</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribSavon" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribSavon || ""}
              min={1}
              max={MAX_NB_SAVON}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "savon")}
              className={`w-16 ${
                hygiene.quantites.nbDistribSavon ===
                hygieneDistribQuantite?.nbDistribSavon
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribSavon"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("savon")}
              disabled={nbDistribSavon === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("savon")}
              disabled={nbDistribSavon === MAX_NB_SAVON}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le nombre de{" "}
          <strong>distributeurs de papier hygiénique</strong> :{" "}
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribPh || ""}
              min={1}
              max={MAX_NB_PH}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "ph")}
              className={`w-16 ${
                hygiene.quantites.nbDistribPh ===
                hygieneDistribQuantite?.nbDistribPh
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribPh"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("ph")}
              disabled={nbDistribPh === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("ph")}
              disabled={nbDistribPh === MAX_NB_PH}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
    </div>
  );
};
export default HygieneMobileDistribQuantitesInputs;
