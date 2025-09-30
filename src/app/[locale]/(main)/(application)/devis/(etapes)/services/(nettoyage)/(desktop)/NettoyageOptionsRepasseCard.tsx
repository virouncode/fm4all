import { setOffreDansPanierAction } from "@/actions/panierActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils/formatNumber";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useOptimistic, useTransition } from "react";

type NettoyageOptionsRepasseCardProps = {
  repasseProposition: {
    id: number;
    freqAnnuelle: number | undefined;
    hParPassage: number;
    prixAnnuel: number | null;
  } | null;
  color: string;
  selectedRepasseId?: string;
};

const NettoyageOptionsRepasseCard = ({
  repasseProposition,
  color,
  selectedRepasseId,
}: NettoyageOptionsRepasseCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const [selectedId, setSelectedId] = useOptimistic(selectedRepasseId);
  const [optimisticSelectedId, setOptimisticSelectedId] =
    useOptimistic(selectedRepasseId);
  const [isPending, startTransition] = useTransition();

  const totalMensuelText = repasseProposition?.prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-repasse">
      {formatNumber((repasseProposition.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">
      {tNettoyage(
        "non-propose-pour-une-frequence-inferieure-a-5-passages-semaine",
      )}
    </p>
  );

  const repasseHParSemaineText =
    repasseProposition && repasseProposition.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(
          (repasseProposition.hParPassage * repasseProposition.freqAnnuelle) /
            S_OUVREES_PAR_AN,
        )}{" "}
        {tNettoyage("h-semaine-en-plus")}
      </li>
    ) : null;
  const repasseNbPassagesParSemaineText =
    repasseProposition && repasseProposition.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(repasseProposition.freqAnnuelle / S_OUVREES_PAR_AN)}{" "}
        {t("passage-s-de")} {repasseProposition.hParPassage} {t("h-semaine")}
      </li>
    ) : null;
  const infosProduit = (
    <li className="list-check">
      {tNettoyage(
        "second-passage-dans-la-meme-journee-pour-entretenir-sanitaires-et-zones-sensibles",
      )}
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {tNettoyage("repasse-sanitaire")}
    </p>
  );

  const imgProduit = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain object-center"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const onToggle = async (id?: string) => {
    if (!id || isPending) return;
    const next = optimisticSelectedId === id ? undefined : id;
    startTransition(() => {
      setOptimisticSelectedId(next);
    });
    try {
      const res = await setOffreDansPanierAction({
        offreId: id,
        quantite: next ? 1 : 0,
        categorieId: "NettoyageRepasse",
      });
      setSelectedId(next);
      await fetch("/api/panier/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ panierId: res?.data?.panierId }),
        keepalive: true,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue, veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 border-b">
      <div className="flex w-1/4 items-center justify-center p-4 text-base">
        {tNettoyage("repasse-sanitaire")}
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          optimisticSelectedId === repasseProposition?.id?.toString()
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
        onClick={() => onToggle(repasseProposition?.id?.toString())}
      >
        {repasseProposition ? (
          <Switch
            checked={
              optimisticSelectedId === repasseProposition?.id?.toString()
            }
            onCheckedChange={() => onToggle(repasseProposition.id?.toString())}
            className="data-[state=checked]:bg-fm4alldestructive"
            title={t("selectionnez-cette-proposition")}
            data-testid="repasse-switch"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
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
                  {imgProduit}
                  <p className="text-end text-xs italic">
                    {t("photo-non-contractuelle")}
                  </p>
                  <ul className="mx-auto flex flex-col px-4 text-sm">
                    {infosProduit}
                    {repasseHParSemaineText}
                    {repasseNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="ml-4 flex max-w-72 flex-col text-xs">
            {infosProduit}
            {repasseHParSemaineText}
            {repasseNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsRepasseCard;
