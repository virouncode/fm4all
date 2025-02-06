import { Checkbox } from "@/components/ui/checkbox";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type OfficeManagerPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
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
  const totalMensuelText = `${formatNumber(
    Math.round(proposition.totalAnnuel / 12)
  )} € / mois*`;
  const demiJParSemaineText =
    proposition.demiJParSemaine !== null
      ? `${proposition.demiJParSemaine / 2} j / semaine`
      : "";
  const tooltipEssentiel = (
    <div className="flex flex-col">
      <p className="text-sm">Essentiel, Facility Manager : </p>
      <ul className="text-sm ml-10">
        <li className="list-disc">Coordination technique des locaux</li>
        <li className="list-disc">Suivi sous-traitants</li>
        <li className="list-disc">Contrôle et gestion prestataires</li>
        <li className="list-disc">Lien avec fm4all</li>
        <li className="list-disc">
          Lien avec propriétaire, Property ou Asset Manager
        </li>
      </ul>
    </div>
  );

  const tooltipConfort = (
    <div className="flex flex-col">
      <p className="text-sm">Confort: Essentiel + Office Management :</p>
      <ul className="text-sm ml-10">
        <li className="list-disc">Gestion des contrats de services tiers</li>
        <li className="list-disc">Accueil des locaux</li>
        <li className="list-disc">Support administratif aux équipes</li>
        <li className="list-disc">
          Gestion des logiciels internes (badges, flotte automobile, etc.)
        </li>
      </ul>
    </div>
  );

  const tooltipExcellence = (
    <div className="flex flex-col">
      {/* <p className="text-center text-sm">Excellence</p> */}
      <p className="text-sm">
        Excellence : Confort + Hospitality & Happiness Management :{" "}
      </p>
      <ul className="text-sm ml-10">
        <li className="list-disc">
          Animation du site (orga events, déj, soirées)
        </li>
        <li className="list-disc">Onboarding nouveaux collaborateurs</li>
        <li className="list-disc">
          Création d&apos;un environnement travail positif
        </li>
        <li className="list-disc">Gestion de l’expérience utilisateur</li>
      </ul>
    </div>
  );

  const tooltip =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? tooltipEssentiel
        : proposition.demiJParSemaine < demiJParSemaineExcellence
        ? tooltipConfort
        : tooltipExcellence
      : "";

  return (
    // <TooltipProvider delayDuration={0}>
    //   <Tooltip>
    //     <TooltipTrigger asChild>
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        officeManager.infos.fournisseurId === proposition.fournisseurId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={
          officeManager.infos.fournisseurId === proposition.fournisseurId &&
          officeManager.infos.gammeSelected !== null
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{totalMensuelText}</p>
        <p className="text-sm">{demiJParSemaineText}</p>
        {officeManager.infos.premium && (
          <p className="text-sm">
            Profil premium : Anglais ou exp.longue, logiciel, compta, ADV ou ADC
          </p>
        )}
        <p className="text-sm">
          Présent {officeManager.infos.remplace ? "52" : "47"} semaines / an
        </p>
        {tooltip}
      </div>
    </div>
    //     </TooltipTrigger>
    //     <TooltipContent className="max-w-60">{tooltip}</TooltipContent>{" "}
    //   </Tooltip>
    // </TooltipProvider>
  );
};

export default OfficeManagerPropositionCard;
