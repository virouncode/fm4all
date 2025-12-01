import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
import { Button } from "@/components/ui/button";
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
import { useTotalNettoyageStore } from "@/stores/totalNettoyageStore";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { useShallow } from "zustand/shallow";

type NettoyageMobileOptionsVitrerieCardProps = {
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
  handleClickVitrerieProposition: (proposition: {
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

const NettoyageMobileOptionsVitrerieCard = ({
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageMobileOptionsVitrerieCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const { nettoyage, setNettoyage } = useNettoyageStore(
    useShallow((s) => ({
      nettoyage: s.nettoyage,
      setNettoyage: s.setNettoyage,
    })),
  );
  const setTotalNettoyage = useTotalNettoyageStore((s) => s.setTotalNettoyage);
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const vitreriePrixMensuelText = vitrerieProposition.prixAnnuel ? (
    <p className="text-end text-sm font-bold">
      {formatNumber((vitrerieProposition.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-end text-xs font-bold">{t("non-propose")}</p>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? tGlobal("essentiel")
        : gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );
  const nbPassagesVitrerieText = (
    <li className="list-check">
      {nettoyage.quantites.nbPassagesVitrerie} {t("passages-an")}
    </li>
  );

  const infosProduit = (
    <ul className="flex w-2/3 flex-col px-4 text-xs">
      <li className="list-check">
        {tNettoyage("vitres-et-cloisons-accessibles-de-plain-pied")}
      </li>
      {nbPassagesVitrerieText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      <li className="list-check">
        {tNettoyage("vitres-et-cloisons-accessibles-de-plain-pied")}
      </li>
      {nbPassagesVitrerieText}
    </ul>
  );

  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );
  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain object-center"
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );

  const handleDecrement = () => {
    let newNbPassageVitrerie = nettoyage.quantites.nbPassagesVitrerie - 1;
    if (newNbPassageVitrerie < 0) newNbPassageVitrerie = 0;
    setNettoyage((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPassagesVitrerie: newNbPassageVitrerie,
      },
    }));
    const totalVitrerie =
      nettoyage.infos.vitrerieSelected &&
      nettoyage.quantites.surfaceCloisons !== null &&
      nettoyage.quantites.cadenceCloisons !== null &&
      nettoyage.quantites.surfaceVitres !== null &&
      nettoyage.quantites.cadenceVitres !== null &&
      nettoyage.prix.tauxHoraireVitrerie !== null &&
      nettoyage.prix.minFacturationVitrerie !== null
        ? newNbPassageVitrerie *
          Math.max(
            (nettoyage.quantites.surfaceCloisons /
              nettoyage.quantites.cadenceCloisons +
              nettoyage.quantites.surfaceVitres /
                nettoyage.quantites.cadenceVitres) *
              nettoyage.prix.tauxHoraireVitrerie,
            nettoyage.prix.minFacturationVitrerie,
          )
        : null;
    setTotalNettoyage((prev) => ({
      ...prev,
      totalVitrerie,
    }));
  };
  const handleIncrement = () => {
    let newNbPassageVitrerie = nettoyage.quantites.nbPassagesVitrerie + 1;
    if (newNbPassageVitrerie > MAX_PASSAGES_VITRERIE)
      newNbPassageVitrerie = MAX_PASSAGES_VITRERIE;
    setNettoyage((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPassagesVitrerie: newNbPassageVitrerie,
      },
    }));
    const totalVitrerie =
      nettoyage.infos.vitrerieSelected &&
      nettoyage.quantites.surfaceCloisons !== null &&
      nettoyage.quantites.cadenceCloisons !== null &&
      nettoyage.quantites.surfaceVitres !== null &&
      nettoyage.quantites.cadenceVitres !== null &&
      nettoyage.prix.tauxHoraireVitrerie !== null &&
      nettoyage.prix.minFacturationVitrerie !== null
        ? newNbPassageVitrerie *
          Math.max(
            (nettoyage.quantites.surfaceCloisons /
              nettoyage.quantites.cadenceCloisons +
              nettoyage.quantites.surfaceVitres /
                nettoyage.quantites.cadenceVitres) *
              nettoyage.prix.tauxHoraireVitrerie,
            nettoyage.prix.minFacturationVitrerie,
          )
        : null;
    setTotalNettoyage((prev) => ({
      ...prev,
      totalVitrerie,
    }));
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">{tNettoyage("lavage-vitrerie")}</p>
      <p>
        {t("indiquez-le-nombre-de")} <strong>{t("passages-par-an")}</strong>{" "}
        :{" "}
      </p>
      <div className="flex w-full flex-col gap-2 p-1">
        <Label htmlFor="nbDePassagesVitrerie" className="text-sm">
          {t("nombre-de-passages-an")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nettoyage.quantites.nbPassagesVitrerie || ""}
            min={1}
            max={MAX_PASSAGES_VITRERIE}
            step={1}
            onChange={handleChangeNbPassageVitrerie}
            className={`w-16 ${
              nettoyage.quantites.nbPassagesVitrerie === 2
                ? "text-destructive"
                : ""
            }`}
          />
          <Button
            variant="outline"
            title={t("diminuer-le-nombre-de-passages")}
            onClick={handleDecrement}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={t("augmenter-le-nombre-de-passages")}
            onClick={handleIncrement}
          >
            <Plus />
          </Button>
        </div>

        <p className="text-destructive text-xs italic">
          {t(
            "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
          )}
        </p>
      </div>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.vitrerieSelected && vitrerieProposition.prixAnnuel
            ? "ring-destructive ring-4 ring-inset"
            : ""
        }`}
      >
        <div className="flex h-1/2 items-center gap-2 border-b border-slate-200 pb-2">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
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
            {vitrerieProposition.prixAnnuel ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoUrl ? (
                      <div className="relative h-10">
                        <Image
                          src={nettoyage.infos.logoUrl}
                          alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                          fill
                          className="cursor-pointer object-contain object-left"
                          sizes="(max-width:768px) 100vw"
                        />
                      </div>
                    ) : null}
                  </DialogTrigger>
                  <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {nettoyage.infos.nomFournisseur}
                      </DialogTitle>
                    </DialogHeader>
                    <FournisseurDialog
                      sloganFournisseur={vitrerieProposition.slogan}
                      logoUrl={vitrerieProposition.logoUrl}
                      nomFournisseur={vitrerieProposition.nomFournisseur}
                      locationUrl={vitrerieProposition.locationUrl}
                      anneeCreation={vitrerieProposition.anneeCreation}
                      ca={vitrerieProposition.ca}
                      effectif={vitrerieProposition.effectif}
                      nbClients={vitrerieProposition.nbClients}
                      noteGoogle={vitrerieProposition.noteGoogle}
                      nbAvis={vitrerieProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {vitrerieProposition.noteGoogle &&
                  vitrerieProposition.nbAvis && (
                    <div className="flex items-center gap-1 text-xs">
                      <p>{vitrerieProposition.noteGoogle}</p>
                      <StarRating
                        score={
                          vitrerieProposition.noteGoogle
                            ? parseFloat(vitrerieProposition.noteGoogle)
                            : 0
                        }
                      />
                      <p>({vitrerieProposition.nbAvis})</p>
                    </div>
                  )}
              </>
            ) : nettoyage.infos.logoUrl ? (
              <div className="relative h-10">
                <Image
                  src={nettoyage.infos.logoUrl}
                  alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                  fill
                  className="cursor-pointer object-contain object-left"
                  sizes="(max-width:768px) 100vw"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="flex h-1/2 justify-between gap-6 pt-2"
          onClick={() => handleClickVitrerieProposition(vitrerieProposition)}
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {vitreriePrixMensuelText}
            {vitrerieProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.vitrerieSelected
                    ? "data-[state=checked]:bg-destructive"
                    : ""
                }`}
                checked={nettoyage.infos.vitrerieSelected}
                onCheckedChange={() =>
                  handleClickVitrerieProposition(vitrerieProposition)
                }
                title={t("selectionnez-cette-proposition")}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NettoyageMobileOptionsVitrerieCard;
