import { FireExtinguisher } from "lucide-react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import SecuriteIncendiePropositions from "./SecuriteIncendiePropositions";

type SecuriteIncendieProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const SecuriteIncendie = ({
  handleClickNext,
  handleClickPrevious,
}: SecuriteIncendieProps) => {
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center flex-1">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <FireExtinguisher />
            <p>Securité Incendie</p>
          </div>
          <p className="text-base italic w-2/3">
            Extincteurs, blocs autonomes d&apos;éclairage de sécurité (BAES),
            télécommande BAES, laissez nos experts vérifier vos installations.
          </p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        <SecuriteIncendiePropositions />
      </div>
      <p className="text-sm italic text-end px-1">
        *frais de déplacement inclus, pas de déclinaison en gammes car service
        réglementaire
      </p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default SecuriteIncendie;
