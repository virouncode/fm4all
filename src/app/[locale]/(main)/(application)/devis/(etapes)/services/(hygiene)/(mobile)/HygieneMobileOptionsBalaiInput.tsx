import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_NB_DISTRIB } from "@/constants/constants";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useTotalHygieneStore } from "@/stores/devis/totalHygieneStore";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsBalaiInputProps = {
  nbDistribBalai: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifsFournisseur: {
    id: string;
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
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;

    anneeCreation: number | null;
    ca: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    oneShot: number | null;
    pa12M: number | null;
    pa24M: number | null;
    pa36M: number | null;

  }[];
};

const HygieneMobileOptionsBalaiInput = ({
  nbDistribBalai,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsBalaiInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");

  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const setTotalHygiene = useTotalHygieneStore((s) => s.setTotalHygiene);

  const handleIncrement = () => {
    let newNbDistribBalai = nbDistribBalai + 1;
    if (newNbDistribBalai > MAX_NB_DISTRIB) newNbDistribBalai = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribBalai: newNbDistribBalai,
      },
    }));
    if (hygiene.infos.balaiGammeSelected) {
      const prixDistribBalai =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "balai" &&
            tarif.gamme === hygiene.infos.balaiGammeSelected,
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalBalai =
        newNbDistribBalai && prixDistribBalai !== null
          ? newNbDistribBalai * prixDistribBalai
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalBalai,
      }));
    }
  };
  const handleDecrement = () => {
    let newNbDistribBalai = nbDistribBalai - 1;
    if (newNbDistribBalai < 0) newNbDistribBalai = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribBalai: newNbDistribBalai,
      },
    }));
    if (hygiene.infos.balaiGammeSelected) {
      const prixDistribBalai =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "balai" &&
            tarif.gamme === hygiene.infos.balaiGammeSelected,
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalBalai =
        newNbDistribBalai && prixDistribBalai !== null
          ? newNbDistribBalai * prixDistribBalai
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalBalai,
      }));
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">{tHygiene("balais-wc")}</p>
      <p>
        {t("indiquez-le-nombre-de")} <strong>{tHygiene("blocs")}</strong> :{" "}
      </p>
      <div className="flex w-full flex-col gap-2 p-1">
        <Label htmlFor="nbDistribBalai" className="text-sm">
          {tHygiene("nombre-de-blocs-balais-wc")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribBalai || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "parfum")}
            className={`w-16 ${
              hygiene.quantites.nbDistribBalai ===
              hygieneDistribQuantite.nbDistribBalai
                ? "text-destructive"
                : ""
            }`}
            id="nbDistribBalai"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribBalai === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribBalai === MAX_NB_DISTRIB}
          >
            <Plus />
          </Button>
        </div>
        <p className="text-destructive text-xs italic">
          {t(
            "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
          )}
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsBalaiInput;
