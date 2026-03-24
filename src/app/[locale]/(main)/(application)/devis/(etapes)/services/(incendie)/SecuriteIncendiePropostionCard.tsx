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
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type SecuriteIncendiePropostionCardProps = {
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

const SecuriteIncendiePropostionCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendiePropostionCardProps) => {
  const t = useTranslations("DevisPage");
  const tIncendie = useTranslations("DevisPage.services.incendie");
  const incendie = useIncendieStore((s) => s.incendie);
  const { totalAnnuelTrilogie, fraisDeplacementTrilogie } = proposition;

  if (!totalAnnuelTrilogie)
    return (
      <div className="flex w-3/4 cursor-pointer items-center justify-center gap-4 bg-slate-100 p-4 text-xl">
        {t("non-propose")}
      </div>
    );
  const totalMensuelText = (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-incendie">
      {formatNumber(
        ((totalAnnuelTrilogie + fraisDeplacementTrilogie) * MARGE) / 12,
      )}{" "}
      {t("euros-mois")}
    </p>
  );
  const infosProduit = (
    <ul className="flex flex-col px-4 text-sm">
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
    </ul>
  );

  const infosText = (
    <p className="text-sm">
      {tIncendie(
        "pour-la-securite-de-tous-verification-annuelle-obligatoire-norme",
      )}
      <strong> {tIncendie("nf-s61-919")}</strong>
      {tIncendie(
        "conseils-sur-limplantation-remplacement-ou-rechargement-si-necessaire-au-bpu",
      )}
    </p>
  );

  const dialogTitle = (
    <p className="text-center">{tIncendie("securite-incendie")}</p>
  );

  const imgProduit = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de securité incendie`}
        fill
        className="cursor-pointer object-contain object-center"
        sizes="(min-width:768px) 33vw"
      />
    </div>
  );

  return (
    <div
      className={`flex w-3/4 cursor-pointer items-center justify-center gap-4 bg-slate-100 p-4 text-xl ${
        incendie.infos.entrepriseId === proposition.entrepriseId
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={incendie.infos.entrepriseId === proposition.entrepriseId}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid="incendie-switch"
      />
      <div>
        <div className="flex items-center gap-2">
          {totalMensuelText}
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                <Info
                  size={16}
                  className="cursor-pointer"
                />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {infosText}
                  {imgProduit}
                  <p className="text-end text-xs italic">
                    {t("photo-non-contractuelle")}
                  </p>
                  {infosProduitDialog}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
