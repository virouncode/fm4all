import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useContext } from "react";
import { MAX_EFFECTIF } from "../../../mes-locaux/MesLocaux";

type TheMobileInputsProps = {
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: ChangeEvent<HTMLInputElement>) => void;
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const TheMobileInputs = ({
  nbPersonnes,
  handleChangeNbPersonnes,
  theConsoTarifs,
}: TheMobileInputsProps) => {
  const { cafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const { client } = useContext(ClientContext);
  const effectif = client.effectif ?? 0;

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes > MAX_EFFECTIF) newNbPersonnes = MAX_EFFECTIF;
    const nbThesParAn = newNbPersonnes * 400;
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId &&
          tarif.gamme === the.infos.gammeSelected
      )?.prixUnitaire ?? null;
    const totalAnnuel =
      newNbPersonnes && prixUnitaire !== null
        ? nbThesParAn * prixUnitaire
        : null;

    setThe((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPersonnes: newNbPersonnes,
      },
      prix: {
        prixUnitaire: the.infos.gammeSelected
          ? prixUnitaire
          : prev.prix.prixUnitaire,
      },
    }));
    if (the.infos.gammeSelected) {
      setTotalThe({
        totalService: totalAnnuel,
      });
    }
  };
  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes < 0) newNbPersonnes = 0;
    const nbThesParAn = newNbPersonnes * 400;
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId &&
          tarif.gamme === the.infos.gammeSelected
      )?.prixUnitaire ?? null;
    const totalAnnuel =
      newNbPersonnes && prixUnitaire !== null
        ? nbThesParAn * prixUnitaire
        : null;

    setThe((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPersonnes: newNbPersonnes,
      },
      prix: {
        prixUnitaire: the.infos.gammeSelected
          ? prixUnitaire
          : prev.prix.prixUnitaire,
      },
    }));
    if (the.infos.gammeSelected) {
      setTotalThe({
        totalService: totalAnnuel,
      });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <p>
        Indiquez le <strong>nombre de personnes</strong> consommant du thé :{" "}
      </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
          Nombre de personnes
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbPersonnes}
            min={1}
            max={MAX_EFFECTIF}
            step={1}
            onChange={handleChangeNbPersonnes}
            className={`w-16 ${
              nbPersonnes === Math.round(effectif * 0.15)
                ? "text-fm4alldestructive"
                : ""
            }`}
          />
          <Button
            variant="outline"
            title="Diminuer le nombre de personnes"
            onClick={handleDecrement}
            disabled={nbPersonnes === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title="Augmenter le nombre de personnes"
            onClick={handleIncrement}
            disabled={nbPersonnes === MAX_EFFECTIF}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TheMobileInputs;
