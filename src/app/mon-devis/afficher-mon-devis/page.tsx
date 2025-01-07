import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import AfficherDevis from "./AfficherDevis";

const page = () => {
  return (
    <div>
      <AfficherDevis />
      <DevisBreadcrumb currentStepId={5} />
    </div>
  );
};

export default page;
