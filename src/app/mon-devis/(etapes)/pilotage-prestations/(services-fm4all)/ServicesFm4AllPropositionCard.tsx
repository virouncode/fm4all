import { Checkbox } from "@/components/ui/checkbox";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type ServicesFm4AllPropositionCardProps = {
  proposition: {
    id: number;
    gamme: GammeType;
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "excellence" | "confort";
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }) => void;
  total: number;
};

const ServicesFm4AllPropositionCard = ({
  proposition,
  handleClickProposition,
  total,
}: ServicesFm4AllPropositionCardProps) => {
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const totalMensuelSansRemiseText = `${formatNumber(
    proposition.totalAnnuelSansRemise / 12
  )} € / mois`;
  const totalMensuelText = `${formatNumber(
    Math.round(proposition.totalAnnuel / 12)
  )} € / mois${proposition.remiseCa ? "\u00B9" : ""}${
    proposition.remiseHof ? "\u00B2" : ""
  }`;

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        servicesFm4All.infos.gammeSelected === gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      } ${!total ? "opacity-50 pointer-events-none" : ""}`}
      key={proposition.id}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={servicesFm4All.infos.gammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
        disabled={!total}
        aria-label="Sélectionner cette proposition"
      />
      <div>
        {proposition.totalAnnuelSansRemise !== proposition.totalAnnuel && (
          <p className="font-bold line-through">{totalMensuelSansRemiseText}</p>
        )}
        <p className="font-bold">{totalMensuelText}</p>
        {gamme === "essentiel" && (
          <ul className="ml-6">
            <li className="text-xs list-disc">Accès Services</li>
            <li className="text-xs list-disc">Frais bancaires & Assurance</li>
            <li className="text-xs list-disc">Garanties contractuelles</li>
            <li className="text-xs list-disc">Facturation centralisée</li>
            <li className="text-xs list-disc">
              Service Support en ligne en ligne (24/48h)
            </li>
          </ul>
        )}
        {gamme === "confort" && (
          <ul className="ml-6">
            <li className="text-xs list-disc">Accès Services</li>
            <li className="text-xs list-disc">Frais bancaires & Assurance</li>
            <li className="text-xs list-disc">Garanties contractuelles</li>
            <li className="text-xs list-disc">Facturation centralisée</li>
            <li className="text-xs list-disc">
              Service Support en ligne en ligne (24/48h)
            </li>
            <li className="text-xs list-disc">
              Service support opérationnel téléphonique
            </li>
            <li className="text-xs list-disc">
              Suivi de la réalisation des interventions
            </li>
            <li className="text-xs list-disc">Reporting personnalisé</li>
          </ul>
        )}
        {gamme === "excellence" && (
          <ul className="ml-6">
            <li className="text-xs list-disc">Accès Services</li>
            <li className="text-xs list-disc">Frais bancaires & Assurance</li>
            <li className="text-xs list-disc">Garanties contractuelles</li>
            <li className="text-xs list-disc">Facturation centralisée</li>
            <li className="text-xs list-disc">
              Service Support en ligne en ligne (24/48h)
            </li>
            <li className="text-xs list-disc">
              Service support opérationnel téléphonique
            </li>
            <li className="text-xs list-disc">
              Suivi de la réalisation des interventions
            </li>
            <li className="text-xs list-disc">Reporting personnalisé</li>
            <li className="text-xs list-disc">Account Manager dédié</li>
            <li className="text-xs list-disc">Conseils achats / audit</li>
            <li className="text-xs list-disc">
              Lien avec le propriétaire / Property Manager
            </li>
            <li className="text-xs list-disc">Audit opérationnel</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ServicesFm4AllPropositionCard;
