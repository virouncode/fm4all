import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import SauvegarderProgression from "./SauvegarderProgression";

const page = () => {
  return (
    <div>
      <SauvegarderProgression />
      <DevisBreadcrumb currentStepId={3} />
    </div>
  );
};

export default page;
