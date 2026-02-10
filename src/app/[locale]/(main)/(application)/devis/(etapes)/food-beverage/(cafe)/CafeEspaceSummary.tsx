import { CafeEspaceType } from "@/zod-schemas/cafe.schema";

type CafeEspaceSummaryProps = {
  espace: CafeEspaceType;
};

const CafeEspaceSummary = ({ espace }: CafeEspaceSummaryProps) => {
  return (
    <p className="mb-4 text-center font-bold">
      Espace café n°{espace.infos.espaceId}
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
