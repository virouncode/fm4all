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
import { MARGE, MAX_PASSAGES_VITRERIE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  color: string;
};

const NettoyageOptionsVitrerieCard = ({
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageOptionsVitrerieCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useNettoyageStore();
  const vitreriePrixMensuelText = vitrerieProposition.prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-vitrerie">
      {formatNumber((vitrerieProposition.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">{t("non-propose")}</p>
  );
  const nbPassagesVitrerieText = (
    <li className="list-check">
      {nettoyage.quantites.nbPassagesVitrerie} {t("passages-an")}
    </li>
  );
  const infosProduit = (
    <li className="list-check">
      {tNettoyage("vitres-et-cloisons-accessibles-de-plain-pied")}
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {tNettoyage("lavage-vitrerie")}
    </p>
  );
  const imgProduit = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="cursor-pointer object-contain object-center"
        quality={100}
      />
    </div>
  );
  return (
    <div className="flex flex-1 border-b">
      <div className="flex w-1/4 items-center justify-center p-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          {tNettoyage("lavage-vitrerie")}
          <div className="flex w-full items-center justify-center gap-4">
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
              {t("passages-an")}
            </Label>
          </div>
          <p className="text-fm4alldestructive px-2 text-center text-xs italic">
            {t(
              "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
            )}
          </p>
        </div>
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          nettoyage.infos.vitrerieSelected && vitrerieProposition.prixAnnuel
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
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
            title={t("selectionnez-cette-proposition")}
            data-testid="vitrerie-switch"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
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
                  <p className="text-end text-xs italic">
                    {t("photo-non-contractuelle")}
                  </p>
                  <ul className="mx-auto flex flex-col text-sm">
                    {infosProduit}
                    {nbPassagesVitrerieText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="ml-4 flex flex-col text-xs">
            {infosProduit}
            {nbPassagesVitrerieText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsVitrerieCard;
