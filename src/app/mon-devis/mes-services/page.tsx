import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import MesServices from "./MesServices";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <MesServices />
      </DevisProgressProvider>
      <DevisBreadcrumb currentStepId={2} />
    </div>
  );
};

export default page;
