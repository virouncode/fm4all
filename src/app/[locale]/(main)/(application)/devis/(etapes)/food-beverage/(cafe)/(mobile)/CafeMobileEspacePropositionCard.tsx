import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
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
import { useCafeStore } from "@/stores/cafeStore";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

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
  const cafe = useCafeStore((s) => s.cafe);
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
      <Image
        src={imageUrl ?? "/img/services/cafe.webp"}
        alt={`illustration ${marque} ${modele}`}
        fill
        quality={100}
        className="cursor-pointer object-contain"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
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
          cafe.infos.fournisseurId === fournisseurId &&
          espace.infos.gammeCafeSelected === gamme &&
          totalAnnuel
            ? "ring-fm4alldestructive ring-4 ring-inset"
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
              {imgProduitDialog}
              <p className="text-end text-xs italic">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
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
