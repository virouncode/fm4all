import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import SauvegarderProgression from "./SauvegarderProgression";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <SauvegarderProgression />
        <DevisBreadcrumb currentStepId={3} />
      </DevisProgressProvider>
    </div>
  );
};

export default page;
