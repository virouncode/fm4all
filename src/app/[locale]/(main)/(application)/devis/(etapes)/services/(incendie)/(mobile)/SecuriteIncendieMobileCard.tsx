import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
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
import { formatNumber } from "@/lib/utils/formatNumber";
import { useIncendieStore } from "@/stores/devis/incendieStore";
import { useTranslations } from "next-intl";

import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import Image from "next/image";

type SecuriteIncendieMobileCardProps = {
  proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
  const incendie = useIncendieStore((s) => s.incendie);
  const {
    entrepriseId,
    nomPrestataire,
    sloganPrestataire,
    logoStorageKey,
    anneeCreation,
    ca,
    effectifPrestataire,
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative mx-auto h-60 w-full rounded-lg border border-slate-200 bg-slate-100">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill
        className="object-contain"
        sizes="(max-width:768px) 100vw"
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
      className={`flex h-72 flex-col rounded-xl border border-slate-200 bg-slate-100 p-4 ${
        incendie.infos.entrepriseId === proposition.entrepriseId
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
    >
      <div className="flex h-1/3 items-center gap-2 border-b border-slate-200 pb-2">
        <div onClick={(e) => e.stopPropagation()}>
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
        </div>
        <div className="flex h-full w-2/3 flex-col gap-1">
          <p className="text-sm font-bold">{nomPrestataire}</p>
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                {logoStorageKey ? (
                  <div className="relative h-10">
                    <PresignedLogoImage
                      storageKey={logoStorageKey}
                      alt={`logo-de-${nomPrestataire}`}
                      className="cursor-pointer object-contain object-left"
                      sizes="(max-width:768px) 100vw"
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{nomPrestataire}</DialogTitle>
                </DialogHeader>
                <PrestataireDialog
                  sloganPrestataire={sloganPrestataire}
                  logoStorageKey={logoStorageKey}
                  nomPrestataire={nomPrestataire}
                  locationUrl={null}
                  anneeCreation={anneeCreation}
                  ca={ca}
                  effectifPrestataire={effectifPrestataire}
                  nbClients={nbClients}
                  noteGoogle={noteGoogle}
                  nbAvis={nbAvis}
                />
              </DialogContent>
            </Dialog>
          </div>
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
                incendie.infos.entrepriseId === entrepriseId
                  ? "data-[state=checked]:bg-destructive"
                  : ""
              }`}
              checked={incendie.infos.entrepriseId === entrepriseId}
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
