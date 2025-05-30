import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
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
import { CafeContext } from "@/context/CafeProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type CafeMobileEspacePropositionCardProps = {
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  };
  espace: CafeEspaceType;
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  handleClickFirstEspaceProposition: (proposition: {
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
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
  const { cafe } = useContext(CafeContext);
  const {
    gamme,
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
    totalAnnuel,
    totalInstallation,
    typeChocolat,
    typeLait,
    marque,
    modele,
    imageUrl,
  } = proposition;
  const color = getFm4AllColor(gamme);

  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold text-end">
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold text-end">
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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-200">
      <Image
        src={imageUrl ?? "/img/services/cafe.webp"}
        alt={`illustration ${marque} ${modele}`}
        fill
        quality={100}
        className="object-contain cursor-pointer"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={imageUrl ?? "/img/services/cafe.webp"}
        alt={`illustration ${marque} ${modele}`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  );

  const infosEssentiel = (
    <li className="list-check font-bold">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-conventionnel-dit-classique-blend")}
    </li>
  );
  const infosConfort = (
    <li className="list-check font-bold">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-superieur-100-arabica")}
    </li>
  );
  const infosExcellence = (
    <li className="list-check font-bold">
      {proposition.infos
        ? proposition.infos
        : tCafe("cafe-de-specialite-premium-cafe-dexception-bio")}
    </li>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto w-2/3">
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
    <ul className="flex flex-col text-sm px-4 mx-auto">
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
        className={`bg-${color} flex flex-col h-96 border border-slate-200 rounded-xl p-4 text-white  ${
          cafe.infos.fournisseurId === fournisseurId &&
          espace.infos.gammeCafeSelected === gamme &&
          totalAnnuel
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {imgProduitDialog}
              <p className="text-xs italic text-end">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">{nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="h-10 relative">
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="object-contain object-left cursor-pointer"
                      quality={100}
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
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
          className="flex h-1/2 pt-2 justify-between"
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
          <div className="flex flex-col gap-2 items-end w-1/3">
            {totalMensuelText}
            {prixInstallationText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  espace.infos.gammeCafeSelected === gamme &&
                  cafe.infos.fournisseurId === proposition.fournisseurId
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  espace.infos.gammeCafeSelected === gamme &&
                  cafe.infos.fournisseurId === proposition.fournisseurId
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
