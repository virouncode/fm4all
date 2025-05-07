import { getSession } from "@/lib/auth-session";
import DPGFNettoyage from "./DPGFNettoyage";
import DPGFHygiene from "./DPGFHygiene";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: number; service: string }>;
}) => {
  const { fournisseurId, service } = await params;
  const session = await getSession();

  if (session?.user.fournisseurId !== Number(fournisseurId)) {
    return <div>Unauthorized</div>;
  }
  if (!fournisseurId) {
    return <div>Fournisseur ID not found</div>;
  }

  switch (service) {
    case "nettoyage":
      return <DPGFNettoyage fournisseurId={fournisseurId} />;
    case "hygiene":
      return <DPGFHygiene fournisseurId={fournisseurId} />;
    default:
      return <div>Service not found</div>;
  }
};

export default page;
