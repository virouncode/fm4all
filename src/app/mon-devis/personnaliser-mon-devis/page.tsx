import DevisProgressProvider from "@/context/DevisProgressProvider";
import DevisBreadcrumb from "../../../components/devis/DevisBreadcrumb";
import Personnaliser from "./Personnaliser";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <Personnaliser />
      </DevisProgressProvider>
      <DevisBreadcrumb currentStepId={4} />
    </div>
  );
};

export default page;
