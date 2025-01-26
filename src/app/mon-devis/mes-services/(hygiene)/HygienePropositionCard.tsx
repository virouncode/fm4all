import { Checkbox } from "@/components/ui/checkbox";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type HygienePropositionCardProps = {
  proposition: {
    gamme: GammeType;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    prixAnnuelTrilogie: number | null;
  };
  handleClickProposition: (proposition: {
    gamme: GammeType;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    prixAnnuelTrilogie: number | null;
  }) => void;
  prixInstalDistrib: number | null;
};

const HygienePropositionCard = ({
  proposition,
  handleClickProposition,
  prixInstalDistrib,
}: HygienePropositionCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const prixMensuelText = proposition.prixAnnuelTrilogie
    ? `${formatNumber(proposition.prixAnnuelTrilogie / 12)} € / mois`
    : "Non proposé";
  const prixInstallationText = prixInstalDistrib
    ? `+ ${formatNumber(prixInstalDistrib)} € d'installation`
    : "";
  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-2 ${
        hygiene.infos.trilogieGammeSelected === gamme
          ? "ring-4 ring-inset ring-destructive"
          : ""
      } px-8`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={hygiene.infos.trilogieGammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixMensuelText}</p>
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
};

export default HygienePropositionCard;
