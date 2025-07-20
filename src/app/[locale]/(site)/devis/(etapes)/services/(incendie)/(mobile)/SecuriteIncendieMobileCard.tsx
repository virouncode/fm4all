import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
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
import { formatNumber } from "@/lib/utils/formatNumber";
import { useTranslations } from "next-intl";

import Image from "next/image";
import { useContext } from "react";

type SecuriteIncendieMobileCardProps = {
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

const SecuriteIncendieMobileCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendieMobileCardProps) => {
  const t = useTranslations("DevisPage");
  const tIncendie = useTranslations("DevisPage.services.incendie");
  const { incendie } = useContext(IncendieContext);
  const {
    fournisseurId,
    nomFournisseur,
    sloganFournisseur,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
    totalAnnuelTrilogie,
    fraisDeplacementTrilogie,
  } = proposition;

  const totalMensuelText = totalAnnuelTrilogie ? (
    <p className="text-sm font-bold">
      {formatNumber(
        ((totalAnnuelTrilogie + fraisDeplacementTrilogie) * MARGE) / 12,
      )}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );

  const dialogTitle = (
    <p className="text-center">{tIncendie("securite-incendie")}</p>
  );

  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-200">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill={true}
        className="cursor-pointer object-contain"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative mx-auto h-60 w-full rounded-lg border border-slate-200 bg-slate-100">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill={true}
        className="object-contain"
        quality={100}
      />
    </div>
  );

  const infosProduit = (
    <ul className="flex w-2/3 flex-col px-4 text-xs">
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
      <li className="list-check">
        {tIncendie(
          "pour-la-securite-de-tous-verification-annuelle-obligatoire-norme",
        )}
        <strong> {tIncendie("nf-s61-919")}</strong>
        {tIncendie(
          "conseils-sur-limplantation-remplacement-ou-rechargement-si-necessaire-au-bpu",
        )}
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
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
      <li className="list-check">
        {tIncendie(
          "pour-la-securite-de-tous-verification-annuelle-obligatoire-norme",
        )}
        <strong> {tIncendie("nf-s61-919")}</strong>
        {tIncendie(
          "conseils-sur-limplantation-remplacement-ou-rechargement-si-necessaire-au-bpu",
        )}
      </li>
    </ul>
  );

  return (
    <div
      className={`flex h-80 flex-col rounded-xl border border-slate-200 bg-slate-100 p-4 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
    >
      <div className="flex h-1/3 items-center gap-2 border-b border-slate-200 pb-2">
        <Dialog>
          <DialogTrigger asChild>{imgProduit}</DialogTrigger>
          <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {imgProduitDialog}
              <p className="text-end text-xs italic">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex h-full w-2/3 flex-col gap-1">
          <p className="text-sm font-bold">{nomFournisseur}</p>
          <Dialog>
            <DialogTrigger asChild>
              {logoUrl ? (
                <div className="relative h-10">
                  <Image
                    src={logoUrl}
                    alt={`logo-de-${nomFournisseur}`}
                    fill={true}
                    className="cursor-pointer object-contain object-left"
                    quality={100}
                  />
                </div>
              ) : null}
            </DialogTrigger>
            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{nomFournisseur}</DialogTitle>
              </DialogHeader>
              <FournisseurDialog
                sloganFournisseur={sloganFournisseur}
                logoUrl={logoUrl}
                nomFournisseur={nomFournisseur}
                locationUrl={locationUrl}
                anneeCreation={anneeCreation}
                ca={ca}
                effectif={effectifFournisseur}
                nbClients={nbClients}
                noteGoogle={noteGoogle}
                nbAvis={nbAvis}
              />
            </DialogContent>
          </Dialog>
          {noteGoogle && nbAvis && (
            <div className="flex items-center gap-1 text-xs">
              <p>{noteGoogle}</p>
              <StarRating score={noteGoogle ? parseFloat(noteGoogle) : 0} />
              <p>({nbAvis})</p>
            </div>
          )}
        </div>
      </div>
      <div
        className="flex h-2/3 justify-between pt-2"
        onClick={
          totalAnnuelTrilogie
            ? () => handleClickProposition(proposition)
            : undefined
        }
      >
        {infosProduit}
        <div className="flex w-1/3 flex-col items-end gap-2">
          {totalMensuelText}
          {totalAnnuelTrilogie ? (
            <Switch
              className={`${
                incendie.infos.fournisseurId === fournisseurId
                  ? "data-[state=checked]:bg-fm4alldestructive"
                  : ""
              }`}
              checked={incendie.infos.fournisseurId === fournisseurId}
              onCheckedChange={() => handleClickProposition(proposition)}
              title={t("selectionnez-cette-proposition")}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileCard;
