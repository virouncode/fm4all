import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import AfficherDevis from "./AfficherDevis";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <AfficherDevis />
        <DevisBreadcrumb currentStepId={5} />
      </DevisProgressProvider>
    </div>
  );
};

export default page;
