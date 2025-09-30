import { setOffreDansPanierAction } from "@/actions/panierActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils/formatNumber";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useOptimistic, useTransition } from "react";

type NettoyageOptionsSamediCardProps = {
  samediProposition: {
    id: number;
    prixAnnuel: number;
    hParPassage: number;
  };
  color: string;
  selectedSamediId?: string;
};

const NettoyageOptionsSamediCard = ({
  samediProposition,
  color,
  selectedSamediId,
}: NettoyageOptionsSamediCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");

  const [selectedId, setSelectedId] = useOptimistic(selectedSamediId);
  const [optimisticSelectedId, setOptimisticSelectedId] =
    useOptimistic(selectedSamediId);
  const [isPending, startTransition] = useTransition();

  const samediPrixMensuelText = samediProposition.prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-samedi">
      {formatNumber((samediProposition?.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">{t("non-propose")}</p>
  );

  const samediNbPassagesParSemaineText = (
    <li className="list-check">
      {t("1-passage-de")} {samediProposition.hParPassage}{" "}
      {tNettoyage("h-semaine-en-plus")}
    </li>
  );
  const infosProduit = (
    <li className="list-check">
      {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
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
    const prev = optimisticSelectedId;
    startTransition(() => {
      setOptimisticSelectedId(next);
    });
    try {
      const res = await setOffreDansPanierAction({
        offreId: id,
        quantite: next ? 1 : 0,
        categorieId: "NettoyageSamedi",
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
      <div className="flex w-1/4 items-center justify-center p-4 text-center text-base">
        {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          optimisticSelectedId === samediProposition.id.toString()
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
        onClick={() => onToggle(samediProposition.id.toString())}
      >
        {samediProposition.prixAnnuel ? (
          <Switch
            checked={optimisticSelectedId === samediProposition.id.toString()}
            onCheckedChange={() => onToggle(samediProposition.id.toString())}
            className="data-[state=checked]:bg-fm4alldestructive"
            title={t("selectionnez-cette-proposition")}
            data-testid="samedi-switch"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            {samediPrixMensuelText}
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
                    {samediNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="ml-4 flex flex-col text-xs">
            {infosProduit}
            {samediNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsSamediCard;
