import DPGFHygiene from "./DPGFHygiene";
import DPGFNettoyage from "./DPGFNettoyage";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string; service: string }>;
}) => {
  const { fournisseurId, service } = await params;
  switch (service) {
    case "nettoyage":
      return <DPGFNettoyage fournisseurId={parseInt(fournisseurId)} />;
    case "hygiene":
      return <DPGFHygiene fournisseurId={parseInt(fournisseurId)} />;
    default:
      return <div>Service not found</div>;
  }
};

export default page;
