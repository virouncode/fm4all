import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import SauvegarderProgression from "./SauvegarderProgression";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <SauvegarderProgression />
      </DevisProgressProvider>
      <DevisBreadcrumb currentStepId={3} />
    </div>
  );
};

export default page;
