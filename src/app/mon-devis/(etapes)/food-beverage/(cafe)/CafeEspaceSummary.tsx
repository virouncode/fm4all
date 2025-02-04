import { CafeEspaceType } from "@/zod-schemas/cafe";

type CafeEspaceSummaryProps = {
  espace: CafeEspaceType;
};

const CafeEspaceSummary = ({ espace }: CafeEspaceSummaryProps) => {
  return (
    <p className="font-bold text-center mb-4">
      Espace n°{espace.infos.espaceId}
      {espace.infos.gammeCafeSelected && (
        <span className="font-normal">
          {" "}
          : {espace.quantites.nbMachines} machine(s) {espace.infos.marque}{" "}
          {espace.infos.modele}, café {espace.infos.gammeCafeSelected}
        </span>
      )}
    </p>
  );
};

export default CafeEspaceSummary;
