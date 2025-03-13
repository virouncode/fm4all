import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Label } from "@radix-ui/react-label";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsPoubelleInputProps = {
  nbDistribPoubelle: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifsFournisseur: {
    id: number;
    effectif: string | null;
    createdAt: Date;
    type:
      | "emp"
      | "poubelleEmp"
      | "savon"
      | "ph"
      | "desinfectant"
      | "parfum"
      | "balai"
      | "poubelle";
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    oneShot: number | null;
    pa12M: number | null;
    pa24M: number | null;
    pa36M: number | null;
    imageUrl: string | null;
  }[];
};

const HygieneMobileOptionsPoubelleInput = ({
  nbDistribPoubelle,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsPoubelleInputProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const handleIncrement = () => {
    let newNbDistribPoubelle = nbDistribPoubelle + 1;
    if (newNbDistribPoubelle > MAX_NB_DISTRIB)
      newNbDistribPoubelle = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribPoubelle: newNbDistribPoubelle,
      },
    }));
    if (hygiene.infos.poubelleGammeSelected) {
      const prixDistribPoubelle =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "poubelle" &&
            tarif.gamme === hygiene.infos.poubelleGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalPoubelle =
        newNbDistribPoubelle && prixDistribPoubelle !== null
          ? newNbDistribPoubelle * prixDistribPoubelle
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalPoubelle,
      }));
    }
  };
  const handleDecrement = () => {
    let newNbDistribPoubelle = nbDistribPoubelle - 1;
    if (newNbDistribPoubelle < 0) newNbDistribPoubelle = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribPoubelle: newNbDistribPoubelle,
      },
    }));
    if (hygiene.infos.poubelleGammeSelected) {
      const prixDistribPoubelle =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "poubelle" &&
            tarif.gamme === hygiene.infos.poubelleGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalPoubelle =
        newNbDistribPoubelle && prixDistribPoubelle !== null
          ? newNbDistribPoubelle * prixDistribPoubelle
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalPoubelle,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Poubelle hygiène féminine</p>
      <p>
        Indiquez le nombre de <strong>réceptacles</strong> :
      </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribPoubelle" className="text-sm">
          Nombre de réceptacles
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribPoubelle || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
            className={`w-16 ${
              hygiene.quantites.nbDistribPoubelle ===
              hygieneDistribQuantite.nbDistribPoubelle
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribPoubelle"
          />
          <Button
            variant="outline"
            title="Diminuer le nombre de distributeurs"
            onClick={handleDecrement}
            disabled={nbDistribPoubelle === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title="Augmenter le nombre de distributeurs"
            onClick={handleIncrement}
            disabled={nbDistribPoubelle === MAX_NB_DISTRIB}
          >
            <Plus />
          </Button>
        </div>

        <p className="text-xs italic text-fm4alldestructive">
          Les quantités sont estimées pour vous mais vous pouvez les changer
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsPoubelleInput;
