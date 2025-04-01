import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsDesinfectantInputProps = {
  nbDistribDesinfectant: number;
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
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

const HygieneMobileOptionsDesinfectantInput = ({
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsDesinfectantInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
  const { client } = useContext(ClientContext);

  const handleIncrement = () => {
    let newNbDistribDesinfectant = nbDistribDesinfectant + 1;
    if (newNbDistribDesinfectant > MAX_NB_DISTRIB)
      newNbDistribDesinfectant = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribDesinfectant: newNbDistribDesinfectant,
      },
    }));
    if (hygiene.infos.desinfectantGammeSelected) {
      const prixDistribDesinfectant =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "desinfectant" &&
            tarif.gamme === hygiene.infos.desinfectantGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalDesinfectant =
        newNbDistribDesinfectant &&
        prixDistribDesinfectant !== null &&
        hygiene.prix.paParPersonneDesinfectant !== null &&
        newNbDistribDesinfectant
          ? newNbDistribDesinfectant * prixDistribDesinfectant +
            hygiene.prix.paParPersonneDesinfectant * (client.effectif ?? 0)
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalDesinfectant,
      }));
    }
  };
  const handleDecrement = () => {
    let newNbDistribDesinfectant = nbDistribDesinfectant - 1;
    if (newNbDistribDesinfectant < 0) newNbDistribDesinfectant = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribDesinfectant: newNbDistribDesinfectant,
      },
    }));
    if (hygiene.infos.desinfectantGammeSelected) {
      const prixDistribDesinfectant =
        hygieneDistribTarifsFournisseur.find(
          (tarif) =>
            tarif.type === "desinfectant" &&
            tarif.gamme === hygiene.infos.desinfectantGammeSelected
        )?.[hygiene.infos.dureeLocation] ?? null;

      const totalDesinfectant =
        newNbDistribDesinfectant &&
        prixDistribDesinfectant !== null &&
        hygiene.prix.paParPersonneDesinfectant !== null &&
        newNbDistribDesinfectant
          ? newNbDistribDesinfectant * prixDistribDesinfectant +
            hygiene.prix.paParPersonneDesinfectant * (client.effectif ?? 0)
          : null;
      setTotalHygiene((prev) => ({
        ...prev,
        totalDesinfectant,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">
        {tHygiene("desinfectant-pour-cuvettes")}
      </p>
      <p>
        {t("indiquez-le-nombre-de")}{" "}
        <strong>{tHygiene("distributeurs-de-desinfectant")}</strong> :{" "}
      </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribDesinfectant" className="text-sm">
          {tHygiene("nombre-de-distributeurs")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribDesinfectant || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
            className={`w-16 ${
              hygiene.quantites.nbDistribDesinfectant ===
              hygieneDistribQuantite.nbDistribDesinfectant
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribDesinfectant"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribDesinfectant === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribDesinfectant === MAX_NB_DISTRIB}
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

export default HygieneMobileOptionsDesinfectantInput;
