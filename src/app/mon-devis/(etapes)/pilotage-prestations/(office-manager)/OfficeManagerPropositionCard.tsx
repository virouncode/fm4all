import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

type OfficeManagerPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }) => void;
  demiJParSemaineConfort: number | null;
  demiJParSemaineExcellence: number | null;
};

const OfficeManagerPropositionCard = ({
  proposition,
  handleClickProposition,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
}: OfficeManagerPropositionCardProps) => {
  const { officeManager } = useContext(OfficeManagerContext);
  const color =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? "fm4allessential"
        : proposition.demiJParSemaine < demiJParSemaineExcellence
        ? "fm4allcomfort"
        : "fm4allexcellence"
      : "";

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4`}
      >
        Non proposé
      </div>
    );
  }
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))} €/mois*
    </p>
  );

  const demiJParSemaineText =
    proposition.demiJParSemaine !== null ? (
      <li className="list-check">
        {proposition.demiJParSemaine / 2} j / semaine
      </li>
    ) : null;

  const presenceText = (
    <li className="list-check">
      Présent {officeManager.infos.remplace ? "52" : "47"} semaines / an
    </li>
  );

  const premiumText = officeManager.infos.premium ? (
    <li className="list-check">
      Profil premium : Anglais ou exp.longue, logiciel, compta, ADV ou ADC
    </li>
  ) : null;

  const infosEssentiel = (
    <>
      <li className="list-check">Coordination technique des locaux</li>
      <li className="list-check">Suivi sous-traitants</li>
      <li className="list-check">Contrôle et gestion prestataires</li>
      <li className="list-check">Lien avec fm4all</li>
      <li className="list-check">
        Lien avec propriétaire, Property ou Asset Manager
      </li>
    </>
  );

  const infosConfort = (
    <>
      <li className="list-check">Tous les services de la gamme Essentiel</li>
      <li className="list-check">Gestion des contrats de services tiers</li>
      <li className="list-check">Accueil des locaux</li>
      <li className="list-check">Support administratif aux équipes</li>
      <li className="list-check">
        Gestion des logiciels internes (badges, flotte automobile, etc.)
      </li>
    </>
  );

  const infosExcellence = (
    <>
      <li className="list-check">Tous les services de la gamme Confort</li>
      <li className="list-check">
        Animation du site (orga events, déj, soirées)
      </li>
      <li className="list-check">Onboarding nouveaux collaborateurs</li>
      <li className="list-check">
        Création d&apos;un environnement travail positif
      </li>
      <li className="list-check">Gestion de l’expérience utilisateur</li>
    </>
  );

  const infosProduit =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? infosEssentiel
        : proposition.demiJParSemaine < demiJParSemaineExcellence
        ? infosConfort
        : infosExcellence
      : null;

  const dialogTitle =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null ? (
      <p className={`text-${color} text-center`}>
        {proposition.demiJParSemaine < demiJParSemaineConfort
          ? "Essentiel"
          : proposition.demiJParSemaine < demiJParSemaineExcellence
          ? "Confort"
          : "Excellence"}
      </p>
    ) : null;

  const imgProduit = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/office-managers.webp"}
        alt={`illustration d'office managers`}
        fill={true}
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        officeManager.infos.fournisseurId === proposition.fournisseurId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          officeManager.infos.fournisseurId === proposition.fournisseurId &&
          officeManager.infos.gammeSelected !== null
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
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
                <p className="text-xs italic text-end">
                  *photo non contractuelle
                </p>
                <ul className="flex flex-col text-sm px-4 mx-auto">
                  {demiJParSemaineText}
                  {presenceText}
                  {premiumText}
                  {infosProduit}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="flex flex-col text-xs ml-4">
          {demiJParSemaineText}
          {presenceText}
          {premiumText}
          {infosProduit}
        </ul>
      </div>
    </div>
  );
};

export default OfficeManagerPropositionCard;
