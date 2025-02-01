import { Checkbox } from "@/components/ui/checkbox";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
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
    prixTotalAnnuel: number;
    prixTotalAnnuelSansRemise: number;
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
    prixTotalAnnuel: number;
    prixTotalAnnuelSansRemise: number;
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
  const prixTotalMensuelSansRemiseText = `${Math.round(
    proposition.prixTotalAnnuelSansRemise / 12
  )} € / mois`;
  const prixTotalMensuelText = `${Math.round(
    proposition.prixTotalAnnuel / 12
  )} € / mois${proposition.remiseCa ? "\u00B9" : ""}${
    proposition.remiseHof ? "\u00B2" : ""
  }`;

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        servicesFm4All.infos.gammeSelected === gamme
          ? "ring-4 ring-inset ring-destructive"
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
      />
      <div>
        {proposition.prixTotalAnnuelSansRemise !==
          proposition.prixTotalAnnuel && (
          <p className="font-bold line-through">
            {prixTotalMensuelSansRemiseText}
          </p>
        )}
        <p className="font-bold">{prixTotalMensuelText}</p>
        {gamme === "essentiel" && (
          <>
            <p className="text-sm">Accès Services</p>
            <p className="text-sm">Plateforme fm4All</p>
            <p className="text-sm">Frais bancaires & Assurance</p>
            <p className="text-sm">Garanties contractuelles</p>
            <p className="text-sm">Service support administratif</p>
            <p className="text-sm">Suivi administratif des contrats</p>
            <p className="text-sm">Facturation centralisée</p>
            <p className="text-sm">Gestion des tickets en ligne (24/48h)</p>
          </>
        )}
        {gamme === "confort" && (
          <>
            <p className="text-sm">Tout Essentiel +</p>
            <p className="text-sm">Gestion des partenaires fm4all</p>
            <p className="text-sm">Planification des interventions</p>
            <p className="text-sm">Suivi de la réalisation des interventions</p>
            <p className="text-sm">Reporting personnalisé</p>
            <p className="text-sm">
              Service support opérationnel téléphonique (1 pour 50 clients env.)
            </p>
          </>
        )}
        {gamme === "excellence" && (
          <>
            <p className="text-sm">Tout Confort +</p>
            <p className="text-sm">+10 utilisateurs</p>
            <p className="text-sm">Account Manager dédié</p>
            <p className="text-sm">Conseils achats / audit</p>
            <p className="text-sm">
              Lien avec le propriétaire / Property Manager / Asset Manager
            </p>
            <p className="text-sm">Audit opérationnel</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesFm4AllPropositionCard;
