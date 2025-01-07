import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import Personnaliser from "./Personnaliser";

const page = () => {
  return (
    <div>
      <Personnaliser />
      <DevisBreadcrumb currentStepId={4} />
    </div>
  );
};

export default page;
