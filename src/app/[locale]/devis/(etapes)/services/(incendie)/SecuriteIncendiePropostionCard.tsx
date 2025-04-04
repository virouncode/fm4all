import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { IncendieContext } from "@/context/IncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type SecuriteIncendiePropostionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }) => void;
};

const SecuriteIncendiePropostionCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendiePropostionCardProps) => {
  const t = useTranslations("DevisPage");
  const tIncendie = useTranslations("DevisPage.services.incendie");
  const { incendie } = useContext(IncendieContext);
  const { totalAnnuelTrilogie, fraisDeplacementTrilogie } = proposition;

  if (!totalAnnuelTrilogie)
    return (
      <div className="w-3/4 flex items-center justify-center text-xl gap-4 p-4 cursor-pointer bg-slate-100">
        {t("non-propose")}
      </div>
    );
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(
        Math.round(
          ((totalAnnuelTrilogie + fraisDeplacementTrilogie) * MARGE) / 12
        )
      )}{" "}
      {t("euros-mois")}
    </p>
  );
  const infosProduit = (
    <ul className="flex flex-col text-sm px-4">
      <li className="list-check">
        {tIncendie("1-passage-an-pour-le-controle-obligatoire-de")}
        <ul className="ml-4">
          <li className="list-disc">
            {proposition.nbExtincteurs} {tIncendie("extincteurs").toLowerCase()}
          </li>
          <li className="list-disc">
            {proposition.nbBaes} {tIncendie("baes").toLowerCase()}
          </li>
          <li className="list-disc">
            {proposition.nbTelBaes}{" "}
            {tIncendie("telecommande-s-baes").toLowerCase()}
          </li>
        </ul>
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check">
        {tIncendie("1-passage-par-an-pour-le-controle-obligatoire-de")}
        <ul className="ml-4">
          <li className="list-disc">
            {proposition.nbExtincteurs} {tIncendie("extincteurs").toLowerCase()}
          </li>
          <li className="list-disc">
            {proposition.nbBaes} {tIncendie("baes").toLowerCase()}
          </li>
          <li className="list-disc">
            {proposition.nbTelBaes}{" "}
            {tIncendie("telecommande-s-baes").toLowerCase()}
          </li>
        </ul>
      </li>
    </ul>
  );

  const infosText = (
    <p className="text-sm">
      {tIncendie(
        "pour-la-securite-de-tous-verification-annuelle-obligatoire-norme"
      )}
      <strong> {tIncendie("nf-s61-919")}</strong>
      {tIncendie(
        "conseils-sur-limplantation-remplacement-ou-rechargement-si-necessaire-au-bpu"
      )}
    </p>
  );

  const dialogTitle = (
    <p className="text-center">{tIncendie("securite-incendie")}</p>
  );

  const imgProduit = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de securité incendie`}
        fill={true}
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );

  return (
    <div
      className={`w-3/4 flex items-center justify-center text-xl gap-4 p-4 cursor-pointer bg-slate-100 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={incendie.infos.fournisseurId === proposition.fournisseurId}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
      />
      <div>
        <div className="flex gap-2 items-center">
          {totalMensuelText}
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
                {infosText}
                {imgProduit}
                <p className="text-xs italic text-end">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
