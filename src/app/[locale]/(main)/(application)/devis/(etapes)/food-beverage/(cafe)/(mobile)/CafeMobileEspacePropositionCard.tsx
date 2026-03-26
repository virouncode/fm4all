import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
import StarRating from "@/components/star/StarRating";
import { CarouselItem } from "@/components/ui/carousel";
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
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { CafePropositionItem } from "@/app/[locale]/(main)/(application)/devis/(etapes)/food-beverage/(cafe)/(desktop)/CafeEspacePropositionCard";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { useLocale, useTranslations } from "next-intl";
import PresignedTarifImage from "@/components/devis/PresignedTarifImage";
import Image from "next/image";

export type CafeMobilePropositionItem = CafePropositionItem;

type CafeMobileEspacePropositionCardProps = {
  proposition: CafeMobilePropositionItem;
  espace: CafeEspaceType;
  handleClickProposition: (proposition: CafeMobilePropositionItem) => void;
  handleClickFirstEspaceProposition: (proposition: CafeMobilePropositionItem) => void;
  cafeEspacesIds: number[];
};

const CafeMobileEspacePropositionCard = ({
  espace,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  proposition,
  cafeEspacesIds,
}: CafeMobileEspacePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const tGlobal = useTranslations("Global");
  const locale = useLocale();
  const cafe = useCafeStore((s) => s.cafe);
  const {
    gamme,
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
    totalAnnuel,
    totalInstallation,
    typeChocolat,
    typeLait,
    marque,
    modele,
    imageStorageKey,
    imageConsoStorageKey,
  } = proposition;
  const color = getFm4AllColor(gamme);

  const totalMensuelText = totalAnnuel ? (
    <p className="text-end text-sm font-bold">
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-end text-sm font-bold">
      {t("non-propose-pour-ces-criteres")}
    </p>
  );

  const prixInstallationText = totalInstallation ? (
    <p className="text-xs">
      + {formatNumber(totalInstallation * MARGE)} {t("eur-d-installation")}
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? tGlobal("essentiel")
        : gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const typeLaitText = !typeLait ? null : typeLait === "dosettes" ? (
    <li className="list-check">{tCafe("lait-en-dosettes")}</li>
  ) : typeLait === "frais" ? (
    <li className="list-check">{tCafe("lait-frais")}</li>
  ) : (
    <li className="list-check">{tCafe("lait-en-poudre-machine")}</li>
  );

  const typeChocolatText = !typeChocolat ? null : typeChocolat === "sachets" ? (
    <li className="list-check">{tCafe("chocolat-en-sachets")}</li>
  ) : (
    <li className="list-check">{tCafe("chocolat-en-poudre-machine")}</li>
  );

  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-200">
      <PresignedTarifImage
        storageKey={imageStorageKey}
        fallbackSrc="/img/services/cafe_machine_fallback.webp"
        alt={`illustration ${marque} ${modele}`}
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="flex items-center gap-2">
      <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
        <PresignedTarifImage
          storageKey={imageStorageKey}
          fallbackSrc="/img/services/cafe.webp"
          alt={`illustration ${marque} ${modele}`}
          sizes="(max-width:768px) 50vw"
        />
      </div>
      <span className="text-2xl font-bold text-slate-400">+</span>
      <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
        <PresignedTarifImage
          storageKey={imageConsoStorageKey}
          fallbackSrc="/img/services/cafe_conso_fallback.webp"
          alt="illustration consommables café"
          sizes="(max-width:768px) 50vw"
        />
      </div>
    </div>
  );

  const infosEssentiel = (
    <li className="list-check">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-conventionnel-dit-classique-blend")}
    </li>
  );
  const infosConfort = (
    <li className="list-check">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-superieur-100-arabica")}
    </li>
  );
  const infosExcellence = (
    <li className="list-check">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-de-specialite-premium-cafe-dexception-bio")}
    </li>
  );

  const infosProduit = (
    <ul className="mx-auto flex w-2/3 flex-col px-4 text-xs">
      {totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            {proposition.nbMachines} machine(s) {proposition.marque}{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}
          </li>
        ) : (
          <li className="list-check text-sm font-bold">
            {proposition.nbMachines} {proposition.marque} {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""} machine(s)
          </li>
        )
      ) : null}
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
      {typeLaitText}
      {typeChocolatText}
      <li className="list-check">
        {t("consommables")} {proposition.nbTassesParJ} {tCafe("tasses-j")}
      </li>
      <li className="list-check">
        Maintenance: {proposition.nbPassagesParAn} {t("passages-an")}
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      {totalAnnuel ? (
        locale === "fr" ? (
          <li className="list-check text-sm font-bold">
            {proposition.nbMachines} machine(s) {proposition.marque}{" "}
            {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""}
          </li>
        ) : (
          <li className="list-check text-sm font-bold">
            {proposition.nbMachines} {proposition.marque} {proposition.modele}{" "}
            {proposition.reconditionne ? t("reconditionnee-s") : ""} machine(s)
          </li>
        )
      ) : null}
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
      {typeLaitText}
      {typeChocolatText}
      <li className="list-check">
        {t("consommables")} {proposition.nbTassesParJ} {tCafe("tasses-j")}
      </li>
      <li className="list-check">
        Maintenance: {proposition.nbPassagesParAn} {t("passages-an")}
      </li>
    </ul>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex h-96 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          cafe.infos.entrepriseId === entrepriseId &&
          espace.infos.gammeCafeSelected === gamme &&
          totalAnnuel
            ? "ring-destructive ring-4 ring-inset"
            : ""
        }`}
      >
        <div className="flex h-1/2 items-center gap-2 border-b border-slate-200 pb-2">
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>{imgProduit}</DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                {imgProduitDialog}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
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
                      <Image
                        src={logoStorageKey}
                        alt={`logo-de-${nomPrestataire}`}
                        fill={true}
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
          className="flex h-1/2 justify-between pt-2"
          onClick={
            totalAnnuel
              ? () =>
                  cafeEspacesIds[0] === espace.infos.espaceId
                    ? handleClickFirstEspaceProposition(proposition)
                    : handleClickProposition(proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {totalMensuelText}
            {prixInstallationText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  espace.infos.gammeCafeSelected === gamme &&
                  cafe.infos.entrepriseId === proposition.entrepriseId
                    ? "data-[state=checked]:bg-destructive"
                    : ""
                }`}
                checked={
                  espace.infos.gammeCafeSelected === gamme &&
                  cafe.infos.entrepriseId === proposition.entrepriseId
                }
                onCheckedChange={() =>
                  cafeEspacesIds[0] === espace.infos.espaceId
                    ? handleClickFirstEspaceProposition(proposition)
                    : handleClickProposition(proposition)
                }
                title={t("selectionnez-cette-proposition")}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default CafeMobileEspacePropositionCard;
