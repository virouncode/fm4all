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

type NettoyageOptionsDimancheCardProps = {
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
    hParPassage: number;
  };
  color: string;
  selectedDimancheId?: string;
};

const NettoyageOptionsDimancheCard = ({
  dimancheProposition,
  color,
  selectedDimancheId,
}: NettoyageOptionsDimancheCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");

  const [selectedId, setSelectedId] = useOptimistic(selectedDimancheId);
  const [optimisticSelectedId, setOptimisticSelectedId] =
    useOptimistic(selectedDimancheId);
  const [isPending, startTransition] = useTransition();

  const dimanchePrixMensuelText = dimancheProposition.prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-dimanche">
      {formatNumber((dimancheProposition?.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">{t("non-propose")}</p>
  );

  const dimancheNbPassagesParSemaineText = (
    <li className="list-check">
      {t("1-passage-de")} {dimancheProposition.hParPassage}{" "}
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
      {tNettoyage("nettoyage-supplementaire-tous-les-dimanches")}
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
        categorieId: "NettoyageDimanche",
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
        {tNettoyage("nettoyage-supplementaire-tous-les-dimanches")}
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          optimisticSelectedId === dimancheProposition.id.toString()
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
        onClick={() => onToggle(dimancheProposition.id?.toString())}
      >
        {dimancheProposition.prixAnnuel ? (
          <Switch
            checked={optimisticSelectedId === dimancheProposition.id.toString()}
            onCheckedChange={() => onToggle(dimancheProposition.id?.toString())}
            className="data-[state=checked]:bg-fm4alldestructive"
            title={t("selectionnez-cette-proposition")}
            data-testid="dimanche-switch"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            {dimanchePrixMensuelText}
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
                    {dimancheNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="ml-4 flex flex-col text-xs">
            {infosProduit}
            {dimancheNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsDimancheCard;
