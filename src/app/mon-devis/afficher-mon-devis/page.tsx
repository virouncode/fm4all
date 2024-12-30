import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import AfficherDevis from "./AfficherDevis";

const page = () => {
  return (
    <div>
      <DevisProgressProvider>
        <AfficherDevis />
      </DevisProgressProvider>
      <DevisBreadcrumb currentStepId={5} />
    </div>
  );
};

export default page;
