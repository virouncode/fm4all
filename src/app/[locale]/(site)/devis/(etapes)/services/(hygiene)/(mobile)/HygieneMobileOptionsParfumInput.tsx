import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_NB_DISTRIB } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useContext } from "react";

type HygieneMobileOptionsParfumInputProps = {
  nbDistribParfum: number;
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

const HygieneMobileOptionsParfumInput = ({
  nbDistribParfum,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsParfumInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  const handleIncrement = () => {
    let newNbDistribParfum = nbDistribParfum + 1;
    if (newNbDistribParfum > MAX_NB_DISTRIB)
      newNbDistribParfum = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribParfum: newNbDistribParfum,
      },
    }));
    if (hygiene.infos.parfumGammeSelected) {
      const prixDistribParfum =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "parfum" &&
            tarif.gamme === hygiene.infos.parfumGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalParfum =
        newNbDistribParfum && prixDistribParfum !== null
          ? newNbDistribParfum * prixDistribParfum
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalParfum,
      }));
    }
  };
  const handleDecrement = () => {
    let newNbDistribParfum = nbDistribParfum - 1;
    if (newNbDistribParfum < 0) newNbDistribParfum = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribParfum: newNbDistribParfum,
      },
    }));
    if (hygiene.infos.parfumGammeSelected) {
      const prixDistribParfum =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "parfum" &&
            tarif.gamme === hygiene.infos.parfumGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalParfum =
        newNbDistribParfum && prixDistribParfum !== null
          ? newNbDistribParfum * prixDistribParfum
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalParfum,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">{tHygiene("parfum")}</p>
      <p>
        {t("indiquez-le-nombre-de")}{" "}
        <strong>{tHygiene("diffuseurs").toLowerCase()}</strong> :
      </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribParfum" className="text-sm">
          {tHygiene("nombre-de-diffuseurs")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribParfum || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "parfum")}
            className={`w-16 ${
              hygiene.quantites.nbDistribParfum ===
              hygieneDistribQuantite.nbDistribParfum
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribParfum"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribParfum === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribParfum === MAX_NB_DISTRIB}
          >
            <Plus />
          </Button>
        </div>

        <p className="text-xs italic text-fm4alldestructive">
          {t(
            "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer"
          )}
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsParfumInput;
