import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import Personnaliser from "./Personnaliser";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <Personnaliser />
        <DevisBreadcrumb currentStepId={4} />
      </DevisProgressProvider>
    </div>
  );
};

export default page;
