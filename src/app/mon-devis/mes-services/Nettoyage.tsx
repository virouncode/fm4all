import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type NettoyageProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: NettoyageProps) => {
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-4" id="1">
      <div className="flex justify-between items-center">
        <p className="text-lg">
          Nettoyage : pour x m2, nous conseillons une...
        </p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="flex-1 flex flex-col border rounded-xl">
        <div className="flex h-1/3 border-b">
          <div className="flex w-1/4 items-center justify-center">
            Entreprise 1
          </div>
          <div className="flex w-1/4 bg-fm4allessential text-slate-200 items-center justify-center">
            Essentiel
          </div>
          <div className="flex w-1/4 bg-fm4allcomfort text-slate-200 items-center justify-center">
            Confort
          </div>
          <div className="flex w-1/4 bg-fm4allexcellence text-slate-200 items-center justify-center">
            Excellence
          </div>
        </div>
        <div className="flex h-1/3 border-b">
          <div className="flex w-1/4 items-center justify-center">
            Entreprise 2
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
            Essentiel
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
            Confort
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
            Excellence
          </div>
        </div>
        <div className="flex h-1/3 border-b">
          <div className="flex w-1/4 items-center justify-center">
            Entreprise 3
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allessential text-slate-200">
            Essentiel
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allcomfort text-slate-200">
            Confort
          </div>
          <div className="flex w-1/4 items-center justify-center bg-fm4allexcellence text-slate-200">
            Excellence
          </div>
        </div>
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 1 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Nettoyage;
