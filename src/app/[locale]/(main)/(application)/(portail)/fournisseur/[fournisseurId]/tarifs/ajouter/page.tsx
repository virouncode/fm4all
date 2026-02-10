import { getServicesForFournisseur } from "@/server/queries_a_classer/services/getServices";
import AddServicesTarifForm from "./AddServicesTarifForm";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string }>;
}) => {
  const { fournisseurId } = await params;
  const services = await getServicesForFournisseur(parseInt(fournisseurId));

  return (
    <main className="mx-auto mb-24 max-w-7xl flex-1 px-6 py-4 hyphens-auto md:px-6">
      <section className="mt-2">
        <h1 className="mb-10 text-4xl">Mes tarifs</h1>
        <h2 className="mb-10 text-xl">Ajouter un/des service(s)</h2>
        <AddServicesTarifForm
          fournisseurServices={services?.map((service) => service.nom)}
          fournisseurId={parseInt(fournisseurId)}
        />
      </section>
    </main>
  );
};

export default page;
