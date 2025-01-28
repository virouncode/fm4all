import { CafeLotType } from "@/zod-schemas/cafe";

type CafeLotSummaryProps = {
  lot: CafeLotType;
};

const CafeLotSummary = ({ lot }: CafeLotSummaryProps) => {
  return (
    <p className="font-bold text-center mb-4">
      Lot n°{lot.infos.lotId}
      {lot.infos.gammeCafeSelected && (
        <span className="font-normal">
          {" "}
          : {lot.quantites.nbMachines} machine(s) {lot.infos.marque}{" "}
          {lot.infos.modele}, café {lot.infos.gammeCafeSelected}
        </span>
      )}
    </p>
  );
};

export default CafeLotSummary;
