import { setOffreDansPanierAction } from "@/actions/panierActions";
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
import { toast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useClientStore } from "@/stores/clientStore";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useOptimistic, useState, useTransition } from "react";

type NettoyageOptionsVitrerieCardProps = {
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
  } | null;
  color: string;
  selectedVitrerieId?: string;
  selectedNbPassagesVitrerie?: number;
};

const NettoyageOptionsVitrerieCard = ({
  vitrerieProposition,
  color,
  selectedVitrerieId,
  selectedNbPassagesVitrerie,
}: NettoyageOptionsVitrerieCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const client = useClientStore((state) => state.client);

  const [selectedId, setSelectedId] = useOptimistic(selectedVitrerieId);
  const [optimisticSelectedId, setOptimisticSelectedId] =
    useOptimistic(selectedVitrerieId);

  const [nbPassagesVitrerie, setNbPassagesVitrerie] = useState(
    selectedNbPassagesVitrerie ?? 2,
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNbPassagesVitrerie(selectedNbPassagesVitrerie ?? 2);
  }, [selectedNbPassagesVitrerie]);

  const prixAnnuel =
    client.surfaceCloisons && client.surfaceVitres && vitrerieProposition
      ? nbPassagesVitrerie *
        Math.max(
          (client.surfaceCloisons / vitrerieProposition.cadenceCloisons +
            client.surfaceVitres / vitrerieProposition.cadenceVitres) *
            vitrerieProposition.tauxHoraire +
            vitrerieProposition.fraisDeplacement,
          vitrerieProposition.minFacturation,
        )
      : null;

  const vitreriePrixMensuelText = prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-vitrerie">
      {formatNumber((prixAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">{t("non-propose")}</p>
  );
  const nbPassagesVitrerieText = (
    <li className="list-check">
      {nbPassagesVitrerie} {t("passages-an")}
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
        quantite: next ? nbPassagesVitrerie : 0,
        categorieId: "NettoyageVitrerie",
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

  const handleChangeNbPassageVitrerie = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = parseInt(e.target.value);
    setNbPassagesVitrerie(value);

    if (!selectedVitrerieId) return;
    try {
      await setOffreDansPanierAction({
        offreId: selectedVitrerieId,
        quantite: value,
        categorieId: "NettoyageVitrerie",
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
      <div className="flex w-1/4 items-center justify-center p-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          {tNettoyage("lavage-vitrerie")}
          <div className="flex w-full items-center justify-center gap-4">
            <Input
              type="number"
              value={nbPassagesVitrerie}
              min={1}
              max={MAX_PASSAGES_VITRERIE}
              step={1}
              onChange={handleChangeNbPassageVitrerie}
              className={`w-16 ${
                nbPassagesVitrerie === 2 ? "text-fm4alldestructive" : ""
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
          optimisticSelectedId === vitrerieProposition?.id?.toString()
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
        onClick={() => onToggle(vitrerieProposition?.id?.toString())}
      >
        {prixAnnuel ? (
          <Switch
            checked={
              optimisticSelectedId === vitrerieProposition?.id?.toString()
            }
            onCheckedChange={() =>
              onToggle(vitrerieProposition?.id?.toString())
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
