import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import { MAX_PASSAGES_VITRERIE } from "./NettoyageOptionsPropositions";

type NettoyageOptionsVitrerieCardProps = {
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickVitrerieProposition: (vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  handleChangeNbPassageVitrerie: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  color: string;
};

const NettoyageOptionsVitrerieCard = ({
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageOptionsVitrerieCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const vitreriePrixMensuelText = vitrerieProposition.prixAnnuel ? (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((vitrerieProposition.prixAnnuel * MARGE) / 12))}{" "}
      €/mois
    </p>
  ) : (
    <p className="font-bold text-base">Non proposé</p>
  );
  const nbPassagesVitrerieText = (
    <li className="list-check">
      {nettoyage.quantites.nbPassagesVitrerie} passages / an
    </li>
  );
  const infosProduit = (
    <li className="list-check">Vitres et cloisons accessibles de plain-pied</li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>Lavage Vitrerie</p>
  );
  const imgProduit = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );
  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center p-4">
        <div className="flex flex-col gap-2 items-center justify-center w-full">
          Lavage Vitrerie
          <div className="flex gap-4 items-center justify-center w-full">
            <Input
              type="number"
              value={nettoyage.quantites.nbPassagesVitrerie || ""}
              min={1}
              max={MAX_PASSAGES_VITRERIE}
              step={1}
              onChange={handleChangeNbPassageVitrerie}
              className={`w-16 ${
                nettoyage.quantites.nbPassagesVitrerie === 2
                  ? "text-fm4alldestructive"
                  : ""
              }`}
            />
            <Label htmlFor="nbDePassagesVitrerie" className="text-sm">
              passages / an
            </Label>
          </div>
          <p className="text-xs text-fm4alldestructive italic px-2 text-center">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div
        className={`flex w-3/4 items-center p-4 justify-center ${
          nettoyage.infos.vitrerieSelected && vitrerieProposition.prixAnnuel
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
        onClick={
          vitrerieProposition.prixAnnuel
            ? () => handleClickVitrerieProposition(vitrerieProposition)
            : undefined
        }
      >
        {vitrerieProposition.prixAnnuel ? (
          <Switch
            checked={nettoyage.infos.vitrerieSelected}
            onCheckedChange={() =>
              handleClickVitrerieProposition(vitrerieProposition)
            }
            className="data-[state=checked]:bg-fm4alldestructive"
            title="Sélectionner cette proposition"
          />
        ) : null}
        <div>
          <div className="flex gap-2 items-center">
            {vitreriePrixMensuelText}
            <Dialog>
              <DialogTrigger asChild>
                <Info
                  size={16}
                  className="cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {imgProduit}
                  <p className="text-xs italic text-end">
                    *photo non contractuelle
                  </p>
                  <ul className="flex flex-col text-sm mx-auto">
                    {infosProduit}
                    {nbPassagesVitrerieText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="flex flex-col text-xs ml-4">
            {infosProduit}
            {nbPassagesVitrerieText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsVitrerieCard;
